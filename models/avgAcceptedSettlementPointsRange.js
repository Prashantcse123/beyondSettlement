module.exports = (sequelize, DataTypes) => {
  const AvgAcceptedSettlementPointsRange = sequelize.define('AvgAcceptedSettlementPointsRange', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return AvgAcceptedSettlementPointsRange;
};
