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

/**
 * Sets the initial values to be used throughout the HangoutsAPI flow.
 *
 * @param {object} options
 * @param {string} options.sourceEmail
 * @param {string} options.sourcePassword
 * @param {string} options.destination - email address
 * @param {boolean} options.shouldLog - write log/error messages or not
 * @returns {object} - a (resolved) promise
 */
function setupAPI(options) {
    this.hangoutsBot =
        decorateHangoutsBot(new HangoutsBot(options.sourceEmail, options.sourcePassword));
    this.destination = options.destinationEmail;
    this.shouldLog = options.shouldLog;

    this.makeRequest = makeRequest.bind(this);
    this.sendHangoutsMessage = sendHangoutsMessage.bind(this);
    this.sendErrorNotification = sendErrorNotification.bind(this);
    this.end = end.bind(this);

    return Promise.resolve();
}

/**
 * Retrieves and scrapes the Packt "free learning" web page, returning a
 * promise that is either resolved with the book title or rejected with error
 * information.
 *
 * @returns {object} - a promise
 */
function makeRequest() {
    // we need to make sure both that the hangoutsBot has come online and that
    // the request resolves with a title before moving on.
    const promisesToFulfill = [
        new Promise((resolve) => this.hangoutsBot.on('online', resolve)), // TODO: timeout
        new Promise((resolve, reject) => {
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
        })
    ];

    return Promise.all(promisesToFulfill);
}

/**
 * Sends a Hangouts message using the API settings and the title provided.
 *
 * @param {string} title - the title of the book
 */
function sendHangoutsMessage(receivedData) {
    const title = receivedData[1];
    const message = `Today's free Packt title is: ${title}`;

    if (this.shouldLog) {
        console.log(
            'HANGOUTS BOT [LOG]: Sending this message to ' + this.destination + ': ' + message
        );
    }

    this.hangoutsBot.sendMessage(this.destination, message);
}

/**
 * Sends a Hangouts error message to the destination in the API settings.
 *
 * @param {string|object} error
 */
function sendErrorNotification(error) {
    let message = '';

    switch (typeof error) {
        case 'string':
            message = error;
            break;
        case 'object':
            message = ERROR_PREAMBLE + error.name + '; ' + error.message;
            break;
        default:
            message = ERROR_PREAMBLE + 'Unknown error.';
    }

    if (this.shouldLog) {
        console.error(message);
    }

    this.hangoutsBot.sendMessage(this.destination, message);
}

/**
 * Closes the Hangouts connection.
 */
function end() {
    this.hangoutsBot.closeConnection();
}

module.exports = { setupAPI };

