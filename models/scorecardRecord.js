module.exports = (sequelize, DataTypes) => {
    const ScorecardRecord = sequelize.define('ScorecardRecord', {

        /// Metadata
        tradeLineName: DataTypes.STRING,
        programName: DataTypes.STRING,
        creditor: DataTypes.STRING,
        eligibility: DataTypes.STRING,
        // accountNumber: DataTypes.STRING,

        /// Metrics
        metrics_creditorScore: DataTypes.INTEGER,
        metrics_stateOfResidency: DataTypes.STRING,
        metrics_monthlyPayment: DataTypes.INTEGER,
        metrics_accountDelinquency: DataTypes.INTEGER,
        metrics_pctAvgSettlement: DataTypes.FLOAT,
        metrics_settlementTerm: DataTypes.INTEGER,
        metrics_firstMonthFeeFundPct: DataTypes.FLOAT,
        metrics_feeEstimate: DataTypes.FLOAT,
        metrics_accountStatus: DataTypes.STRING,
        metrics_enrolledDebt: DataTypes.FLOAT,

        /// Assigned Points
        points_creditorScore: DataTypes.INTEGER,
        points_stateOfResidency: DataTypes.INTEGER,
        points_monthlyPayment: DataTypes.INTEGER,
        points_accountDelinquency: DataTypes.INTEGER,
        points_pctAvgSettlement: DataTypes.INTEGER,
        points_settlementTerm: DataTypes.INTEGER,
        points_firstMonthFeeFundPct: DataTypes.INTEGER,
        points_feeEstimate: DataTypes.INTEGER,
        points_accountStatus: DataTypes.INTEGER,
        points_enrolledDebt: DataTypes.INTEGER,


        /// ﻿Weighted Score
        weight_creditorScore: DataTypes.INTEGER,
        weight_stateOfResidency: DataTypes.INTEGER,
        weight_monthlyPayment: DataTypes.INTEGER,
        weight_accountDelinquency: DataTypes.INTEGER,
        weight_pctAvgSettlement: DataTypes.INTEGER,
        weight_settlementTerm: DataTypes.INTEGER,
        weight_firstMonthFeeFundPct: DataTypes.INTEGER,
        weight_feeEstimate: DataTypes.INTEGER,
        weight_accountStatus: DataTypes.INTEGER,
        weight_enrolledDebt: DataTypes.INTEGER,

        /// Summary
        totalScore: DataTypes.INTEGER,
        rank: DataTypes.INTEGER,

        /// Account Eligibility Ranking
        minAccountRank: DataTypes.INTEGER,
        accountRepeatCountByIndex: DataTypes.INTEGER,
        calculatedCreditScore: DataTypes.INTEGER,
        concatenatedIndex: DataTypes.INTEGER,

        /// Operative
        isDone: DataTypes.BOOLEAN,
    });

    return ScorecardRecord;
};
