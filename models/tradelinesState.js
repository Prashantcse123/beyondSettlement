module.exports = (sequelize, DataTypes) => {
  const TradelinesState = sequelize.define('TradelinesState', {
    isDone: {
      type: DataTypes.BOOLEAN,
      defaultValue() {
        return false;
      },
    },
  });

  return TradelinesState;
};
