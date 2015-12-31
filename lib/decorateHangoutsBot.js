/**
 * Given a hangoutsBot, adds some useful status information and getters/setters
 * to the bot.
 *
 * @param {object} hangoutsBot
 * @returns {object} hangoutsBot
 */
function decorateHangoutsBot(hangoutsBot) {
    // TODO: This may actually be unnecessary since it appears that the
    // `connection` on hangoutsBot has a `state` property (although there
    // doesn't seem to be any "clean" way to get it other than directly
    // accessing the property). Look into this more.
    hangoutsBot.getIsOnline = function() {
        return this.isOnline;
    };
    hangoutsBot.setIsOnline = function(isOnline) {
        this.isOnline = isOnline;
    };
    hangoutsBot.on('online', function() {
        hangoutsBot.setIsOnline(true);
    });
    hangoutsBot.setIsOnline(false);

    return hangoutsBot;
}

module.exports = decorateHangoutsBot;

