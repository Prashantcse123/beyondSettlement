module.exports = (sequelize, DataTypes) => {
    const Scorecard = sequelize.define('Scorecard', {

        /// Metadata
        tradeLineName: DataTypes.STRING,
        programName: DataTypes.STRING,
        creditor: DataTypes.STRING,
        accountNumber: DataTypes.STRING,

        /// Metrics
        metrics_creditorScore: DataTypes.INTEGER,
        metrics_stateOfResidency: DataTypes.STRING,
        metrics_monthlyPayment: DataTypes.INTEGER,
        metrics_accountDelinquency: DataTypes.INTEGER,
        metrics_pctAvgSettlement: DataTypes.FLOAT,
        metrics_settlementTerm: DataTypes.INTEGER,
        metrics_fundAccumulation_endOfCurrentMonth: DataTypes.FLOAT,
        metrics_fundAccumulationPct_endOfCurrentMonth: DataTypes.FLOAT,
        metrics_fundAccumulationPct_1_monthOut: DataTypes.FLOAT,
        metrics_fundAccumulationPct_2_monthOut: DataTypes.FLOAT,
        metrics_fundAccumulationPct_3_monthOut: DataTypes.FLOAT,
        metrics_fundAccumulationPct_4_monthOut: DataTypes.FLOAT,
        metrics_fundAccumulationPct_5_monthOut: DataTypes.FLOAT,
        metrics_fundAccumulationPct_6_monthOut: DataTypes.FLOAT,
        metrics_accountStatus: DataTypes.STRING,
        metrics_enrolledDebt: DataTypes.FLOAT,

        /// Assigned Points
        points_creditorScore: DataTypes.INTEGER,
        points_stateOfResidency: DataTypes.INTEGER,
        points_monthlyPayment: DataTypes.INTEGER,
        points_accountDelinquency: DataTypes.INTEGER,
        points_pctAvgSettlement: DataTypes.INTEGER,
        points_settlementTerm: DataTypes.INTEGER,
        points_accountStatus: DataTypes.INTEGER,
        points_enrolledDebt: DataTypes.INTEGER,

        /// ﻿Weighted Score
        weight_creditorScore: DataTypes.INTEGER,
        weight_stateOfResidency: DataTypes.INTEGER,
        weight_monthlyPayment: DataTypes.INTEGER,
        weight_accountDelinquency: DataTypes.INTEGER,
        weight_pctAvgSettlement: DataTypes.INTEGER,
        weight_settlementTerm: DataTypes.INTEGER,
        weight_accountStatus: DataTypes.INTEGER,
        weight_enrolledDebt: DataTypes.INTEGER,

        /// Summary
        totalScore: DataTypes.INTEGER,
        rank: DataTypes.INTEGER,

        /// Operative
        isDone: DataTypes.BOOLEAN,

    });

    return Scorecard;
};
