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
 * Starts the whole process! Expects that destination and source information
 * will be defined on `credentials`.
 *
 * @param {boolean} shouldLog - forces logging
 */
function start(shouldLog) {
    HangoutsAPI.setupAPI(credentials)
        .then((apiData) => {
            // we need to make sure both that the hangoutsBot has come online and that
            // the request has resolved with a title
            const promisesToFulfill = [
                new Promise((resolve) => hangoutsBot.on('online', resolve)),
                HangoutsAPI.makeRequest(apiData, shouldLog)
            ];

            Promise.all(promisesToFulfill)
                .then(HangoutsAPI.sendHangoutsMessage)
                .catch(HangoutsAPI.sendErrorNotification)
                .then(hangoutsBot.disconnect)
                .then(process.exit);
        });

    hangoutsBot.on('online', () => {
        HangoutsAPI.sendHangoutsMessage(Object.assign({}, apiData, { title }))
            .catch(HangoutsBotAPI.sendErrorNotification)
            .then(hangoutsBot.disconnect.bind(hangoutsBot, process.exit));
    });

    HangoutsAPI.makeRequest(shouldLog)
        .then((receivedTitle) => {
            title = receivedTitle; // for closure

        .then(HangoutsAPI.sendHangoutMessage(Object.assign({}, apiData
    HangoutsAPI.makeRequest(shouldLog, (err, receivedTitle) => {
        if (err) {
            HangoutsAPI.sendErrorNotification(Object.assign({}, apiData, { message: err }));
            hangoutsBot.closeConnection(function() {
                process.exit(1);
            });
        }

        title = receivedTitle;
        HangoutsAPI.sendHangoutsMessage(Object.assign({}, apiData, { title }))
            .then(() => hangoutsBot.closeConnection(() => process.exit(0)));
    });
}

if (require.main === module) {
    start(shouldLog);
}
else {
    module.exports = start;
}

