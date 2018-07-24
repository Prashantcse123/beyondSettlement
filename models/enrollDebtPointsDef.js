module.exports = (sequelize, DataTypes) => {
  const EnrollDebtPointsDef = sequelize.define('EnrollDebtPointsDef', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return EnrollDebtPointsDef;
};
