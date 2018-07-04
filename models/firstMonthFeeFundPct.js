module.exports = (sequelize, DataTypes) => {
  const FirstMonthFeeFundPct = sequelize.define('FirstMonthFeeFundPct', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return FirstMonthFeeFundPct;
};
