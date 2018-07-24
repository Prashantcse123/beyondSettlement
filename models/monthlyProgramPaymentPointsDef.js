module.exports = (sequelize, DataTypes) => {
  const MonthlyProgramPaymentPointsDef = sequelize.define('MonthlyProgramPaymentPointsDef', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return MonthlyProgramPaymentPointsDef;
};
