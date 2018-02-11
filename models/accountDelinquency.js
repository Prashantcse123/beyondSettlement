module.exports = (sequelize, DataTypes) => {
  const AccountDelinquency = sequelize.define('AccountDelinquency', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return AccountDelinquency;
};
