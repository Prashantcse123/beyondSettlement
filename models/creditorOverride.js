module.exports = (sequelize, DataTypes) => {
  const CreditorOverride = sequelize.define('CreditorOverride', {
    // creditorId: DataTypes.INTEGER,
    // productTypeId: DataTypes.INTEGER,
    accountNumberFlag: DataTypes.BOOLEAN,
    rangeFlag: DataTypes.INTEGER,
    concat: DataTypes.STRING,
    prePctSettlementRate: DataTypes.INTEGER,
    preSettlementTerm: DataTypes.INTEGER,
    preMinimumMonthlyPay: DataTypes.INTEGER,
    postPctSettlementRate: DataTypes.INTEGER,
    postSettlementTerm: DataTypes.INTEGER,
    postMinimumMonthlyPay: DataTypes.INTEGER,
  });

  CreditorOverride.associate = (models) => {

    models.CreditorOverride.belongsTo(models.Creditor, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'creditorId',
        allowNull: false,
      },
    });

    models.CreditorOverride.belongsTo(models.ProductType, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'productTypeId',
        allowNull: false,
      },
    });

  };

  return CreditorOverride;
};
