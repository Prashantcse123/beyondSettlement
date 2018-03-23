module.exports = (sequelize, DataTypes) => {
  const Creditor = sequelize.define('Creditor', {
    name: DataTypes.STRING,
    numActive: DataTypes.INTEGER,
    numEnrolled: DataTypes.INTEGER,
    numTransferred: DataTypes.INTEGER,
    numSettled: DataTypes.INTEGER,
    type: DataTypes.STRING,
    score: DataTypes.INTEGER,
    preAvgPctSettlement: DataTypes.FLOAT,
    preSettlementTerm: DataTypes.INTEGER,
    preMinPayment: DataTypes.STRING,
    preDataPoints: DataTypes.STRING,
    // preHistoryOptionId: DataTypes.INTEGER,
    postAvgPctSettlement: DataTypes.FLOAT,
    postSettlementTerm: DataTypes.INTEGER,
    postMinPayment: DataTypes.STRING,
    postDataPoints: DataTypes.STRING,
    // postHistoryOptionId: DataTypes.INTEGER,
  });

  // Creditor.associate = function (models) {
    // models.Creditor.hasMany(models.Account, {foreignKey: 'creditorId'});
    // models.Creditor.hasMany(models.CreditorOverride, {foreignKey: 'creditorId'});
  // };

  return Creditor;
};
