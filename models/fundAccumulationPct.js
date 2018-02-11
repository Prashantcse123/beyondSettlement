module.exports = (sequelize, DataTypes) => {
  const FundAccumulationPct = sequelize.define('FundAccumulationPct', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return FundAccumulationPct;
};
