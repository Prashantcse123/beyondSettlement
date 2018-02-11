module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    accountNumber: DataTypes.STRING,
    programName: DataTypes.STRING,
    tradelineName: DataTypes.STRING,
    // creditorId: DataTypes.INTEGER,
    csCreditorName: DataTypes.STRING,
    // enrolledStateId: DataTypes.INTEGER,
    avgMonthlyPayment: DataTypes.INTEGER,
    accountDelinquency: DataTypes.INTEGER,
    currentFund: DataTypes.INTEGER,
    m0Bal: DataTypes.INTEGER,
    m1Bal: DataTypes.INTEGER,
    m2Bal: DataTypes.INTEGER,
    m3Bal: DataTypes.INTEGER,
    m4Bal: DataTypes.INTEGER,
    m5Bal: DataTypes.INTEGER,
    m6Bal: DataTypes.INTEGER,
    m7Bal: DataTypes.INTEGER,
    m9Bal: DataTypes.INTEGER,
    m10Bal: DataTypes.INTEGER,
    m11Bal: DataTypes.INTEGER,
    m12Bal: DataTypes.INTEGER,
    maxTerm: DataTypes.INTEGER,
    maxTermFundAccumulation: DataTypes.INTEGER,
    enrolledDebt: DataTypes.INTEGER,
    verifiedBalance: DataTypes.INTEGER,
    originalBalance: DataTypes.INTEGER, // NOTE: ﻿Merilytics - Current debt pulled from "Balance" field of ClientCred table
    currentBalance: DataTypes.INTEGER,
    // currentAccountStatusId: DataTypes.INTEGER,
    tradelineLastWorkedOn: DataTypes.DATE,
  });

  Account.associate = (models) => {

    models.Account.belongsTo(models.Creditor, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'creditorId',
        allowNull: false,
      },
    });

    models.Account.belongsTo(models.State, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'enrolledStateId',
        allowNull: false,
      },
    });

    models.Account.belongsTo(models.AccountStatus, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'currentAccountStatusId',
        allowNull: false,
      },
    });

  };

  return Account;
};
