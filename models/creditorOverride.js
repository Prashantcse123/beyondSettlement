module.exports = (sequelize, DataTypes) => {
  const CreditorOverride = sequelize.define('CreditorOverride', {
    // creditorId: DataTypes.INTEGER,
    // productTypeId: DataTypes.INTEGER,
    creditor: DataTypes.STRING,
    productType: DataTypes.STRING,
    accountNumberFlag: DataTypes.BOOLEAN,
    rangeFlag: DataTypes.INTEGER,
    concat: DataTypes.STRING,

    /// ﻿Pre Charge-Off
    prePctSettlementRate: DataTypes.INTEGER,
    preSettlementTerm: DataTypes.INTEGER,
    preMinimumMonthlyPay: DataTypes.STRING,

    /// ﻿Post Charge-Off
    postPctSettlementRate: DataTypes.INTEGER,
    postSettlementTerm: DataTypes.INTEGER,
    postMinimumMonthlyPay: DataTypes.STRING,
  });

  // CreditorOverride.associate = (models) => {
  //
  //   models.CreditorOverride.belongsTo(models.Creditor, {
  //     onDelete: 'CASCADE',
  //     foreignKey: {
  //       name: 'creditorId',
  //       allowNull: false,
  //     },
  //   });
  //
  //   models.CreditorOverride.belongsTo(models.ProductType, {
  //     onDelete: 'CASCADE',
  //     foreignKey: {
  //       name: 'productTypeId',
  //       allowNull: false,
  //     },
  //   });
  //
  // };

  return CreditorOverride;
};
