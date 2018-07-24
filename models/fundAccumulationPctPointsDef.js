module.exports = (sequelize, DataTypes) => {
  const FundAccumulationPctPointsDef = sequelize.define('FundAccumulationPctPointsDef', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return FundAccumulationPctPointsDef;
};
