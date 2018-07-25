module.exports = (sequelize, DataTypes) => {
  const SettlementTermPointsDef = sequelize.define('SettlementTermPointsDef', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return SettlementTermPointsDef;
};
