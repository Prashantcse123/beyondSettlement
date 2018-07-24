module.exports = (sequelize, DataTypes) => {
  const FeeEstimatePointsDef = sequelize.define('FeeEstimatePointsDef', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return FeeEstimatePointsDef;
};
