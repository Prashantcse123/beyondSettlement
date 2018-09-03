module.exports = (sequelize, DataTypes) => {
  const TradelinesState = sequelize.define('TradelinesState', {
    isDone: {
      type: DataTypes.BOOLEAN,
      defaultValue() {
        return false;
      },
    },
    status: DataTypes.INTEGER,
    teamLeadId: DataTypes.STRING,
    agentId: DataTypes.STRING,
  });

  return TradelinesState;
};
