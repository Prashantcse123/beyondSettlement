module.exports = (sequelize, DataTypes) => {
  const Creditor = sequelize.define('Creditor', {
    creditorName: DataTypes.STRING,
    preAvgPctSettlement: DataTypes.INTEGER,
    preSettlementTerm: DataTypes.INTEGER,
    preMinPay: DataTypes.INTEGER,
    preDataPoints: DataTypes.INTEGER,
    preHistoryOptionId: DataTypes.INTEGER,
    postAvgPctSettlement: DataTypes.INTEGER,
    postSettlementTerm: DataTypes.INTEGER,
    postMinPay: DataTypes.INTEGER,
    postDataPoints: DataTypes.INTEGER,
    postHistoryOptionId: DataTypes.INTEGER,
  });

  Creditor.associate = function (models) {
    models.Creditor.hasMany(models.Account, {foreignKey: 'creditorId'});
    models.Creditor.hasMany(models.CreditorOverride, {foreignKey: 'creditorId'});
  };

  return Creditor;
};
