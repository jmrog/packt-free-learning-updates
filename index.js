#!/usr/bin/env node
var request = require('request');
var cheerio = require('cheerio');
var HangoutsBot = require('hangouts-bot');
var credentials = require('./credentials.js');

// TODO: Use ES6 and make these real constants.
var packtURL = 'https://www.packtpub.com/packt/offers/free-learning';
var sourceEmail = credentials.sourceEmail;
var sourcePassword = credentials.sourcePassword;
var destinationEmail = credentials.destEmail;
var hangoutsBot = new HangoutsBot(sourceEmail, sourcePassword);

// flags -- TODO: better organization and handling of this; this is hacky just for POC.
hangoutsBot.isBotOnline = false;
var title = null;

// FIXME: All of this is in one file for now just to get things working. Make modules.
hangoutsBot.on('online', function() {
	console.log('Hangouts bot is online!');
	hangoutsBot.isBotOnline = true;
	
	if (title !== null) {
		sendHangoutsMessage(title);
	}
});

request(packtURL, function(err, res, html) {
	if (!err) {
		var $ = cheerio.load(html);
		title = $('.dotd-title').text().trim();
		console.log('Retrieved title: ' + title);
		
		if (hangoutsBot.isBotOnline) {
			sendHangoutsMessage(title);
		}
	}
});

function sendHangoutsMessage(title) {
	var message;

	if (!title) {
		// I guess it's nice to know this.
		message = "Received an empty title. An error must have occurred. :(";
	}
	else {
		message = "Today's free Packt title is: " + title;
	}

	console.log('Sending this message to ' + destinationEmail + ': ' + message);
	hangoutsBot.sendMessage(destinationEmail, message);
}

