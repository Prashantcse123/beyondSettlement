const models = require('../../models/index');
const calculationsHelper = require('./calculationsHelper');

const eligibleAccountsCalculations = {

    /// External Interface ----------------------------------------------------------------------------------------------

    setData: () => {
        let init = Promise.all([
            eligibleAccountsCalculations.importScorecardRecords(),
            eligibleAccountsCalculations.importActiveAccounts()
        ]);

        return new Promise((resolve, reject) =>
            init.then(() => {
                let records = eligibleAccountsCalculations._scorecardRecords;

                calculationsHelper.calculateAllRows(eligibleAccountsCalculations, 'Eligibility', models.ScorecardRecord, records, 'update')
                    .then(() => resolve('Eligibility Calculations Success! :)'))
                    .catch(() => resolve('Eligibility Calculations Error! :('))
            })
        );
    },

    /// Internal Service Functions --------------------------------------------------------------------------------------

    importScorecardRecords: () => {
        let minAccountRanks = {};       /// e.g: { 'P-1312': 2, 'P-2312': 1 }
        let accountRepeats = [];        /// e.g: [ { 'P-1312': 1, 'P-1312': 2, 'P-2255': 1, 'P-1312': 3 } ] note: ordered by index
        let accountRepeatCounters = {}; /// e.g: { 'P-1312': 2, 'P-2312': 1 } note: last repeat count for each program name
        let scoreRepeats = [];          /// note: ordered by index
        let scoreRepeatCounters = {};   /// note: last repeat count for each program name

        return new Promise(resolve =>
            models.ScorecardRecord.findAll({order: [['totalScore', 'DESC'], ['creditor', 'ASC']]}).then(results => {
                /// set min account ranking , account repeats by index & score repeats by index (score repeats are for ranking system)
                results.forEach((scorecardRec, i) => {
                    let rank = i + 1;
                    let programName = [scorecardRec.programName];
                    let val = minAccountRanks[programName];

                    if (!val) {
                        minAccountRanks[programName] = rank;
                        accountRepeatCounters[programName] = 1;
                        scoreRepeatCounters[programName] = 1;
                    }else{
                        if (minAccountRanks[programName] > rank) {
                            minAccountRanks[programName] = rank;
                        }
                        accountRepeatCounters[programName]++;
                        scoreRepeatCounters[programName]++;
                    }

                    accountRepeats.push({[programName]: accountRepeatCounters[programName]});
                    scoreRepeats.push({[programName]: scoreRepeatCounters[programName]});
                });

                eligibleAccountsCalculations._scorecardRecords  = results;
                eligibleAccountsCalculations._minAccountRanks   = minAccountRanks;
                eligibleAccountsCalculations._accountRepeats    = accountRepeats;
                eligibleAccountsCalculations._scoreRepeats      = scoreRepeats;

                resolve();
            }));
    },

    importActiveAccounts: () => {
        return new Promise(resolve =>
            models.ImportedActiveAccount.findAll({raw: true}).then(results => {
                eligibleAccountsCalculations._accounts = results;
                resolve();
            }));
    },

    columns: {

        /// Summary
        rank: (scorecardRecord) => {
            return new Promise(resolve => {
                // let index = eligibleAccountsCalculations._scorecardRecords.indexOf(scorecardRecord);
                // let repeatCount = eligibleAccountsCalculations._scoreRepeats[index][scorecardRecord.programName];
                //
                // resolve(index + repeatCount);
                //
                // // let preRank = index + 1;
                // // let sameScoreCount = eligibleAccountsCalculations._scorecardRecords.filter(record =>
                // //     record.totalScore === scorecardRecord.totalScore).length;

                resolve(
                    eligibleAccountsCalculations._scorecardRecords.indexOf(scorecardRecord) + 1
                );
            });
        },

        /// Account Eligibility Ranking
        minAccountRank: (scorecardRecord) => {
            return new Promise(resolve => {
                resolve(
                    eligibleAccountsCalculations._minAccountRanks[scorecardRecord.programName]
                );
            });
        },
        accountRepeatCountByIndex: (scorecardRecord) => {
            return new Promise(resolve => {
                let index = eligibleAccountsCalculations._scorecardRecords.indexOf(scorecardRecord);
                let repeatCount = eligibleAccountsCalculations._accountRepeats[index][scorecardRecord.programName];

                if (!repeatCount) {
                    throw 'Something strange happened, there is no program name ("' + scorecardRecord.programName + '") for that index';
                }

                resolve(
                    eligibleAccountsCalculations._accountRepeats[index][scorecardRecord.programName]
                );
            });
        },
        calculatedCreditScore: (scorecardRecord) => {
            return new Promise(resolve => {
                let result;
                let activeAccountRecord = eligibleAccountsCalculations._accounts.filter(account =>
                    account.tradelinename === scorecardRecord.tradeLineName)[0];
                let creditScore = (activeAccountRecord.credit_score || 5);

                try {
                    if (activeAccountRecord.account_status.toLowerCase() === 'legal demand letter') {
                        // console.log('creditorscore ===>>', creditScore, scorecardRecord.tradeLineName);
                        result = 50 - creditScore - 21;
                    }else if (activeAccountRecord.account_status.toLowerCase() === 'cancelled termsif') {
                        result = 50 - creditScore - 11;
                    }else{
                        result = 50 - creditScore
                    }

                }catch(ex) {
                    result = null;
                }

                resolve(result);
            });

  },
        concatenatedIndex: (scorecardRecord) => {
            return new Promise(resolve => {
                let result;
                let promises = [
                    eligibleAccountsCalculations.columns.minAccountRank(scorecardRecord),
                    eligibleAccountsCalculations.columns.accountRepeatCountByIndex(scorecardRecord),
                    eligibleAccountsCalculations.columns.calculatedCreditScore(scorecardRecord)
                ];

                Promise.all(promises).then(results => {
                    let minAccountRank = results[0];
                    let accountRepeatCountByIndex = results[1];
                    let calculatedCreditScore = results[2];
                    let activeAccountRecord = eligibleAccountsCalculations._accounts.filter(account =>
                        account.tradelinename === scorecardRecord.tradeLineName)[0];
                    let isEligible = activeAccountRecord.eligibility === 'eligible';

                    try {
                        if (calculatedCreditScore > 9) {
                            if (accountRepeatCountByIndex > 9) {
                                result = String(minAccountRank) + String(calculatedCreditScore) + String(accountRepeatCountByIndex);
                            }else{
                                result = String(Number(String(minAccountRank) + String(calculatedCreditScore)) * 10) + String(accountRepeatCountByIndex);
                            }
                        }else{
                            if (accountRepeatCountByIndex > 9) {
                                result = String(minAccountRank * 10) + String(calculatedCreditScore) + String(accountRepeatCountByIndex);
                            }else{
                                result = String(Number(String(minAccountRank * 10) + String(calculatedCreditScore)) * 10) + String(accountRepeatCountByIndex);
                            }
                        }

                        result = Number(result);

                        if (!isEligible) { result += 50 }

                    } catch(ex) {
                        result = null;
                    }

                    resolve(result);

                });
            });
        }
    }
};

module.exports = eligibleAccountsCalculations;