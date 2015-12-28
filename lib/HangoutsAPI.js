'use strict';

const path = require('path');
const request = require('request');
const cheerio = require('cheerio');

const PACKT_URL = require(path.join(__dirname, '..', 'config')).URL;

/**
 * Retrieves and scrapes the Packt "free learning" web page, calling the
 * callback with any error information or the book title.
 *
 * @param {function} cb - Node-style callback for handling errors and
 *  success
 */
function makeRequest(forceLogging, cb) {
    request(PACKT_URL, (err, res, html) => {
        let title = '';
        let errorMessage = 'HANGOUTS BOT [ERROR]: ';

        if (err) {
            errorMessage += err.name ? err.name + '; ' : '';
            errorMessage += err.message || err;
            return cb(errorMessage);
        }

        try {
            title = cheerio.load(html)('.dotd-title').text().trim();
        }
        catch (ex) {
            return cb(errorMessage + ex.name + '; ' + ex.message);
        }

        if (!title) {
            return cb(errorMessage + 'Received an empty title.');
        }

        return cb(null, title);
    });
}

/**
 * Sends a Hangouts message to the destination using the supplied hangoutsBot
 * and title.
 *
 * @param {object} options
 * @param {object} options.hangoutsBot
 * @param {string} options.title
 * @param {string} options.destination - should be an email address
 * @param {boolean} options.shouldLog
 */
function sendHangoutsMessage(options) {
    const hangoutsBot = options.hangoutsBot;
    const title = options.title;
    const destination = options.destination;
    const shouldLog = options.shouldLog;

    // only send the message if the bot is online and we have a non-null title
    if (title === null || !hangoutsBot.getIsOnline()) {
        return;
    }

    const message = title ?
        `Today's free Packt title is: ${title}` :
        'HANGOUTS BOT [ERROR]: Received an empty title.';

    if (shouldLog) {
        console[title ? 'log' : 'error'](
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

