const models = require('../../models/index');
const features = require('../../config/featureToggle');

const eligibleAccountsFilter = {
    filter: () => {
        //check if feature is enabled
        if(features.eligibleAccounts){
            const sql = require('./sql/eligibleAccountsFilter.sql');

            console.log('>> filtering eligible accounts');

            return new Promise((resolve, reject) =>
                models.sequelize.query(sql) //run sql
                    .spread((results, metadata) => resolve())
            )
        }else{
            return new Promise((resolve, reject) => resolve());
        }
    }
};

module.exports = eligibleAccountsFilter;
