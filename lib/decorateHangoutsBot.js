/**
 * Given a hangoutsBot, adds some useful status information and getters/setters
 * to the bot.
 *
 * @param {object} hangoutsBot
 * @returns {object} hangoutsBot
 */
function decorateHangoutsBot(hangoutsBot) {
    hangoutsBot.getIsOnline = function() {
        return this.isOnline;
    };
    hangoutsBot.setIsOnline = function(isOnline) {
        this.isOnline = isOnline;
    };
    hangoutsBot.closeConnection = function() {
        this.connection.emit('end');
        this.setIsOnline(false);
    };
    hangoutsBot.on('online', function() {
        hangoutsBot.setIsOnline(true);
    });
    hangoutsBot.setIsOnline(false);

    return hangoutsBot;
}

module.exports = decorateHangoutsBot;

