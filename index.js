#!/usr/bin/env node
'use strict';

// third-party
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

// first-party
const HangoutsAPI = require(path.join(__dirname, 'lib', 'HangoutsAPI'));
const credentials = require(path.join(__dirname, 'credentials.js'));

const isDev = /^dev/.test(process.env.NODE_ENV);
const shouldLog = typeof argv.log === 'boolean' ? argv.log : isDev;

/**
 * Starts the whole process. Expects that destination and source information
 * will be defined on `credentials`.
 *
 * @param {boolean} shouldLog - forces logging
 */
function start(shouldLog) {
    HangoutsAPI.setupAPI(Object.assign({}, credentials, { shouldLog }))
        .then(HangoutsAPI.makeRequest)
        .then(HangoutsAPI.sendHangoutsMessage)
        .catch(HangoutsAPI.sendErrorNotification)
        .then(HangoutsAPI.end)
        .then(process.exit);
}

if (require.main === module) {
    start(shouldLog);
}
else {
    module.exports = start;
}

