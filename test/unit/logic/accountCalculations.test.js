const expect = require('expect.js');

describe('calculations', () => {
  before(() => this.accountCalculationsLogic = require('../../../logic/calculations/old/accountCalculations'));

  describe('account', () => {
    // before(() => this.accountCalculationsLogic.importActiveAccounts());
    before(() => this.accountCalculationsLogic.importCreditors());
    before(() => this.accountCalculationsLogic.importCreditorOverrides());

    it('test column calc_accountDelinquency', () => {
      let rawAccount = {};

      // / programname is empty
      rawAccount = {
        id: 36543,
        programname: '',
        tradelinename: 'TL-00040351',
        creditor: 'Lowes',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_accountDelinquency(rawAccount)
        .then((result) => {
          expect(result).to.be(null);
        });

      // / programname is not empty
      // / creditor is 'Capital One' (factor is -30 with factor condition)
      // / account_deliquency is 59 and is not falling into factor condition (is bigger then 0 after reducing 30)
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_accountDelinquency(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(0);
        });

      // / programname is not empty
      // / creditor is 'Capital One' (factor is -30 with factor condition)
      // / account_deliquency is 22 and is falling into factor condition (is smaller then 0 after reducing 30)
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '22',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_accountDelinquency(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(-8);
        });

      // / programname is not empty
      // / creditor is 'Barclays' (factor is 60 without factor condition)
      // / account_deliquency is 29
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Barclays',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '29',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_accountDelinquency(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(89);
        });

      // / programname is not empty
      // / creditor is 'Lending Club' (factor is 90 without factor condition)
      // / account_deliquency is 29
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Lending Club',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '29',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_accountDelinquency(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(119);
        });

      // / programname is not empty
      // / creditor is 'Prosper' (factor is 120 without factor condition)
      // / account_deliquency is 29
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Prosper',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '29',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_accountDelinquency(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(149);
        });

      // / programname is not empty
      // / creditor is 'Best Egg' (factor is 150 without factor condition)
      // / account_deliquency is 29
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Best Egg',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '29',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_accountDelinquency(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(179);
        });

      // / programname is not empty
      // / creditor is 'Absolute Resolution LLC' (no factor)
      // / account_deliquency is 29
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Absolute Resolution LLC',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '29',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_accountDelinquency(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(29);
        });
    });

    it('test column calc_currentBalance', () => {
      let rawAccount = {};

      // / programname is empty string
      rawAccount = {
        id: 36543,
        programname: '',
        tradelinename: 'TL-00040351',
        creditor: 'Lowes',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_currentBalance(rawAccount)
        .then((result) => {
          expect(result).to.be(null);
        });

      // / programname not empty string
      // / currentbalance is null
      // / originalbalance is 1746
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Lowes',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_currentBalance(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(1746);
        });

      // / programname not empty string
      // / currentbalance is 850
      // / originalbalance is 1746
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Lowes',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: 850,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.calc_currentBalance(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(850);
        });
    });

    it('test column rangesFlag', () => {
      let rawAccount = {};

      // / creditor is not 'Capital One'
      rawAccount = {
        id: 36543,
        programname: '',
        tradelinename: 'TL-00040351',
        creditor: 'Lowes',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be(null);
        });

      // / creditor is 'Capital One'
      // / originalbalance is bigger then currentbalance
      // / originalbalance is smaller then 500
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(2);
        });

      // / creditor is 'Capital One'
      // / originalbalance is bigger then currentbalance
      // / originalbalance is smaller then 1000
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 900,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(3);
        });

      // / creditor is 'Capital One'
      // / originalbalance is bigger then currentbalance
      // / originalbalance is smaller then 2000
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1900,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(4);
        });

      // / creditor is 'Capital One'
      // / originalbalance is bigger then currentbalance
      // / originalbalance is smaller then 5000
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 4900,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(5);
        });

      // / creditor is 'Capital One'
      // / originalbalance is bigger then currentbalance
      // / originalbalance is smaller then 6000
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 5900,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(6);
        });

      // / creditor is 'Capital One'
      // / originalbalance is bigger then currentbalance
      // / originalbalance is bigger then 6000
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 6100,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(7);
        });
    });

    it('test column multipleProductsFlag', () => {
      let rawAccount = {};

      // / creditor is 'Capital One'
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be(null);
        });

      // / creditor is 'US BANK'
      // / account_number is '8192-4156-3180-24' (length is bigger then 16)
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'US BANK',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(1);
        });

      // / creditor is 'Wells Fargo'
      // / account_number is '8192-4156' (length is smaller then 16)
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Wells Fargo',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.rangesFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(0);
        });
    });

    it('test generic function endOfMonthPct', () => {
      let rawAccount = {};

      // / m0_bal is 1350
      // / currentbalance is null
      // / originalbalance is 1746
      // / [CALCULATED] calc_currentBalance is 1746
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.endOfCurrentMonth(rawAccount, 'm0_bal')
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(0.7734020618556701);
        });

      // / m0_bal is 1350
      // / currentbalance is null
      // / originalbalance is 1746
      // / [CALCULATED] calc_currentBalance is 850
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: 850,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.endOfCurrentMonth(rawAccount, 'm0_bal')
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(1.5886588235294117);
        });

      // / m0_bal is 1350
      // / currentbalance is null
      // / originalbalance is 0
      // / [CALCULATED] calc_currentBalance is 0 (will cause a division by 0 exception)
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 0,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.endOfCurrentMonth(rawAccount, 'm0_bal')
        .then((result) => {
          expect(result).to.be(null);
        });
    }); // note: this is a generic function that represents ﻿Fund Accumulation columns (endOfCurrentMonth, monthOut1, etc...)

    it('test generic function creditorReprocess.reprocessColumnWithOverride', () => {
      let rawAccount = {};

      // / creditor is 'Lowes' (has creditor override)
      // / [CALCULATED] calc_accountDelinquency is null
      // / [CALCULATED] rangesFlag is null
      // / [CALCULATED] multipleProductsFlag is 1746
      // / originalbalance is 1746
      // / [CALCULATED] calc_currentBalance is 1746

      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.creditorReprocess.reprocessColumnWithOverride(rawAccount, 'AvgPctSettlement', 'PctSettlementRate', 0.6)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(0.7734020618556701);
        });
    }); // note: this is a generic function that represents creditorReprocess columns (avgPctSettlement, settlementTerm, minPayment)

    it('test column minOfFunds', () => {
      let rawAccount = {};

      // / currentbalance is null
      // / originalbalance is 1746
      // / [CALCULATED] calc_currentBalance is 1746
      // / [CALCULATED] monthOut2 is 1.5468041237113401
      // / [CALCULATED] monthOut3 is 1.9335051546391753
      // / [CALCULATED] monthOut4 is 2.3202061855670104
      // / [CALCULATED] monthOut5 is 2.7069072164948453
      // / [CALCULATED] monthOut6 is 3.0936082474226803
      // / [CALCULATED] monthOut7 is 3.4803092783505156
      // / [CALCULATED] monthOut8 is 3.8670103092783505
      // / [CALCULATED] monthOut9 is 4.253711340206185
      // / [CALCULATED] monthOut10 is 4.640412371134021
      // / [CALCULATED] monthOut11 is 5.027113402061856
      // / [CALCULATED] monthOut12 is 5.413814432989691


      // / [CALCULATED] creditorReprocess.avgPctSettlement is 5.413814432989691
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 1746,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.minOfFunds(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(0.7731958762886598);
        });
    });

    it('test column notSettlePreChargeOffFlag', () => {
      let rawAccount = {};

      // / creditor is 'Best Egg'
      // / [CALCULATED] calc_accountDelinquency is 209 (bigger then 180)
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.notSettlePreChargeOffFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(0);
        });

      // / creditor is 'Capital One' (falling into relevant creditors condition)
      // / [CALCULATED] calc_accountDelinquency is 0 (smaller then 180)
      // / [CALCULATED] rangesFlag is 2
      // / [CALCULATED] multipleProductsFlag is null
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'Capital One',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.notSettlePreChargeOffFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(1);
        });

      // / creditor is 'US BANK' and is not falling into relevant concat creditors condition because rangesFlag + multipleProductsFlag is not 0
      // / [CALCULATED] calc_accountDelinquency is 0 (smaller then 180)
      // / [CALCULATED] rangesFlag is null
      // / [CALCULATED] multipleProductsFlag is 1
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'US BANK',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.notSettlePreChargeOffFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(0);
        });

      // / creditor is 'Wells Fargo' and is falling into relevant concat creditors condition because rangesFlag + multipleProductsFlag is 0 (Wells Fargo0)
      // / [CALCULATED] calc_accountDelinquency is 0 (smaller then 180)
      // / [CALCULATED] rangesFlag is null
      // / [CALCULATED] multipleProductsFlag is 0
      rawAccount = {
        id: 36543,
        programname: 'P-2445',
        tradelinename: 'TL-00040351',
        creditor: 'US BANK',
        enrolledstate: 'IN',
        avg_monthly_payment: '675.1800',
        account_deliquency: '59',
        fund_in_cft: '675.1800',
        m0_bal: '1350.3600',
        m1_bal: '2025.5400',
        m2_bal: '2700.7200',
        m3_bal: '3375.9000',
        m4_bal: '4051.0800',
        m5_bal: '4726.2600',
        m6_bal: '5401.4400',
        m7_bal: '6076.6200',
        m8_bal: '6751.8000',
        m9_bal: '7426.9800',
        m10_bal: '8102.1600',
        m11_bal: '8777.3400',
        m12_bal: '9452.5200',
        max_term: 0,
        max_term_fund_accumulation: '1350.3600',
        enrolled_debt: '35447.0000',
        verifiedbalance: null,
        originalbalance: 400,
        currentbalance: null,
        currentstage: 'New',
        tradeline_last_negotiated: null,
        account_number: '8192-4156-3180-24',
      };
      this.accountCalculationsLogic.columns.notSettlePreChargeOffFlag(rawAccount)
        .then((result) => {
          expect(result).to.be.a('number');
          expect(result).to.be(1);
        });
    });
  });
});
