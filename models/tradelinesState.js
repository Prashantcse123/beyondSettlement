module.exports = (sequelize, DataTypes) => {
  const TradelinesState = sequelize.define('TradelinesState', {
    isDone: {
      type: DataTypes.BOOLEAN,
      defaultValue() {
        return false;
      },
    },
    status: {
      type: DataTypes.INTEGER,
    },
    teamLeadId: {
      type: DataTypes.STRING,
    },
    agentId: {
      type: DataTypes.STRING,
    },
  });

  return TradelinesState;
};
