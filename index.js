var request = require('request');
var cheerio = require('cheerio');

var packtURL = 'https://www.packtpub.com/packt/offers/free-learning';

request(packtURL, function(err, res, html) {
	if (!err) {
		var $ = cheerio.load(html);
		var title = $('.dotd-title').text().trim();
		console.log(title);
	}
});

