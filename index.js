//server
const http = require('http');

const requestListener = function (req, res) {
    res.writeHead(200)
    res.end('server on')
}

const server = http.createServer(requestListener)
server.listen(8080)
console.log('server listening')

//discord libraries and token
const bot_token = process.env.TOKEN;
const { Client, Events, GatewayIntentBits, ActivityType, AttachmentBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require("discord.js");

//other dependencies
const fs = require("fs");
const https = require('https');
const urban = require('relevant-urban');
const grawlix = require('grawlix');

const Jimp = require('jimp');
const emojiRegex = require('emoji-regex');
const { GifFrame, GifUtil, GifCodec } = require('gifwrap');

grawlix.setDefaults({
  allowed: ['fuck','bitch','shit','cock','sex','cum','dick','ass','piss','motherfucker','cunt','asses','motherfuck','bastard','bitchass','fuckass','dumbass','fatass','jackass'],
  plugins: [
    {
      plugin: require('grawlix-racism'),
      options: {
        style: 'asterix',
      }
    }
  ]
});

let database_init = false;
const version = "1.008";

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
        "Windows 95",
        "Nintendo Shitcube",
        "Lego Island",
        "Tetris 2000",
        "Crackhead Simulator",
        "Breaking Bad DS",
        "Earthworm Jim 3",
        "New Super Mario CBT",
        "CBT Wizard",
        "Where's Waldo",
        "Car Racing Game Free Download IOS",
        "Donkey Kong 64",
        "Undertale 3",
        "Hotel Mario",
		"Reggie Bodybuilding Simulator",
		"cahc adventure",
		"Bee role",
		"Golf",
		"FOOTBALL",
		"I... am TipBax",
		"Peggle Deluxe",
		"Peggle Extreme",
		"Peggle Nights",
		"Peggle Dinners",
		"Peggle",
		"Mr. Bean for Playstation 2"
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
    //in dm
    if(msg.channel.type == 'dm') return;

    //user is not bot
    if(!msg.author.bot){
        if(!database_init) return;
        var args = msg.content.toLowerCase().split(" ");

        //make data
        if(!save[msg.guild.id]){
            save[msg.guild.id] = {
                words: [],
                pictures: [],
                channels: [],
                interval: 5,
                listening: false,
                talking: false,
                reacting: false,
                images: false,
            };
        }
        let cursave = save[msg.guild.id];

		function wordWrap(str, maxWidth) {
            var newLineStr = "\n"
            var done = false
            var res = ''
            while (str.length > maxWidth) {
                var found = false
                for (var i = maxWidth - 1; i >= 0; i--) {
                    if (testWhite(str.charAt(i))) {
                        res = res + [str.slice(0, i), newLineStr].join('')
                        str = str.slice(i + 1)
                        found = true
                        break
                    }
                }
                if (!found) {
                    res += [str.slice(0, maxWidth), newLineStr].join('')
                    str = str.slice(maxWidth)
                }
            }
            return res + str
        }
        function testWhite(x) {
            var white = new RegExp(/^\s$/)
            return white.test(x.charAt(0))
        }

        function add_msg(){
            if(cursave.channels.length == 0) return;
            if(!cursave.channels.includes(msg.channel.id)) return;

            if(cursave.listening){
                //put message into the data
                var arggs = args;
                arggs = arggs.filter(n => n != `<@${client.user.id}>`);
                arggs = arggs.filter(n => n != `<@!${client.user.id}>`);

                //attachments
                if(msg.attachments.size > 0){
                    for(var i = 0; i < msg.attachments.size; i++){
                        var attach = Array.from(msg.attachments)[i][1];
                        if(attach.contentType == "image/png" || attach.contentType == "image/jpg" || attach.contentType == "image/jpeg"){
                            cursave.pictures[cursave.pictures.length] = attach.url;
                        }
                    }
                    //if too many, remove older pictures
                    if(cursave.pictures.length > 50){
                        cursave.pictures = cursave.pictures.slice(-50);
                    }
                }

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

        function generate_msg(reply, sendfail, ret_string){
            if(!reply){
                if(cursave.channels.length == 0) return;
                if(!cursave.channels.includes(msg.channel.id)) return;

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
            } else {
                if(args[0] != prefix){
                    if(cursave.channels.length == 0){
						if(ret_string){
							return prefix
						} else {
							msg.reply("im not enabled in this channel");
						}
					}
                    if(!cursave.channels.includes(msg.channel.id)){
						if(ret_string){
							return prefix;
						} else {
							return msg.reply("im not enabled in this channel");
						}
					}
                } else {
                    if(cursave.channels.length == 0) return;
                    if(!cursave.channels.includes(msg.channel.id)) return;
                }
            }
            if((!reply && cursave.talking) || (reply)){
                //generate a string based on previous messages
                if(sendfail){
                    if(args[0] != prefix){
                        if(cursave.words.length == 0){
							if(ret_string){
								return prefix;
							} else {
								return msg.reply("not enough messages saved");
							}
						}
                    } else {
                        if(cursave.words.length == 0){
							if(ret_string){
								return prefix;
							} else {
								return;
							}
						}
                    }
                } else {
                    if(cursave.words.length == 0) return;
                }
                var finalstring = [];
                for(var i = 0; i < Math.floor((Math.random()*10)+1); i++){
					var word = cursave.words[Math.floor(Math.random()*cursave.words.length)];
					if(!word.toLowerCase().startsWith('http') && !word.toLowerCase().startsWith('https') && !word.toLowerCase().startsWith('discord.gg')){
						finalstring.push(word);
					}
                }
                var uppercase = false;
                if(Math.floor(Math.random()*4) == 1){
                    uppercase = true;
                }
				
				if(finalstring.length == 0){
					if(reply){
						if(ret_string){
							return prefix;
						} else {
							return msg.reply("couldn't generate anything");
						}
					} else {
						return;
					}
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
                var sendPicture = true;
                var picBuffer = {};

                var randChance = Math.floor(Math.random()*10);
            
                var finalstring2 = finalstring.join(' ').split(' ');
                for(var i = 0; i < finalstring2.length; i++){
                    if(finalstring2[i].startsWith('HTTP')){
                        finalstring2[i] = finalstring2[i].toLowerCase();
                    }
                }

                msgReply = finalstring2.join(' ').replace(/@everyone/g, '@everyоne').replace(/@here/g, '@hеre').replace(/\\n/g, ' ');

				if(ret_string){
					return msgReply;
				} else {
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
        }
		
		var repliedto = false;
		var mentioned = false;
		
		var command = true;
		
		if(msg.type == 19 && msg.mentions.repliedUser.id == client.user.id){
            repliedto = true;
        }
		
		//bot mentioned
		for(var i = 0; i < args.length; i++){
			if(args[i] == `<@${client.user.id}>` || args[i] == `<@!${client.user.id}>`){
				mentioned = true;
			}
		}
		
        if(args[0].toLowerCase() == prefix || repliedto || mentioned){
            if(args.length == 1){
                generate_msg(true, false, false);
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
                        `**enable listening/talking/reacting | all**`,
                        `**disable listening/talking/reacting | all**`,
                        `**generate** - generate a random message`,
                        `**channels add/remove** - prevent me from talking in specific channels`,
                        `**interval** - set interval`,
                        `**reset** - reset tipbax's memory in this server`,
						``,
						`**urban/ub | search | search, page** - search urban dictionary (might contain some vile shit)`,
						`**jim | message** - generate an earthworm jim title card`,
                    ];
                    return msg.reply(helpArray.join("\n"));
                break;
                case "invite":
                    return msg.reply("https://discord.com/oauth2/authorize?client_id=1214233339012063373&scope=bot&permissions=274878286912");
                break;
                case "enable":
                    if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return msg.reply("NUH UH. you dont have the **manage channels** permission");
                    if(args.length == 2){
                        return msg.reply(`**enable listening/talking/reacting | all**`);
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
                        case "all":
                            if(cursave.listening && cursave.talking && cursave.reacting) return msg.reply("all options are already enabled");
                            cursave.listening = true;
                            cursave.talking = true;
                            cursave.reacting = true;
                            if(!cursave.channels.includes(msg.channel.id)){
                                cursave.channels.push(msg.channel.id);
                            }
                            string_JSON();
                            database_send();
                            return msg.reply("ok. enabled listening, talking and reacting to messages");
                        break;
                    }
                break;
                case "disable":
                    if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return msg.reply("NUH UH. you dont have the **manage channels** permission");
                    if(args.length == 2){
                        return msg.reply(`**disable listening/talking/reacting | all**`);
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
                        case "all":
                            if(!cursave.listening && !cursave.talking && !cursave.reacting) return msg.reply("all options are already disabled");
                            cursave.listening = false;
                            cursave.talking = false;
                            cursave.reacting = false;
                            string_JSON();
                            database_send();
                            return msg.reply("ok. disabled listening, talking, and reacting to messages");
                        break;
                    }
                break;
                case "generate":
                    if(!cursave.talking) return msg.reply("NUH UH. can't generate a message!! use the **enable** command to let me listen to messages");
                    generate_msg(true, true, false);
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
                            cursave.pictures = [];
                            string_JSON();
                            database_send();
                            msg.channel.send("ok. tipbax's stored messages have been reset");
                            collector.stop();
                        });
                    });
                break;
				case "urban":
				case "ub":
					msg.channel.sendTyping();
				
					var urban_json = {};
					var input = 0;
					var page = 1;
					var random = false;
					if(args.length == 2){
						urban_json = urban.random();
						random = true;
					} else if(args.length > 2){
						random = false;
						var args2 = msg.content.split(" ");
						var split = args2.slice(2).join(" ").split(",");
						input = split[0].trim();
						if(split.length >= 2){
							page = parseInt(split[1].trim());
						} else {
							page = 1;
						}
						try {
							urban_json = urban.all(input);
						} catch {
							return msg.reply("couldn't find shit");
						}
					}
					Promise.resolve(urban_json).then(json => {
						var defs;
						var len;
						if(!random){
							defs = Object.entries(json);
							len = defs.length;
						}
						
						var ind = 0;
						
						//page check
						if(isNaN(page)){
							ind = 1;
						} else if(page <= 0){
							ind = 1;
						} else if(page > len-1){
							ind = len-1;
						} else {
							ind = page;
						}
						
						if(!random){
							try {
								var curdef = Object.entries(defs[ind][1]);
							} catch {
								return msg.reply("couldn't find shit");
							}
						} else {
							curdef = Object.entries(json);
							len = 2;
						}
						
						function escAstr(str) {
							return str.replace(/\*/g, '\\*');
						}
						
						function escSlash(str) {
							return str.replace(/\//g, '\\/');
						}
						
						var title = escAstr(grawlix(curdef[1][1]));
						var desc = escAstr(grawlix(curdef[2][1].slice(0,1000)));
						if(desc.length >= 1000){
							desc += "...";
						}
						var exam = escAstr(grawlix(curdef[3][1].slice(0,1000)));
						if(exam.length >= 1000){
							exam += "...";
						}
						var score = [curdef[6][1],curdef[7][1]];
						var urban_url = escSlash(curdef[4][1]);
						var auth = escAstr(grawlix(curdef[5][1]));
						var id = curdef[0][1];
						
						var row = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('prev')
								.setEmoji('⬅️')
								.setStyle('Secondary'),
							new ButtonBuilder()
								.setCustomId('next')
								.setEmoji('➡️')
								.setStyle('Secondary'),
						);
						
						if(ind == len-1){
							ind = 1;
							len = 2;
						}
						
						var msgcontent = `**${title}**\n\n${desc}\n\n"${exam}"\n\n👍 **${score[0].toString()}** 👎 **${score[1].toString()}**\n\**\- ${auth}**\n-# ${ind}/${len-1}  id: ${id}  url: ${urban_url}`;
						
						if(random || ind == len-1){
							msg.reply(msgcontent);
						} else {
							msg.reply({content: msgcontent, components: [row]}).then(curmsg => {
								var collector = curmsg.createMessageComponentCollector({ time: 300000000 });
								collector.on('collect', i => {
									switch(i.customId){
										case "prev":
											page -= 1;
											if(page < 1){
												page = 1;
											}
											break
										case "next":
											page += 1;
											if(page > len-1){
												page = len-1;
											}
											break
									}
									
									//page check
									if(isNaN(page)){
										ind = 1;
									} else if(page <= 0){
										ind = 1;
									} else if(page > len-1){
										ind = len-1;
									} else {
										ind = page;
									}
									
									curdef = Object.entries(defs[ind][1]);
									
									title = escAstr(grawlix(curdef[1][1]));
									desc = escAstr(grawlix(curdef[2][1].slice(0,1000)));
									if(desc.length >= 1000){
										desc += "...";
									}
									exam = escAstr(grawlix(curdef[3][1].slice(0,1000)));
									if(exam.length >= 1000){
										exam += "...";
									}
									score = [curdef[6][1],curdef[7][1]];
									urban_url = escSlash(curdef[4][1]);
									auth = escAstr(grawlix(curdef[5][1]));
									id = curdef[0][1];
									
									curmsg.edit({content: `**${title}**\n\n${desc}\n\n"${exam}"\n\n👍 **${score[0].toString()}** 👎 **${score[1].toString()}**\n\**\- ${auth}**\n-# ${ind}/${len-1}  id: ${id}  url: ${urban_url}`,components: [row]});
									
									i.deferUpdate();
								});
							});
						}
					});
				break;
				case "jim":
                    var letters = require('./jim-font.json');
					
					var regex = emojiRegex();
                    var removeEmoji = new RegExp(regex);

					var genmessage = generate_msg(true, true, true).toLowerCase();

                    var prompt = args.slice(2).join(' ').toLowerCase();
                    if(args[2] == undefined){
                        prompt = genmessage.substring(0,256);
                    }

                    var wrapped;
                    var textArray;

                    var wrapped = wordWrap(prompt, 13);

                    if(wrapped.length == 0){;
                        wrapped = prefix.toLowerCase();
                    }

                    var textArray = wrapped.split("\n");
                    for(var i = 0; i < textArray.length; i++){
                        textArray[i] = textArray[i].replace(removeEmoji, "").replace(/[^a-z0-9 !'?.,]/g, "");
                    }
                    if(textArray.length == 1 && textArray[0].length == 0){
                        textArray = [prefix.toLowerCase()];
                    }
                    if(textArray.length > 8){
                        textArray.length = 8;
                    }

                    var allFrames = 20;

                    var processingGIFS = [
                        'https://tenor.com/view/go-fuck-yourself-esm-esm-bot-discord-esm-caption-gif-gif-24603401',
						'https://tenor.com/view/esmbot-this-might-take-a-while-ifunny-gif-23777615',
						'https://tenor.com/view/esmbot-processing-this-might-take-a-while-waiting-esm-gif-25717035',
						'https://tenor.com/view/esm-bot-gif-24273329',
						'https://tenor.com/view/esmbot-esmbot-not-working-processing-this-might-take-a-while-esmbot-worked-gif-22467255',
						'https://tenor.com/view/esmbot-gif-22032901',
						'https://tenor.com/view/esmbot-mario-rap-gangsta-processing-gif-20677157',
						'https://tenor.com/view/processing-this-might-take-a-while-esmbot-gta-gif-24424743',
						'https://tenor.com/view/processing-gif-20334425',
						'https://tenor.com/view/esmbot-chungus-reddit-discord-poggers-gif-20268762',
						'https://tenor.com/view/processing-processing-this-might-take-a-while-this-might-take-a-while-a-whie-a-while-gif-20710844',
						'https://tenor.com/view/spongebob-patrick-melt-esmbot-processing-gif-20550425',
						'https://tenor.com/view/processing-esmbot-discord-discord-bot-beetlejuice-gif-19970580',
						'https://tenor.com/view/eric-andre-discord-waiting-death-meme-gif-22108265',
						'https://tenor.com/view/processing-gif-22244645'
                    ];

                    msg.reply(processingGIFS[Math.floor(Math.random() * processingGIFS.length)]).then(curmsg => {
						msg.channel.sendTyping();
                        Jimp.read('./img/jim.png').then(bg => {
                            Jimp.read('./img/jimfont.png').then(font => {
                                var gifWidth = bg.bitmap.width
                                var gifHeight = bg.bitmap.height
                                var frames = []
                                var frame
    
                                //make gif
                                for(var gifI = 0; gifI < allFrames; gifI++){
                                    var curX = 0
                                    var curY = 60
    
                                    var letter
    
                                    var blank = new Jimp(bg.bitmap.width, bg.bitmap.height)
                                    blank.composite(bg, 0, 0)
    
                                    for(var i = 0; i < textArray.length+1; i++){
                                        if(i < textArray.length){
                                            curX = (bg.bitmap.width/2)-((textArray[i].length)*28.5)
                                            for(var x = 0; x < textArray[i].length; x++){
                                                letter = font.clone()
                                                for(var y = 0; y < letters.length; y++){
                                                    if(letters[y].letter == textArray[i][x]){
                                                        letter.crop(parseInt(letters[y].x*3), parseInt(letters[y].y*3), parseInt((letters[y].x2*3) - (letters[y].x*3)), parseInt((letters[y].y2*3) - (letters[y].y*3)))
                                                        curX += 54
                                                        blank.composite(letter, curX - (((letters[y].x2*3) - (letters[y].x*3))/2), Math.round(((curY - ((letters[y].y2*3) - (letters[y].y*3))/2) + (Math.sin(((curX*60) + gifI)/3)*15))/3)*3)
                                                    }
                                                }
                                            }
                                            curY += 66
                                        }
                                    }
    
                                    frame = new GifFrame(gifWidth, gifHeight, { delayCentisecs: 2 })
                                    frame.bitmap.data = blank.bitmap.data
                                    frames.push(frame)
                                }
    
                                var codec = new GifCodec()
								
                                codec.encodeGif(frames, { loops: 0 }).then(gif => {
                                    curmsg.delete();
                                    return msg.reply({files: [ new AttachmentBuilder(gif.buffer, {name:'earthworm-jim.gif'}) ]});
                                })
                            })
                        })
                    })
				break;
                default:
					command = false;
                    generate_msg(true, false, false);
                    add_msg();
                break;
            }
        } else {
			command = false;
            add_msg();
        }

        //generate messages on its own
		if(!command){
			if(save[msg.guild.id]){
				var rand = Math.floor(Math.random() * cursave.interval);
				if(rand == 0){
					generate_msg(false, false, false);
					return;
				}
			}
		}
    }
});

client.login(bot_token);
console.log("bot login...");