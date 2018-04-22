module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define('Progress', {
    type: DataTypes.STRING,
    task: DataTypes.STRING,
    value: DataTypes.FLOAT,
  });

  return Progress;
};
