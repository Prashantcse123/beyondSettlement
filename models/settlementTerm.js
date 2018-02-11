module.exports = (sequelize, DataTypes) => {
  const SettlementTerm = sequelize.define('SettlementTerm', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return SettlementTerm;
};
