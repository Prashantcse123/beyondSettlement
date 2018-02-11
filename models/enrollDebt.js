module.exports = (sequelize, DataTypes) => {
  const EnrollDebt = sequelize.define('EnrollDebt', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return EnrollDebt;
};
