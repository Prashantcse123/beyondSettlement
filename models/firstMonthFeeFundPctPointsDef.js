module.exports = (sequelize, DataTypes) => {
  const FirstMonthFeeFundPctPointsDef = sequelize.define('FirstMonthFeeFundPctPointsDef', {
    rangeFrom: DataTypes.FLOAT,
    rangeTo: DataTypes.FLOAT,
    points: DataTypes.INTEGER,
  });

  return FirstMonthFeeFundPctPointsDef;
};
