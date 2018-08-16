module.exports = (sequelize, DataTypes) => {
    const TradelinesState = sequelize.define('TradelinesState', {
      isDone: {
        type: DataTypes.BOOLEAN,
        defaultValue: function() {
          return false;
        },
      }
    });
  
    return TradelinesState;
  };
  