module.exports = (sequelize, DataTypes) => {
  const ImportedCreditorVariable = sequelize.define('ImportedCreditorVariable', {
    creditor: DataTypes.STRING,
                                                            /// ﻿Pre Charge-off Section
    most_accepted_ratio_pre_charge: DataTypes.FLOAT,        // % Avg settlement
    most_accepted_terms_pre_charge: DataTypes.STRING,       // Settlement term
    min_monthly_pay_pre_charge: DataTypes.STRING,           // Min payment
    total_number_settlements_pre_charge: DataTypes.INTEGER, //﻿Data points
    dl_pre: DataTypes.STRING,                               // History
                                                            /// Post Charge-off Section
    most_accepted_terms_post_charge: DataTypes.FLOAT,       // % Avg settlement
    min_monthly_pay_post_charge: DataTypes.STRING,          // Settlement term
    total_number_settlements_post_charge: DataTypes.STRING, // Min payment
    // note >> ???                                          //﻿ Data points
    dl_post: DataTypes.STRING,                              // History
  });

  return ImportedCreditorVariable;
};
