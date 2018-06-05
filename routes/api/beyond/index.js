const express = require('express');
const router = express.Router();
// const users = require('./users');
const jwt = require('jsonwebtoken');
const sourceData = require('./sourceData');
const calculations = require('./calculations');
const bcrypt = require('bcrypt-nodejs');
const models = require('../../../models');

const config = {
    token: process.env.SPLUNK_TOKEN,
    url: process.env.SPLUNK_URL,
    jwt_secret: process.env.JWT_SECRET,
};


router.use('/source/data', sourceData);
router.use('/calculations', calculations);

router.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let error = {message: 'Wrong username or password!'};

    if(req.body.username && req.body.password) {
        models.User.findAll({where: {username}}).then(rows => {
            let row = rows[0];

            if (row && validPassword(password, row.password)) {
                res.status(200).json({
                    username: row.username,
                    token: jwt.sign({username: row.username}, config.jwt_secret, {expiresIn: 60 * 60 * 24})
                });
            }else{
                res.status(401).json({error});
            }
        });
    }else{
        res.status(401).json({error});
    }
});

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function validPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
}

module.exports = router;
