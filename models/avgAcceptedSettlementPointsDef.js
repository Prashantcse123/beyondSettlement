module.exports = (sequelize, DataTypes) => {
  const AvgAcceptedSettlementPointsDef = sequelize.define('AvgAcceptedSettlementPointsDef', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return AvgAcceptedSettlementPointsDef;
};
