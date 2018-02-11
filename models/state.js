module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', {
    code: DataTypes.STRING,
    points: DataTypes.INTEGER,
  });

  State.associate = function (models) {
    models.State.hasMany(models.Account, {foreignKey: 'enrolledStateId'});
  };

  return State;
};
