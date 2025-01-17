require('dotenv').config();
const tmi = require("tmi.js");
const login = require('./connect/connect.js');
const tools = require("./tools/tools.js");
const regex = require('./tools/regex.js');
const _ = require("underscore");
const requireDir = require("require-dir");

const cc = new tmi.client(login.options);

cc.on('message', onMessageHandler);
cc.on('connected', onConnectedHandler);
cc.on("pong", async (latency) => {
    console.log(latency)
    await tools.query('INSERT INTO Latency (Latency) values (?)', [latency]);

});

cc.connect();

let uptime = new Date().getTime();

let started = false;

const talkedRecently = new Set();
let oldmessage = "";

async function onMessageHandler(channel, user, msg, self) {
    let start = new Date().getTime();
    if (channel == "#botbear1110") {
        console.log(`${user.username}: ${msg}`);
    }
    /*
    const userList = await tools.query(`SELECT * FROM Users WHERE username=?`, [user.username]);

    if (!userList.length && user.username != null) {
        await tools.query('INSERT INTO Users (username, uid, permission) values (?, ?, ?)', [user.username, user["user-id"], 100]);
    }
    */

    if (self) {
        return;
    }

    let input = msg.split(" ");
    const Alias = new tools.Alias(msg);
    input = msg.replace(Alias.getRegex(), Alias.getReplacement()).split(' ');
    let realcommand = input[1];

    if (realcommand !== "say" && realcommand !== "channel" && realcommand !== "emotecheck" && realcommand !== "cum") {
        input = msg.toLowerCase().split(" ");
    }

    if (input[0] === "[cookies]" && user["user-id"] == 425363834) {
        const cookieStatus = await tools.cookies(user, input, channel);

        if (cookieStatus[0] === "Confirmed") {
            cc.say(cookieStatus[2], `${cookieStatus[1]} I will remind you to eat your cookie in 2 hours nymnOkay`)
        }
        if (cookieStatus[0] === "Confirmed2") {
            cc.say(cookieStatus[2], `${cookieStatus[1]} I updated your reminder and will remind you to eat your cookie in 2 hours nymnOkay`)
        }
        if (cookieStatus[0] === "CD") {
            cc.say(cookieStatus[2], `${cookieStatus[1]} Your cookie is still on cooldown, it will be available in ${cookieStatus[3]}`)
        }

    }

    if (input[0] !== "bb" && input[0].toLowerCase() !== "forsenbb") {
        return;
    }
    // If yabbes chat want to disable other commands ->
    if (channel === "#yabbe") {
        if (realcommand !== "gametime" && realcommand !== "channel" && realcommand !== "notify" && realcommand !== "remove" && realcommand !== "myping" && realcommand !== "ping" && realcommand !== "commands" && realcommand !== "bot" && realcommand !== "suggest") {
            return;
        }
    }

    const userList = await tools.query(`SELECT * FROM Users WHERE username=?`, [user.username]);

    if (!userList.length && user.username != null) {
        await tools.query('INSERT INTO Users (username, uid, permission) values (?, ?, ?)', [user.username, user["user-id"], 100]);
    }


    if (channel === "#forsen") {
        return;
    }

    if (channel === "#botbear1110") {
        channel = "#forsen";
    }

    const commands = requireDir("./commands");

    if (typeof commands[realcommand] === "undefined") {
        console.log("undefined");
        return;
    }

    const perm = await tools.getPerm(user.username);

    const userCD = new tools.Cooldown(user, realcommand, 3000);

    if ((await userCD.setCooldown()).length) { return; }


    if (user['user-id'] !== process.env.TWITCH_OWNERUID) {

        if (talkedRecently.has(channel)) { return; }

        talkedRecently.add(channel);

        let timeout = 1250;

        setTimeout(() => {
            talkedRecently.delete(channel);
        }, timeout);
    }

    const usernamePhrase = await tools.banphrasePass(user.username, channel);

    if (usernamePhrase.banned) {
        cc.say(channel, `[Banphrased Username] cmonBruh `);
        return;
    }
    const badUsername = user.username.match(regex.racism);
    if (badUsername != null) {
        cc.say(channel, `[Bad username detected] cmonBruh`);
        return;
    }

    let realchannel = channel.substring(1);
    let result = await commands[realcommand].execute(realchannel, user, input, perm);


    if (!result) {
        return;
    }

    if (commands[realcommand].ping == true) {
        result = `${user['display-name']}, ${result}`;
    }

    if (channel === "#forsen") {
        channel = "#botbear1110";
    }

    const banPhrase = await tools.banphrasePass(result, channel);

    if (banPhrase.banned) {
        cc.say(channel, `[Banphrased] cmonBruh`);
        return;
    }

    const banPhraseV2 = await tools.banphrasePassV2(result, channel);

    if (banPhraseV2 == true) {
        cc.say(channel, `[Banphrased] cmonBruh`);
        return;
    }

    if (banPhrase === 0) {
        cc.say(channel, "FeelsDankMan error!!");
        return;
    }

    const notabanPhrase = await tools.notbannedPhrases(result.toLowerCase());

    if (notabanPhrase != `null`) {
        cc.say(channel, notabanPhrase);
        return;
    }

    const badWord = result.match(regex.racism);
    if (badWord != null) {
        cc.say(channel, `[Bad word detected] cmonBruh`);
        return;
    }

    const reallength = await tools.asciiLength(result);
    if (reallength > 30) {
        cc.say(channel, "[Too many emojis]");
        return;
    }

    if (result === oldmessage) {
        result = result + " 󠀀 ";
    }
    let end = new Date().getTime();

    if (commands[realcommand].showDelay == true) {
        result = `${result} ${end - start}ms`;
    }

    cc.say(channel, result);
    oldmessage = result;
}

async function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    await tools.refreshCommands();
    if (started === false) {

let bannedUsers = await tools.bannedStreamer;

if (await bannedUsers.length) {
_.each(bannedUsers, async function (user) {
    cc.part(user).then((data) => {
        // data returns [channel]
    }).catch((err) => {
        console.log(err);
    });
    cc.say("#botbear1110", `Left channel ${user}. Reason: Banned/deleted channel`)
})
}

let namechange = await tools.nameChanges;

if (await namechange.length) {
_.each(namechange, async function (name) {
    cc.join(name[0]).then((data) => {
        // data returns [channel]
    }).catch((err) => {
        console.log(err);
    });

    cc.part(name[1]).then((data) => {
        // data returns [channel]
    }).catch((err) => {
        console.log(err);
    });

    cc.say(`#${name[0]}`, `Name change detected, ${name[1]} -> ${name[0]}`)
    cc.say("#botbear1110", `Left channel ${name[1]}. Reason: Name change detected, ${name[1]} -> ${name[0]}`)
})
}
started = true;
    }

}
module.exports = { cc , uptime};