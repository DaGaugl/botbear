await tools.refreshCommands();

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