const {
	JSDOM
} = require('jsdom');
let db = require("./database.js").data;
const fs = require("fs");
const token = process.env['token'];
const fetch = (...args) => import('node-fetch').then(({
	default: fetch
}) => fetch(...args));
const DetectLanguage = require('detectlanguage');
const langDetect = new DetectLanguage(process.env['detect_language_key']);
const translate = require("translate");

function save() {
	fs.writeFileSync("./database.js", "exports.data=" + JSON.stringify(db));
}

const {
	Client,
	Collection,
	Intents,
	Message,
	MessageEmbed,
	WebhookClient
} = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'ADMINISTRATOR'],
	intents: Object.keys(Discord.Intents.FLAGS)
});
client.once("ready", () => {
	console.log("Bot ready");
});
let id = 0;

function stract(txt, setting, end) {
	try {
		return txt.split(setting)[1].split(end)[0];
	} catch (e) {
		return "Not Available";
	}
};

function entranceCheck(txt) {
	if (stract(txt, `<setting name="Shuffle Entrances">`, "</setting>") === "On") {
		return [{
				"name": `Entrance Shuffle`,
				"value": stract(txt, `<setting name="Shuffle Entrances">`, "</setting>"),
				"inline": true
			},
			{
				"name": `Dungeon Entrance Shuffle`,
				"value": stract(txt, `<setting name="  Dungeon Entrances">`, "</setting>"),
				"inline": true
			},
			{
				"name": `Overworld Entrance Shuffle`,
				"value": stract(txt, `<setting name="  Overworld Entrances">`, "</setting>"),
				"inline": true
			},
			{
				"name": `Interior Entrance Shuffle`,
				"value": stract(txt, `<setting name="  Interior Entrances">`, "</setting>"),
				"inline": true
			},
			{
				"name": `Grotto Entrance Shuffle`,
				"value": stract(txt, `<setting name="  Grottos Entrances">`, "</setting>"),
				"inline": true
			},
		];
	} else {
		return {
			"name": `Entrance Shuffle`,
			"value": stract(txt, `<setting name="Shuffle Entrances">`, "</setting>"),
			"inline": true
		};
	}
}
client.on("messageCreate", async msg => {
	async function tr(txt, langTo, langFrom) {
		console.log("Received " + txt + " " + langTo + " " + langFrom + " in the non-detect");
		try {
			translate(txt, {
				to: langTo,
				from: langFrom
			}).then(Transtext => {
				msg.reply("Translated from " + langFrom + " to " + langTo + ":\n```\n" + Transtext + "```");
			});
		} catch (e) {}
	};
	try {
		id = msg.guild.id;
	} catch (e) {
		id = 0;
	}

	function perms(perm) {
		if (id !== 0) {
			if (perm === "Kestron" || msg.author.id === "949401296404905995") {
				return msg.author.id === "949401296404905995";
			}
			return id === 0 || (msg.member.permissions.has(perm));
		} else {
			return false;
		}
	}

	if (msg.content.startsWith(db.prefix)) {
		let comm = msg.content.slice(1, msg.content.length).toLowerCase();
		if (comm.startsWith("translate")) {
			let args = ["", "", ""];
			let stops = [false, false, false];
			comm = msg.content.slice(12, msg.content.length);
			if (comm.includes(`"`)) {
				//Get the text to translate
				for (var i = 0; i < comm.length; i++) {
					if (comm[i] !== `"`) {
						args[0] += comm[i];
					} else {
						if (i !== comm.length - 1) {
							stops[0] = i + 2;
						}
						i = comm.length;
						console.log(args[0]);
					}
				}

				//Get the language to
				if (stops[0] !== false) {
					for (var i = stops[0]; i < comm.length; i++) {
						if (comm[i] !== " ") {
							args[1] += comm[i];
						} else {
							if (i !== comm.length - 1) {
								stops[1] = i + 1;
							}
							i = comm.length;
							console.log(args[1]);
						}
					}
				} else {
					args[1] = "en";
				}

				//Get the language from
				if (stops[1] !== false) {
					args[2] = comm.slice(stops[1], comm.length);
				}


				langDetect.detect(args[0]).then(result => {
					if (args[2] === "") {
						args[2] = eval(result)[0].language;
					}
					tr(args[0], args[1], args[2]);
				});
			} else {
				msg.reply("Whoops! Wrap the text you want translated in quotes!");
			}
			//sendMsg("Translation is currently offline for auto-detection upgrades. Please try again later.");
		}

		if (comm.startsWith('def')) {
			fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + comm.slice(4, comm.length))
				.then(res => res.text())
				.then(def => {
					if (!def.includes("No Definitions Found")) {
						/*

						*/
						def = eval(def)[0];
						let col = [];
						for (var i = 0; i < def.meanings.length; i++) {
							if (def.meanings[i].definitions[0].example !== undefined) {
								col.push({
									name: "Type: " + def.meanings[i].partOfSpeech,
									value: def.meanings[i].definitions[0].definition + "\nExample: " + def.meanings[i].definitions[0].example,
								});
							} else {

								col.push({
									name: "Type: " + def.meanings[i].partOfSpeech,
									value: def.meanings[i].definitions[0].definition,
								});
							}
						}
						let embed = {
							"type": "rich",
							"title": `Definition of ` + def.word,
							"description": "",
							"color": 0xff0000,
							"fields": col,
							"author": {
								"name": `OOT3DRandomizer Bot`
							},
							"footer": {
								"text": `Definition of ` + def.word
							}
						};
						msg.reply({
							content: "Definition:",
							embeds: [embed]
						});
					} else {
						msg.reply("I didn't find that word.");
					}
				})
		}
		if (comm.startsWith("ping")) {
			msg.channel.send("Responded in " + client.ws.ping + " milliseconds.");
		}
		if (comm.startsWith("64")) {
			msg.channel.send("This server is for the randomizer focused on the 3DS version of Ocarina of Time. If you would like to view the server focused on the original randomizer for the Nintendo 64, go here. https://discord.gg/ootrandomizer");
		}
		if (comm.startsWith("cows")) {
			msg.channel.send("A list of cows in Ocarina of Time can be found here.\nhttps://wiki.ootrandomizer.com/index.php?title=Cows");
		}
		if (comm.startsWith("citra")) {
			msg.channel.send("If you would like to play on PC or Android, you can use Citra. <https://citra-emu.org/>.\nPlease note that to play with Citra, you will still need a copy of OOT3D. Type " + db.prefix + "dump for the guide to dumping your copy.");
		}
		if (comm.startsWith("dump")) {
			msg.channel.send("To dump a cart of OOT3D, you will need to follow the steps listed here.\nhttps://3ds.hacks.guide/dumping-titles-and-game-cartridges\nNote that a 3DS with CFW installed is required. To install CFW, start here.\nhttps://3ds.hacks.guide/get-started");
		}
		if (comm.startsWith("glossary")) {
			msg.channel.send("To view a list of acronyms pertaining to Ocarina of Time, you can view the glossary here.\nhttps://wiki.ootrandomizer.com/index.php?title=Glossary");
		}
		if (comm.startsWith("grottos")) {
			msg.channel.send("A list of all grottos and their locations can be found here.\nhttps://wiki.ootrandomizer.com/index.php?title=Grottos");
		}
		if (comm.startsWith("hash")) {
			msg.channel.send("The seed hash is a list of five items. This list has no bearing on the game. It is a way of determining that all players are utilizing the same settings during a race, and also as a way of making multiplayer sessions function. The hash can be viewed upon patch creation, or when pressing select during the game.");
		}
		if (comm.startsWith("latest")) {
			msg.channel.send("The latest Nightly or pre-release version can be found at <" + db.latestNightly + ">\n\nThe latest stable release can be found at <" + db.latestStable + ">");
		}
		if (comm.startsWith("logic")) {
			msg.channel.send("Logic in this context refers to how the randomizer places items. It helps to ensure that every seed is beatable in the way the player would like to play it.\n```\nGlitchless - Beat the seed with no glitches involved\nGlitched - For experienced players, requires the use of glitches to beat but is still possible.\nNo Logic - No logic is used during patch creation. Heavy use of glitches are required and it may be impossible to beat.\nVanilla - Play the game with all items in the normal spots, but with the other features the randomizer provides still available.```\nFor help with different logic tricks, visit https://wiki.ootrandomizer.com/index.php?title=Logic");
		}
		else if (comm.startsWith("log")) {
			msg.channel.send("The spoiler log is a list of all item locations and can be useful when there seems to be a logic bug or you can't find an item. ```\nConsole - If you go into your SD Card's files, you can find it under 3ds. Its name will reflect that of your seed hash. (Type `!hash` for an explanation)\n\nCitra - You will need to locate your Citra installation. You can do this by opening Citra, right clicking in the menu, and then pressing 'Open Citra Folder'. If you are on an Android device, this will be under citra-emu in your device's storage. You can then go to /sdmc/3ds. Its name will reflect that of your seed hash.```");
		}
		if (comm.startsWith("letter")) {
			msg.channel.send("If on an older version, Zelda's Letter cannot be randomized. This is due to the nature of the item. It starts out as the Weird Egg. After it becomes a cucco and is utilized to wake Talon, it will become Zelda's Letter after talking to Zelda. As such if you would like to randomize Zelda's Letter, you can do so by randomizing the Weird Egg.");
		}
		if (comm.startsWith("multiworld")) {
			msg.channel.send("Multiworld is currently not available for OOT3D.");
		}
		if (comm.startsWith("progressive")) {
			msg.channel.send("Progressive items are those that always start in their weakest form and get upgraded each time you find another. For example, there are two progressive hookshots. If you find one, it doesn't matter which one it is, you will get a normal hookshot. As soon as you find the other one, you will have a longshot. Below is a list of items that are considered progressive. ```\nFairy Ocarina > Ocarina of Time\nHookshot > Longshot\nBomb Bag > Big Bomb Bag > Biggest Bomb Bag\nGoron Bracelet > Silver Gauntlets > Gold Gauntlets\nSlingshot > Big Bullet Bag > Biggest Bullet Bag\nBow > Big Quiver > Biggest Quiver\nSilver Scale > Gold Scale\nBase Wallet (Start With) > Adult's Wallet > Giant's Wallet > Tycoon's Wallet (Randomizer Shop-Sanity Exclusive)\nMagic Meter > Big Magic Meter\nDeku Stick Capacity Upgrades\nDeku Nut Capacity Upgrades");
		}
		if (comm.startsWith("rom")) {
			msg.channel.send({files:["https://raw.githubusercontent.com/SMOMusic/OOT3DBot/main/piracy.png"],content:"For a guide on how to dump titles you own, type `" + db.prefix + "dump`. To obtain a free copy of any game go to <https://tinyurl.com/AllNintendoRoms>"});
		}
		if (comm.startsWith("scrub")) {
			msg.channel.send("For a list of all Business Scrubs and where to find them, visit https://wiki.ootrandomizer.com/index.php?title=Scrubs");
		}
		if (comm.startsWith("source")) {
			msg.channel.send("The randomizer is completely open-source. You can view the source code here: https://github.com/gamestabled/OoT3D_Randomizer");
		}
		if (comm.startsWith("texture")) {
			msg.channel.send("Texture packs only work while playing in Citra emulator (Type `!citra` for more information). A list of texture packs, including a high resolution 4k pack, can be found here. <https://gamebanana.com/mods/cats/10842>");
		}
		if (comm.startsWith("tracker")) {
			msg.channel.send("For a list of external trackers, you can visit https://wiki.ootrandomizer.com/index.php?title=Trackers. There is an in-game tracker available by pressing Select during gameplay. (Note that this button can be changed during patch creation)");
		}
		if (comm.startsWith("update") && perms("MANAGE_MESSAGES")) {
			let args = [];
			let on = 0;
			for (var i = 8; i < msg.content.length; i++) {
				if (msg.content[i] !== "|") {
					args[on] += msg.content[i];
				} else {
					on++;
				}
			}
			db.latestNightly = args[0];
			db.latestStable = args[1];
			update();
		}
		if (comm.startsWith("pre") && perms("MANAGE_MESSAGES")) {
			db.prefix = msg.content.slice(5, 1);
			msg.channel.send("My new prefix is `" + db.prefix + "`. Type `!prefix` at any time regardless of prefix to check what it currently is.");
			update();
		}
		if (comm.startsWith("commands") || comm.startsWith("help")) {
			msg.channel.send(`My current commands include the following:\n\`\`\`\n${db.prefix}ping\n${db.prefix}64\n${db.prefix}cows\n${db.prefix}citra\n${db.prefix}dump\n${db.prefix}glossary\n${db.prefix}grottos\n${db.prefix}hash\n${db.prefix}latest\n${db.prefix}logic\n${db.prefix}letter\n${db.prefix}log\n${db.prefix}multiworld\n${db.prefix}progressive\n${db.prefix}rom\n${db.prefix}scrub\n${db.prefix}source\n${db.prefix}texture\n${db.prefix}tracker\n${db.prefix}update (Admin only, contact Kestron for syntax)\n${db.prefix}pre (Admin only, change prefix)\n${db.prefix}commands\n${db.prefix}help\n!prefix (Prefix for this command is always "!")\n${db.prefix}hint (Parses the last spoiler log, or the one you reply to for hints)\`\`\``);
		}
		if (comm.startsWith("makepreset")) {
			let spoil = fs.readFileSync("./latestSpoiler.xml", "utf8");
			try {
				let mess = await msg.fetchReference();
				mess.attachments.forEach(async a => {
					if (a.name.includes("spoilerlog.xml")) {
						await fetch(a.url).then(d => d.text()).then(d => spoil = d);
					}
				});
			} catch (e) {}
			let settings = "<settings>" + spoil.split("<settings>")[1].split("</settings>")[0];
			let defaultPreset = await fs.readFileSync('./defaultPreset.xml', "utf8");
			let on = 0;
			let defaults = [];
			let wip = "";
			for (var i = 0; i < defaultPreset.length; i++) {
				if (defaultPreset[i] !== "\n") {
					wip += defaultPreset[i];
				} else {
					defaults.push(wip);
					wip = "";
				}
			}
			for (var i = 0; i < defaults.length; i++) {
				if (!settings.includes(defaults[i])) {
					settings += defaults[i];
				}
			}
			settings += "\n</settings>";
			await fs.writeFileSync("./autoGeneratedPreset.xml", settings);
			msg.reply({
				content: "Autogenerated preset file with the same settings as the spoiler log.",
				files: ["./autoGeneratedPreset.xml"]
			});
		}
		if (comm.startsWith("hint")) {
			try {
				let spoil = await fs.readFileSync("./latestSpoiler.xml", "utf8");
				let possibleHints = [];
				let hints = [];
				try {
					let mess = await msg.fetchReference();
					mess.attachments.forEach(async a => {
						if (a.name.includes("spoilerlog.xml")) {
							await fetch(a.url).then(d => d.text()).then(d => spoil = d);
						}
					});
				} catch (e) {}
				let spoiler = new JSDOM(spoil);
				let locations = spoiler.window.document.getElementsByTagName("all-locations")[0];
				let locationsToCheck = locations.getElementsByTagName("location");
				for (var i = 0; i < locationsToCheck.length; i++) {
					let location = locationsToCheck[i];
					//res+="\n"+location.textContent+": ||"+location.getAttribute("name")+"||";
					possibleHints.push({
						name: location.textContent,
						location: location.getAttribute("name")
					});
				}
				let searchTerm = msg.content.slice(6, msg.content.length);
				let res = "";
				if (searchTerm.length > 0) {
					for (var i = 0; i < possibleHints.length; i++) {
						if (possibleHints[i].name.toLowerCase().includes(searchTerm.toLowerCase())) {
							hints.push(possibleHints[i]);
						}
					}
					res = "Here's what I found";
					if (hints.length > 5) {
						res = "Here are the top 5 results";
					}
					if (hints.length === 0) {
						res = "I didn't find anything that matched `" + searchTerm + "`";
					}
					let longest = 0;
					for (var i = 0; i < hints.length; i++) {
						if (hints[i].name.length > hints[longest].name.length) {
							longest = i;
						}
					}
					for (var i = 0; i < hints.length && i < 5; i++) {
						res += "\n`" + hints[i].name.padEnd(hints[longest].name.length) + "`: ||`" + hints[i].location.padEnd(60) + "`||";
					}
					msg.reply(res);
				} else {
					res = "No search term detected, here are five random spoilers.";
					let hints = [];
					for (var i = 0; i < 5; i++) {
						let num = Math.floor(Math.random() * possibleHints.length);
						hints.push(possibleHints[num]);
					}
					let longest = 0;
					for (var i = 0; i < hints.length; i++) {
						if (hints[i].name.length > hints[longest].name.length) {
							longest = i;
						}
					}
					for (var i = 0; i < hints.length; i++) {
						res += "\n`" + hints[i].name.padEnd(hints[longest].name.length) + "`: ||`" + hints[i].location.padEnd(60) + "`||";
					}
					msg.reply(res);
				}
			} catch (e) {
				msg.reply("Whoops! This spoiler log is incompatible with the hint command.");
				console.log(e);
			}
		}
	}
	if (msg.content.startsWith("!prefix")) {
		msg.channel.send("My current prefix is `" + db.prefix + "`");
	}
	try {
		msg.attachments.forEach(a => {
			if (a.name.includes("spoilerlog.xml")) {
				fetch(a.url).then(d => d.text()).then(d => {
					fs.writeFileSync("latestSpoiler.xml", d);
					//msg.reply(`Spoiler Log Parsed\n\`\`\`txt\nRandomizer Version: ${d.split(`<spoiler-log version="`)[1].split(`" seed="`)[0]}\n\nStarting Age: ${d.split(`<setting name="Starting Age">`)[1].split(`</setting>`)[0]}\nDoor of Time Requirements: ${d.split(`<setting name="Door of Time">`)[1].split("</setting>")[0]}\`\`\``);
					let warning = "";
					if (!stract(d, `<spoiler-log version="`, `" seed="`).includes("v3.1")) {
						warning = " WARNING: It is highly recommended that you update to the latest version. Type `" + db.prefix + "latest` for links to the latest versions.";
					}
					msg.reply({
						content: "Spoiler Log Parsed." + warning + "\n\nTo search item locations before another spoiler is uploaded, type `!hint ITEM`. To access this log later after more have uploaded, reply to the spoiler log you wish to search and type `!hint ITEM`",
						embeds: [{
							"type": "rich",
							"title": `Spoiler Log Parsed`,
							"description": "",
							"color": 0x0c8039,
							"fields": [{
									"name": `Randomizer Version`,
									"value": stract(d, `<spoiler-log version="`, `" seed="`),
									"inline": true
								},
								{
									"name": `Starting Age`,
									"value": stract(d, `<setting name="Starting Age">`, `</setting>`),
									"inline": true
								},
								{
									"name": `Door of Time Requirements`,
									"value": stract(d, `<setting name="Door of Time">`, "</setting>"),
									"inline": true
								},
								{
									"name": `Rainbow Bridge Requirements`,
									"value": stract(d, `<setting name="Rainbow Bridge">`, `</setting>`),
									"inline": true
								},
								{
									"name": `Ganon's Boss Key`,
									"value": `${stract(d,`<setting name="Ganon's Boss Key">`,`</setting>`)}`,
									"inline": true
								},
								entranceCheck(d),
							]
						}]
					});
				});
			}
		});
	} catch (e) {}
});
client.on("interactionCreate", async command => {
  function perms(perm) {
			return command.member.permissions.has(perm);
	}

	let comm = command.commandName;
	if (comm.startsWith("ping")) {
		command.reply("Responded in " + client.ws.ping + " milliseconds.");
	}
	if (comm.startsWith("64")) {
		command.reply("This server is for the randomizer focused on the 3DS version of Ocarina of Time. If you would like to view the server focused on the original randomizer for the Nintendo 64, go here. https://discord.gg/ootrandomizer");
	}
	if (comm.startsWith("cows")) {
		command.reply("A list of cows in Ocarina of Time can be found here.\nhttps://wiki.ootrandomizer.com/index.php?title=Cows");
	}
	if (comm.startsWith("citra")) {
		command.reply("If you would like to play on PC or Android, you can use Citra. https://citra-emu.org/.\nPlease note that to play with Citra, you will still need a copy of OOT3D. Type " + db.prefix + "dump for the guide to dumping your copy.");
	}
	if (comm.startsWith("dump")) {
		command.reply("To dump a cart of OOT3D, you will need to follow the steps listed here.\nhttps://3ds.hacks.guide/dumping-titles-and-game-cartridges\nNote that a 3DS with CFW installed is required. To install CFW, start here.\nhttps://3ds.hacks.guide/get-started");
	}
	if (comm.startsWith("glossary")) {
		command.reply("To view a list of acronyms pertaining to Ocarina of Time, you can view the glossary here.\nhttps://wiki.ootrandomizer.com/index.php?title=Glossary");
	}
	if (comm.startsWith("grottos")) {
		command.reply("A list of all grottos and their locations can be found here.\nhttps://wiki.ootrandomizer.com/index.php?title=Grottos");
	}
	if (comm.startsWith("hash")) {
		command.reply("The seed hash is a list of five items. This list has no bearing on the game. It is a way of determining that all players are utilizing the same settings during a race, and also as a way of making multiplayer sessions function. The hash can be viewed upon patch creation, or when pressing select during the game.");
	}
	if (comm.startsWith("latest")) {
		command.reply("The latest Nightly or pre-release version can be found at " + db.latestNightly + "\n\nThe latest stable release can be found at " + db.latestStable);
	}
	if (comm.startsWith("logic")) {
		command.reply("Logic in this context refers to how the randomizer places items. It helps to ensure that every seed is beatable in the way the player would like to play it.\n```\nGlitchless - Beat the seed with no glitches involved\nGlitched - For experienced players, requires the use of glitches to beat but is still possible.\nNo Logic - No logic is used during patch creation. Heavy use of glitches are required and it may be impossible to beat.\nVanilla - Play the game with all items in the normal spots, but with the other features the randomizer provides still available.```\nFor help with different logic tricks, visit https://wiki.ootrandomizer.com/index.php?title=Logic");
	}
	if (comm.startsWith("letter")) {
		command.reply("Zelda's Letter cannot be randomized. This is due to the nature of the item. It starts out as the Weird Egg. After it becomes a cucco and is utilized to wake Talon, it will become Zelda's Letter after talking to Zelda. As such if you would like to randomize Zelda's Letter, you can do so by randomizing the Weird Egg.");
	}
	if (comm.startsWith("log")) {
		command.reply("The spoiler log is a list of all item locations and can be useful when there seems to be a logic bug or you can't find an item. ```\nConsole - If you go into your SD Card's files, you can find it under 3ds. Its name will reflect that of your seed hash. (Type `!hash` for an explanation)\n\nCitra - You will need to locate your Citra installation. You can do this by opening Citra, right clicking in the menu, and then pressing 'Open Citra Folder'. If you are on an Android device, this will be under citra-emu in your device's storage. You can then go to /sdmc/3ds. Its name will reflect that of your seed hash.```");
	}
	if (comm.startsWith("multiworld")) {
		command.reply("Multiworld is currently not available for OOT3D.");
	}
	if (comm.startsWith("progressive")) {
		command.reply("Progressive items are those that always start in their weakest form and get upgraded each time you find another. For example, there are two progressive hookshots. If you find one, it doesn't matter which one it is, you will get a normal hookshot. As soon as you find the other one, you will have a longshot. Below is a list of items that are considered progressive. ```\nFairy Ocarina > Ocarina of Time\nHookshot > Longshot\nBomb Bag > Big Bomb Bag > Biggest Bomb Bag\nGoron Bracelet > Silver Gauntlets > Gold Gauntlets\nSlingshot > Big Bullet Bag > Biggest Bullet Bag\nBow > Big Quiver > Biggest Quiver\nSilver Scale > Gold Scale\nBase Wallet (Start With) > Adult's Wallet > Giant's Wallet > Tycoon's Wallet (Randomizer Shop-Sanity Exclusive)\nMagic Meter > Big Magic Meter\nDeku Stick Capacity Upgrades\nDeku Nut Capacity Upgrades");
	}
	if (comm.startsWith("rom")) {
		command.reply({files:["https://raw.githubusercontent.com/SMOMusic/OOT3DBot/main/piracy.png"],content:"For a guide on how to dump titles you own, type `" + db.prefix + "dump`. To obtain a free copy of any game go to <https://tinyurl.com/AllNintendoRoms>"});
	}
	if (comm.startsWith("scrub")) {
		command.reply("For a list of all Business Scrubs and where to find them, visit https://wiki.ootrandomizer.com/index.php?title=Scrubs");
	}
	if (comm.startsWith("source")) {
		command.reply("The randomizer is completely open-source. You can view the source code here: https://github.com/gamestabled/OoT3D_Randomizer");
	}
	if (comm.startsWith("texture")) {
		command.reply("Texture packs only work while playing in Citra emulator (Type `!citra` for more information). A list of texture packs, including a high resolution 4k pack, can be found here. https://gamebanana.com/mods/cats/10842");
	}
	if (comm.startsWith("tracker")) {
		command.reply("For a list of external trackers, you can visit https://wiki.ootrandomizer.com/index.php?title=Trackers. There is an in-game tracker available by pressing Select during gameplay. (Note that this button can be changed during patch creation)");
	}
	if (comm.startsWith("update") && perms("MANAGE_MESSAGES")) {
		db.latestNightly = comm.options.getString('nightly');
		db.latestStable = comm.options.getString('stable');
		update();
    command.reply({content: "Updated", ephemeral: true });
	}
	if (comm.startsWith("pre") && perms("MANAGE_MESSAGES")) {
		db.prefix = comm.options.getString('prefix');
		command.reply("My new prefix is `" + db.prefix + "`. Type `!prefix` at any time regardless of prefix to check what it currently is.");
	}
	if (comm.startsWith("commands") || comm.startsWith("help")) {
		command.reply(`My current commands include the following:\n\`\`\`\n${db.prefix}ping\n${db.prefix}64\n${db.prefix}cows\n${db.prefix}citra\n${db.prefix}dump\n${db.prefix}glossary\n${db.prefix}grottos\n${db.prefix}hash\n${db.prefix}latest\n${db.prefix}logic\n${db.prefix}letter\n${db.prefix}log\n${db.prefix}multiworld\n${db.prefix}progressive\n${db.prefix}rom\n${db.prefix}scrub\n${db.prefix}source\n${db.prefix}texture\n${db.prefix}tracker\n${db.prefix}update (Admin only, contact Kestron for syntax)\n${db.prefix}pre (Admin only, change prefix)\n${db.prefix}commands\n${db.prefix}help\n${db.prefix}hint - Searches spoiler log for hints\n${db.prefix}makePreset - Generates preset file from the spoiler log\n!prefix (Prefix for this command is always "!")\`\`\``);
	}
});
client.login(token);
