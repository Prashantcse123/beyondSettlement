module.exports = (sequelize, DataTypes) => {
  const AccountStatusPointsDef = sequelize.define('AccountStatusPointsDef', {
    name: DataTypes.STRING,
    points: DataTypes.INTEGER,
  });

  return AccountStatusPointsDef;
};
