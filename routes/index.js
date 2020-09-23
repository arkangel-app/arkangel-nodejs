
const Router = require('koa-router');
const db = require('../database');
const jwtk = require('jsonwebtoken');
var config = require('../config/index');
const bcrypt = require('bcrypt');
const mailer = require('./mailer/sender');
var fs=require('fs');
require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var template = require('./mailer/template.html');
var templateString = require('./mailer/templateString');

const router = new Router();

const jwt = require('jsonwebtoken');
var config = require('../config/index');


router.get('/hello', getMessage);

function *getMessage(){
   this.body = 'Your request has been logged.';
   console.log(this.response);
}
module.exports = router;
