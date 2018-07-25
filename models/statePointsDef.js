module.exports = (sequelize, DataTypes) => {
  const StatePointsDef = sequelize.define('StatePointsDef', {
    code: DataTypes.STRING,
    points: DataTypes.INTEGER,
  });

  // State.associate = function (models) {
  //   models.State.hasMany(models.Account, {foreignKey: 'enrolledStateId'});
  // };

  return StatePointsDef;
};
