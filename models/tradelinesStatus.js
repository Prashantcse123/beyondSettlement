module.exports = (sequelize, DataTypes) => {
  const tradelinesStatus = sequelize.define('TradelinesStatuses', {
    StatusName: DataTypes.STRING,
  });

  return tradelinesStatus;
};
