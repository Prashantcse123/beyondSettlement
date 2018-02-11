module.exports = (sequelize, DataTypes) => {
  const AvgAcceptedSettlement = sequelize.define('AvgAcceptedSettlement', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return AvgAcceptedSettlement;
};
