module.exports = (sequelize, DataTypes) => {
  const FeeEstimate = sequelize.define('FeeEstimate', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return FeeEstimate;
};
