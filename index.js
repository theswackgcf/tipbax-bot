//discord libraries and token
const bot_token = process.env.TOKEN;
const { Client, Events, GatewayIntentBits, ActivityType, AttachmentBuilder, PermissionsBitField} = require("discord.js");

//other dependencies
const fs = require("fs");
const https = require('https');
//const Jimp = require("jimp");

let database_init = false;
const version = "1.002";

//download database from a url and set it to the save variable
function download(url){
    let file = fs.createWriteStream('./database.txt');
    let request = https.get(url, function(response) {
        response.pipe(file);
        //downloading finished
        file.on("finish", () => {
            file.close();
            getText = fs.readFileSync("./database.txt", "utf-8");
            save = JSON.parse(getText);
            database_init = true;
            console.log('Database initialized');
        });
    });
}

let save = "{}";

//ids
const bot_id = "1214233339012063373";
const database_channel = '1214320437706891366';
const owner_id = '821432433491705977';

//turn json into a string and write to a file
function string_JSON() {
    fs.writeFile("./botconfig.json", JSON.stringify(save), (err) => {
        if (err) console.error(err);
    });
}

//save data
function database_send() {
    var finaltext = "";
    finaltext = JSON.stringify(save);
    var atc = new AttachmentBuilder(Buffer.from(finaltext, 'utf-8'), { name: 'database.txt' });
    client.channels.cache.get(database_channel).send({files:[atc]});
}


//intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
	],
});

client.once(Events.ClientReady, (a) => {
    console.log("tipbax logged in");
  
    //load data
    let _url = "";
    let _size = 1;
    let messageNums = client.channels.cache.get(database_channel).messages.fetch({ limit: 1 }).then(messages => {
        messages.forEach(curmessage => {
        _url = Array.from(curmessage.attachments)[0][1].attachment;
        _size = Array.from(curmessage.attachments)[0][1].size;
        download(_url);
        });
    });

    let all_activities = [
        "Super Mario Brothers",
        "Minecraft 2",
        "Mickey Mouse Clubhouse",
        "Youtube.com",
        "Wario Land 4",
        "If Tip, then only Bax!",
        "With my TipBax",
        "Conker's Bad Fur Day funny memes",
        "Sims 4",
        "Call of Duty: Black Ops",
        "Super Mario 128",
        "Sonic Lost World",
        "mfs will see this and go \"TipBax\"",
        "yah yah yah",
        "The Mario Movie",
        "Donkey Kong Country 3",
        "Computer",
        "PC 2",
        "Simpsons: The Game",
        "Escape from the Dark Luigi",
        "Windows Vista",
        "Chess 4D",
        "Google.com super mario gangsta cool",
        "mspaint.exe",
        "On my emulator",
        "Realistic RedBidd Adventure",
        "Battletoads",
        "Cooking Simulator",
        "Walking Simulator",
        "Breathing Simulator",
        "Existing Simulator",
        "Luigi is Pissing",
        "Mario is Missing",
        "Super Mario Brother 2",
        "Super Mario in real life",
        "Xbox",
        "Plaustation 3",
        "Digger World",
        "mung%",
        "Mothin'",
        "bvithõ",
        "Bill Gates Photo",
    ];

    let rand_act = 0;

    function set_presence(){
        rand_act = Math.floor(Math.random()*all_activities.length);
        client.user.setPresence({
            activities: [{ name: all_activities[rand_act], type: ActivityType.Playing }],
            status: 'online',
        });
    }

    set_presence();
    setInterval(() => {
        set_presence();
    }, 600000);
});

let prefix = 'tipbax';

