module.exports = (sequelize, DataTypes) => {
  const HistoryOption = sequelize.define('HistoryOption', {
    text: DataTypes.STRING,
  });

  return HistoryOption;
};
