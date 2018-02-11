module.exports = (sequelize, DataTypes) => {
  const MonthlyProgramPayment = sequelize.define('MonthlyProgramPayment', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return MonthlyProgramPayment;
};