client.on(Events.MessageCreate, (msg) => {
    //user is not bot
    if(!msg.author.bot){
        if(!database_init) return;
        var args = msg.content.toLowerCase().split(" ");

        //make data
        if(!save[msg.guild.id]){
            save[msg.guild.id] = {
                words: [],
                channels: [],
                interval: 5,
                listening: false,
                talking: false,
                reacting: false,
            };
        }
        let cursave = save[msg.guild.id];

        function add_msg(){
            if(cursave.listening){
                //put message into the data
                var arggs = args;
                arggs = arggs.filter(n => n != `<@${client.user.id}>`);
                arggs = arggs.filter(n => n != `<@!${client.user.id}>`);

                var mode = Math.floor(Math.random()*4);
                //0 = one word from message
                //1 = some words from message
                //2 = part of a message
                //3 = whole message
                if(cursave != undefined){
                    if(arggs.join(' ').length > 0){
                        switch(mode){
                            case 0:
                                cursave.words[cursave.words.length] = arggs[Math.floor(Math.random()*arggs.length)].trim();
                            break;
                            case 1:
                                for(var i = 0; i < Math.max(1, Math.floor(arggs.length/4)); i++){
                                    if(i < 8){
                                        cursave.words[cursave.words.length] = arggs[Math.floor(Math.random()*arggs.length)].trim();
                                    }
                                }
                            break;
                            case 2:
                                var curPart = 0;
                                var stringParts = [];
                                for(var i = 0; i < arggs.length; i++){
                                stringParts[i] = '';
                                }
                                for(var i = 0; i < arggs.length; i++){
                                    stringParts[curPart] += arggs[i]+' ';
                                    if(Math.floor(Math.random()*5) == 1){
                                        curPart ++;
                                    }
                                }
                                stringParts = stringParts.filter(n => n != '');
                                cursave.words[cursave.words.length] = stringParts[Math.floor(Math.random()*stringParts.length)].trim();
                            break;
                            case 3:
                                cursave.words[cursave.words.length] = arggs.join(' ').trim();
                            break;
                        }
                        //if too many, remove older words
                        if(cursave.words.length > 1000){
                            cursave.words = cursave.words.slice(-1000);
                        }
                    }
                }
            }
        }

        function generate_msg(reply, sendfail){
            if(!reply){
                var rand = Math.floor(Math.random()*20);
                if(rand == 1){
                    if(cursave.reacting){
                        //emoji reaction
                        var emojis = msg.guild.emojis.cache.map((e) => `${e.id}`);
                        if(emojis.length > 0){
                            var randEmoji = emojis[Math.floor(Math.random()*emojis.length)];
                            return msg.react(randEmoji);
                        }
                    }
                }
            }
            if((!reply && cursave.talking) || (reply)){
                //generate a string based on previous messages
                if(sendfail){
                    if(cursave.words.length == 0) return msg.reply("not enough messages saved");
                } else {
                    if(cursave.words.length == 0) return;
                }
                var finalstring = [];
                for(var i = 0; i < Math.floor((Math.random()*10)+1); i++){
                    finalstring.push(cursave.words[Math.floor(Math.random()*cursave.words.length)]);
                }
                var uppercase = false;
                if(Math.floor(Math.random()*4) == 1){
                    uppercase = true;
                }
                for(var i = 0; i < finalstring.length; i++){
                    if(uppercase){
                        finalstring[i] = finalstring[i].toUpperCase();
                    } else {
                        finalstring[i] = finalstring[i].toLowerCase();
                    }
                }
                finalstring = finalstring.filter(n => n != '');
                
                var msgReply = '';
            
                msgReply = finalstring.join(' ');
            
                if(reply){
                    msg.channel.sendTyping();
                    setTimeout(() => {
                        msg.reply(msgReply);
                        string_JSON();
                        database_send();
                    }, 700+msgReply.length);
                } else {
                    msg.channel.sendTyping();
                    setTimeout(() => {
                        msg.channel.send(msgReply);
                        string_JSON();
                        database_send();
                    }, 700+msgReply.length);
                }
            }
        }

        if(msg.type == 19 && msg.mentions.repliedUser.id == client.user.id){
            generate_msg(true, false);
            add_msg();
            return;
        }

        //bot mentioned
        if(args[0] == `<@${client.user.id}>` || args[0] == `<@!${client.user.id}>` || args[0].toLowerCase() == prefix){
            if(args.length == 1){
                generate_msg(true, false);
                add_msg();
                return;
            }

            switch(args[1]){
                case "ping":
                    msg.reply(`Latency: ${Date.now() - msg.createdTimestamp}ms. API Latency: ${Math.round(client.ws.ping)}ms`);
                break;
                case "uptime":
                    let totalSeconds = client.uptime / 1000;
                    let days = Math.floor(totalSeconds / 86400);
                    totalSeconds %= 86400;
                    let hours = Math.floor(totalSeconds / 3600);
                    totalSeconds %= 3600;
                    let minutes = Math.floor(totalSeconds / 60);
                    let seconds = Math.floor(totalSeconds % 60);

                    let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
                    msg.reply(uptime);
                break;
                case "eval":
                    if(msg.author.id != owner_id) return;
                    var args2 = msg.content.split(" ");
                    var input = args2.splice(2).join(" ");
                    try {
                        eval(input);
                    } catch (e) {
                        msg.reply("```\n"+e+"\n```");
                    };
                break;
                case "help":
                    var helpArray = [
                        `i'm a genai ripoff`,
                        `use <@${client.user.id}>/${prefix} before each command`,
                        `**help** - this message`,
                        `**invite** - bot's invite link`,
                        `**enable listening/talking/reacting**`,
                        `**disable listening/talking/reacting**`,
                        `**generate** - generate a random message`,
                        `**channels add/remove** - prevent me from talking in specific channels`,
                        `**interval** - set interval`,
                        `**reset** - reset tipbax's memory in this server`,
                    ];
                    return msg.reply(helpArray.join("\n"));
                break;
                case "invite":
                    return msg.reply("https://discord.com/oauth2/authorize?client_id=1214233339012063373&scope=bot&permissions=274878286912");
                break;
                case "enable":
                    if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return msg.reply("NUH UH. you dont have the **manage channels** permission");
                    if(args.length == 2){
                        return msg.reply(`**enable listening/talking/reacting**`);
                    }
                    switch(args[2]){
                        case "listening":
                            if(!cursave.listening){
                                cursave.listening = true;
                                if(!cursave.channels.includes(msg.channel.id)){
                                    cursave.channels.push(msg.channel.id);
                                }
                                string_JSON();
                                database_send();
                                return msg.reply("listening **enabled**. tipbax will now listen to messages\nto check what channels are currently enabled use the **channels** command");
                            } else {
                                return msg.reply("listening has already been enabled");
                            }
                        break;
                        case "talking":
                            if(!cursave.talking){
                                cursave.talking = true;
                                if(!cursave.channels.includes(msg.channel.id)){
                                    cursave.channels.push(msg.channel.id);
                                }
                                string_JSON();
                                database_send();
                                return msg.reply("talking **enabled**. tipbax will now talk on its own. to change the interval use **interval**.\nto check what channels are currently enabled use the **channels** command")
                            } else {
                                return msg.reply("talking has already been enabled");
                            }
                        break;
                        case "reacting":
                            if(!cursave.reacting){
                                cursave.reacting = true;
                                if(!cursave.channels.includes(msg.channel.id)){
                                    cursave.channels.push(msg.channel.id);
                                }
                                string_JSON();
                                database_send();
                                return msg.reply("reacting **enabled**. tipbax will now randomly react with emojis from this server");
                            } else {
                                return msg.reply("reacting has already been enabled");
                            }
                        break;
                    }
                break;
                case "disable":
                    if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return msg.reply("NUH UH. you dont have the **manage channels** permission");
                    if(args.length == 2){
                        return msg.reply(`**disable listening/talking/reacting**`);
                    }
                    switch(args[2]){
                        case "listening":
                            if(cursave.listening){
                                cursave.listening = false;
                                string_JSON();
                                database_send();
                                return msg.reply("listening **disabled**. tipbax will no longer listen to your messages");
                            } else {
                                return msg.reply("listening has already been disabled");
                            }
                        break;
                        case "talking":
                            if(cursave.talking){
                                cursave.talking = false;
                                string_JSON();
                                database_send();
                                return msg.reply("talking **disabled**. tipbax will no longer talk in this server")
                            } else {
                                return msg.reply("talking has already been disabled");
                            }
                        break;
                        case "reacting":
                            if(cursave.reacting){
                                cursave.reacting = false;
                                string_JSON();
                                database_send();
                                return msg.reply("reacting **disabled**. tipbax will no longer make reactions");
                            } else {
                                return msg.reply("reacting has already been disabled");
                            }
                        break;
                    }
                break;
                case "generate":
                    if(!cursave.talking) return msg.reply("NUH UH. can't generate a message!! use the **enable** command to let me listen to messages");
                    generate_msg(true, true);
                break;
                case "channels":
                    if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return msg.reply("NUH UH. you dont have the **manage channels** permission");
                    if(args.length == 2){
                        var ch_array = [];
                        if(cursave.channels.length > 0){
                            for(let chn of cursave.channels){
                                ch_array[ch_array.length] = `<#${chn}>`;
                            }
                        } else {
                            ch_array = ["none"];
                        }
                        var helparray = [
                            `<@${bot_id}> channels add **list channels here** | **all**`,
                            `<@${bot_id}> channels remove **list channels here** | **all**`,
                            `**currently enabled channels:**`,
                            `${ch_array.join(" ")}`,
                        ];
                        var help = "";
                        for(var i = 0; i < helparray.length; i++){
                            help += helparray[i] + "\n";
                        }
                        return msg.reply(help);
                    }
                    if(args[2] == "add"){
                        if(args.length == 3){
                            return msg.reply(`<@${bot_id}> channels add **list channels here** | **all**`);
                        }
                        if(args.length >= 4){
                            if(args[3].toLowerCase() == "all"){
                                var channels = msg.guild.channels.cache.filter(ch => ch.type == 0);
                                for(var textChat of channels){
                                    if(!cursave.channels.includes(textChat[0])){
                                        cursave.channels.push(textChat[0]);
                                    }
                                }

                                string_JSON();
                                database_send();

                                return msg.reply("tipbax will now work in all channels");
                            }
                            var success = 0;
                            for(var i = 3; i < args.length; i++){
                                var textChat = args[i].replace('<#','').replace('>','');
                                var chn = msg.guild.channels.cache.find(ch => ch.id == textChat);
                                if(chn != undefined){
                                    if(!cursave.channels.includes(textChat)){
                                    cursave.channels.push(textChat);
                                    success ++;
                                    }
                                }
                            }

                            if(success == 0){
                            return msg.reply("no valid channels were added");
                            }

                            string_JSON();
                            database_send();

                            return msg.reply("tipbax will now work in these channels");
                        }
                    } else if(args[2] == "remove"){
                        if(args.length == 3){
                            return msg.reply(`<@${bot_id}> channels remove **list channels here** | **all**`);
                        }
                        if(args.length >= 4){
                            if(args[3].toLowerCase() == "all"){
                                cursave.channels = [];

                                string_JSON();
                                database_send();

                                return msg.reply("active channels cleared");
                            }
                            var success = 0;
                            for(var i = 3; i < args.length; i++){
                                var textChat = args[i].replace('<#','').replace('>','');
                                var chn = msg.guild.channels.cache.find(ch => ch.id == textChat);
                                if(chn != undefined){
                                    success ++;
                                    if(cursave.channels.includes(textChat)){
                                        cursave.channels = cursave.channels.filter(function(item){
                                            return item != textChat;
                                        })
                                    }
                                }
                            }

                            if(success == 0){
                                return msg.reply("no valid channels were removed");
                            }

                            string_JSON();
                            database_send();

                            return msg.reply("tipbax will now **NOT** work in these channels");
                        }
                    }
                break;
                case "interval":
                    if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return msg.reply("NUH UH. you dont have the **manage channels** permission");
                    if(args.length == 2){
                        return msg.reply(`**interval <number>** - set message interval (1-999).\ncurrent interval: ${cursave.interval}`);
                    }
                    if(isNaN(parseInt(args[2]))) return msg.reply("thats not a number");
                    var num = parseInt(args[2]);
                    if(num < 1) num = 1;
                    if(num > 999) num = 999;
                    cursave.interval = num;

                    string_JSON();
                    database_send();

                    return msg.reply(`ok. changed current interval to **${num}**`);
                break;
                case "reset":
                    if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return msg.reply("NUH UH. you dont have the **manage channels** permission");
                    if(cursave.words.length == 0) return msg.reply("you can't do that. there are no currently saved messages");
                    msg.reply("**WARNING!!!** this will reset tipbax's collected messages on this server. are you really really sure you want to do that?").then(m => {
                        m.react('👍');
                        var collectorFilter = (reaction, user) => {
                            return reaction.emoji.name == '👍' && user.id == msg.author.id;
                        };
                        var collector = m.createReactionCollector({ filter: collectorFilter, time: 15_000 });
                        collector.on('collect', (reaction, user) => {
                            cursave.words = [];
                            string_JSON();
                            database_send();
                            msg.channel.send("ok. tipbax's stored messages have been reset");
                            collector.stop();
                        });
                    });
                break;
                default:
                    generate_msg(true, false);
                    add_msg();
                break;
            }
        } else {
            add_msg();
        }

        //generate messages on its own
        if(save[msg.guild.id]){
            var rand = Math.floor(Math.random() * cursave.interval);
            if(rand == 0){
                generate_msg(false, false);
                return;
            }
        }
    }
});

client.login(bot_token);
console.log("bot login...");

//server
const http = require('http');

const requestListener = function (req, res) {
    res.writeHead(200)
    res.end('server on')
}

const server = http.createServer(requestListener)
server.listen(8080)
console.log('server listening')