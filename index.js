#!/usr/bin/env node

'use strict';

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const HangoutsBot = require('hangouts-bot');

const HangoutsAPI = require(path.join(__dirname, 'lib', 'HangoutsAPI'));
const decorateHangoutsBot = require(path.join(__dirname, 'lib', 'decorateHangoutsBot'));
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
    // No destructuring assignment in Node 4. :(
    const sourceEmail = credentials.sourceEmail;
    const sourcePassword = credentials.sourcePassword;
    const destination = credentials.destinationEmail;
    const hangoutsBot = decorateHangoutsBot(new HangoutsBot(sourceEmail, sourcePassword));
    let title = null;
    const apiData = {
        hangoutsBot,
        destination,
        shouldLog
    };

    hangoutsBot.on('online', () => HangoutsAPI.sendHangoutsMessage(
        Object.assign({}, apiData, { title })
    ));

    HangoutsAPI.makeRequest(shouldLog, (err, receivedTitle) => {
        if (err) {
            return HangoutsAPI.sendErrorNotification(Object.assign({}, apiData, { message: err }));
        }

        title = receivedTitle;
        return HangoutsAPI.sendHangoutsMessage(Object.assign({}, apiData, { title }));
    });
}

if (require.main === module) {
    start(shouldLog);
}
else {
    module.exports = start;
}

