module.exports = (sequelize, DataTypes) => {
  const WeightDef = sequelize.define('WeightDef', {
    criteria: DataTypes.STRING,
    weightage: DataTypes.INTEGER,
    maxPoints: DataTypes.INTEGER,
    minPoints: DataTypes.INTEGER,
    maxScore: DataTypes.INTEGER,
    minScore: DataTypes.INTEGER,
    remarks: DataTypes.STRING,
  });

  return WeightDef;
};
