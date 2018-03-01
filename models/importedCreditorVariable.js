module.exports = (sequelize, DataTypes) => {
  const ImportedCreditorVariable = sequelize.define('ImportedCreditorVariable', {
    creditor: DataTypes.STRING,
    most_accepted_ratio_pre_charge: DataTypes.STRING,
    most_accepted_terms_pre_charge: DataTypes.INTEGER,
    min_monthly_pay_pre_charge: DataTypes.STRING,
    total_number_settlements_pre_charge: DataTypes.STRING,
    dl_pre: DataTypes.STRING,
    most_accepted_terms_post_charge: DataTypes.INTEGER,
    min_monthly_pay_post_charge: DataTypes.STRING,
    total_number_settlements_post_charge: DataTypes.STRING,
    dl_post: DataTypes.STRING,
  });

  return ImportedCreditorVariable;
};
