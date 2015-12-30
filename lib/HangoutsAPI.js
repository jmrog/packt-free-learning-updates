'use strict';

// third-party
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const HangoutsBot = require('hangouts-bot');

// first-party
const decorateHangoutsBot = require(path.join(__dirname, 'decorateHangoutsBot'));

const PACKT_URL = require(path.join(__dirname, '..', 'config')).URL;
const ERROR_PREAMBLE = require(path.join(__dirname, '..', 'config')).ERROR_PREAMBLE;

function setupAPI(credentials) {
    const hangoutsBot =
        decorateHangoutsBot(new HangoutsBot(credentials.sourceEmail, credentials.sourcePassword));
    const apiData = Object.assign({}, credentials, { hangoutsBot });

    return Promise.resolve(apiData);
}

/**
 * Retrieves and scrapes the Packt "free learning" web page, returning a
 * promise that is either resolved with the book title or rejected with error
 * information.
 *
 * @param {boolean} shouldLog
 * @returns {object} - a promise
 */
function makeRequest(shouldLog) {
    return new Promise((resolve, reject) => {
        request(PACKT_URL, (err, res, html) => {
            if (err) {
                const errorMessage = ERROR_PREAMBLE +
                    (err.name ? err.name + '; ' : '') +
                    (err.message || err);

                return reject(errorMessage);
            }

            try {
                const title = cheerio.load(html)('.dotd-title').text().trim();

                if (!title) {
                    return reject(ERROR_PREAMBLE + 'Received an empty title.');
                }

                return resolve(title);
            }
            catch (ex) {
                return reject(ERROR_PREAMBLE + ex.name + '; ' + ex.message);
            }
        });
    });
}

/**
 * Sends a Hangouts message to the destination using the supplied options and
 * title.
 *
 * @param {object} options
 * @param {object} options.hangoutsBot
 * @param {string} options.destination - should be an email address
 * @param {boolean} options.shouldLog
 */
function sendHangoutsMessage(options, title) {
    const hangoutsBot = options.hangoutsBot;
    const destination = options.destination;
    const shouldLog = options.shouldLog;
    const message = `Today's free Packt title is: ${title}` :

    if (shouldLog) {
        console.log(
            'HANGOUTS BOT [LOG]: Sending this message to ' + destination + ': ' + message
        );
    }

    hangoutsBot.sendMessage(destination, message);
}

/**
 * Sends a Hangouts error message to the destination using the supplied
 * hangoutsBot and error message.
 *
 * @param {object} options
 * @param {object} options.hangoutsBot
 * @param {string} options.message
 * @param {string} options.destination - should be an email address
 * @param {boolean} options.shouldLog
 */
function sendErrorNotification(options) {
    const hangoutsBot = options.hangoutsBot;
    const message = options.message;
    const destination = options.destination;
    const shouldLog = options.shouldLog;

    if (shouldLog) {
        console.error(message);
    }

    hangoutsBot.sendMessage(destination, message);
}


module.exports = {
    makeRequest,
    sendHangoutsMessage,
    sendErrorNotification
};

