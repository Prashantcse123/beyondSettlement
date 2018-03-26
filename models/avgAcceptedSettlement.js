module.exports = (sequelize, DataTypes) => {
  const AvgAcceptedSettlement = sequelize.define('AvgAcceptedSettlement', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return AvgAcceptedSettlement;
};
