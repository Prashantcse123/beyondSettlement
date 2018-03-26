module.exports = (sequelize, DataTypes) => {
  const FundAccumulationPct = sequelize.define('FundAccumulationPct', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return FundAccumulationPct;
};
