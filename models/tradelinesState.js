module.exports = (sequelize, DataTypes) => {
    const TradelinesState = sequelize.define('TradelinesState', {
      isDone: DataTypes.BOOLEAN,
    });
  
    return TradelinesState;
  };
  