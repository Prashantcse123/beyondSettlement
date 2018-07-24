module.exports = (sequelize, DataTypes) => {
  const AccountDelinquencyPointsDef = sequelize.define('AccountDelinquencyPointsDef', {
    rangeFrom: DataTypes.INTEGER,
    rangeTo: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });

  return AccountDelinquencyPointsDef;
};
