module.exports = (sequelize, DataTypes) => {
  const ImportedActiveAccount = sequelize.define('ImportedActiveAccount', {
    programname: DataTypes.STRING,
    tradelinename: DataTypes.STRING,
    creditor: DataTypes.STRING,
    account_delinquency: DataTypes.FLOAT,
    balance: DataTypes.FLOAT,
    fee: DataTypes.FLOAT,
    m0_bal: DataTypes.FLOAT,
    fee_funded_pct: DataTypes.FLOAT,
    m0_bal_percent: DataTypes.FLOAT,
    m5_bal_percent: DataTypes.FLOAT,
    m12_bal_percent: DataTypes.FLOAT,
    term_end_bal_percent: DataTypes.FLOAT,
    account_status: DataTypes.STRING,
    tradeline_last_negotiated: DataTypes.DATE,
    accepted_ratio: DataTypes.FLOAT,
    accepted_terms: DataTypes.FLOAT,
    accepted_pay: DataTypes.STRING,
    creditor_terms: DataTypes.STRING,
    data_points: DataTypes.FLOAT,
    debt_type: DataTypes.STRING,
    eligibility: DataTypes.STRING,
    credit_score: DataTypes.FLOAT,
    state_of_residency: DataTypes.STRING,
    avg_monthly_payment: DataTypes.FLOAT,
    enrolled_debt: DataTypes.FLOAT,
    type: DataTypes.STRING,
  });

  return ImportedActiveAccount;
};
