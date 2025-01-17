const uptime = require("../bot.js").uptime;
const tools = require("../tools/tools.js");

module.exports = {
    name: "uptime",
    ping: true,
    description: 'This command will tell you how long the bot has been live for',
    permission: 100,
    category: "Bot command",
    execute: async (channel, user, input, perm) => {
        try {
            if (module.exports.permission > perm) {
                return;
            }
            let now = new Date().getTime();

            let ms =  now - uptime;

            return `Uptime: ${tools.humanizeDuration(ms)}`;

        } catch (err) {
            console.log(err);
            return ` Error FeelsBadMan `;
        }
    }
}