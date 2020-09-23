'use strict';

const bluebird = require('bluebird')

// Loading all the database repositories separately,
// because event 'extend' is called multiple times:
const repos = {
    users: require('./repos/users'),
    emociones: require('./repos/emociones'),
    recetas: require('./repos/recetas'),
};
// pg-promise initialization options:
const options = {

    promiseLib: bluebird,

    extend: (obj, dc) => {
        for (let r in repos) {
           obj[r] = new repos[r](obj, pgp);
        }
    }
};
const config = {
    host: 'test',
    port: 5432,
    database: 'test',
    user: 'test',
    password:'test',
    idleTimeoutMillis: 15000,
};

// Load and initialize pg-promise:
const pgp = require('pg-promise')(options);

pgp.pg.defaults.poolSize = 20;
// Create the database instance:
const db = pgp(process.env.DATABASE_URL || config);
module.exports = db;
