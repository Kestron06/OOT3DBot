const token=process.env["token"]
async function gen(){
  const { SlashCommandBuilder } = require('@discordjs/builders');
  const { ContextMenuCommandBuilder } = require('@discordjs/builders');
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v9');
	let clientId="972976110038056980";
  
  const commands = [
  	new SlashCommandBuilder().setName('ping').setDescription("Bot latency"),
  	new SlashCommandBuilder().setName('64').setDescription("OOT64 Invite"),
  	new SlashCommandBuilder().setName('cows').setDescription("Stop streaming SMOMusic"),
  	new SlashCommandBuilder().setName('citra').setDescription("Citra info"),
		new SlashCommandBuilder().setName('dump').setDescription("Dumping guide"),
		new SlashCommandBuilder().setName('glossary').setDescription("Link to a list of acronyms"),
		new SlashCommandBuilder().setName('grottos').setDescription("List of grottos"),
		new SlashCommandBuilder().setName('hash').setDescription("Explains seed hashes"),
		new SlashCommandBuilder().setName('latest').setDescription("Get latest releases"),
		new SlashCommandBuilder().setName('logic').setDescription("Explains logic"),
		new SlashCommandBuilder().setName('letter').setDescription("Explains stuff about Zelda's Letter"),
		new SlashCommandBuilder().setName('log').setDescription("Spoiler Log info"),
		new SlashCommandBuilder().setName('multiworld').setDescription("Multiworld info"),
		new SlashCommandBuilder().setName('progressive').setDescription("Explains progressive items"),
		new SlashCommandBuilder().setName('rom').setDescription("How to get a ROM"),
		new SlashCommandBuilder().setName('scrub').setDescription("List of scub locations"),
		new SlashCommandBuilder().setName('source').setDescription("OOT3DR Source Code"),
		new SlashCommandBuilder().setName('texture').setDescription("Texture Pack info"),
		new SlashCommandBuilder().setName('tracker').setDescription("Explains trackers"),
		new SlashCommandBuilder().setName('update').setDescription("Admin only"),
		new SlashCommandBuilder().setName('pre').setDescription("Admin only"),
		new SlashCommandBuilder().setName('commands').setDescription("Help Menu"),
		new SlashCommandBuilder().setName('help').setDescription("Help Menu"),/*
		new SlashCommandBuilder().setName('translate').setDescription("Translate")
		.addStringOption(option =>
		option.setName('content')
			.setDescription('What to translate')
			.setRequired(true))
		.addStringOption(option =>
		option.setName('languageFrom')
			.setDescription("The language it's in (can autodetect)")
			.setRequired(false)).addStringOption(option =>
		option.setName('languageTo')
			.setDescription('The language it needs to be (default: English)')
			.setRequired(false)),
		new SlashCommandBuilder().setName('define').setDescription("Define")
		.addStringOption(option =>
		option.setName('word')
			.setDescription('Word to define')
			.setRequired(true)),*/
  ]
  	.map(command => command.toJSON());
  
  const rest = new REST({ version: '9' }).setToken(token);
  
  await rest.put(
  	Routes.applicationCommands(clientId),
  	{ body: commands },
  )
  	.then(() => console.log('Successfully refreshed application commands.'))
  	.catch(console.error);
}
gen();