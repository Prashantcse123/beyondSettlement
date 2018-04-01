module.exports = (sequelize, DataTypes) => {
  const AccountStatus = sequelize.define('AccountStatus', {
    name: DataTypes.STRING,
    points: DataTypes.INTEGER,
  });

  // AccountStatus.associate = function (models) {
  //   models.AccountStatus.hasMany(models.Account, {foreignKey: 'currentAccountStatusId'});
  // };

  return AccountStatus;
};
