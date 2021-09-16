const Discord = require('discord.js');
const config = require('./configs/config.json');
const package = require('./package.json');
const settings = require('./configs/BotSettings.json')

//Initisializing discord client
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const prefix = config.prefix;




//On client ready
client.once('ready', ()=> {
    console.log('RepBot is now online!')
    client.user.setPresence({activity: { name : '-help || Giving out reputation'}, status: 'online'})
    
})



client.on('messageCreate', (message) =>{

    //Dont need to use this because doing it a diffrent way
    //Gets the amount of members in discord server
    //const guild = client.guilds.cache.get('684035492446339073');
    //const memberCount = guild.memberCount;

    var repMaxAmount = settings.repMaxAmount;
    var repMinAmount = settings.repMinAmount;

    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return; 

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'version'){
        message.channel.send('RepBot running version: ' + package.version);
    }

    if(command === '+rep'){
        var messageAuthor = message.author.id;
        let targetMember = message.mentions.members.first();
        if (!targetMember){
            return message.reply('You need to tag a person in order to give them +rep')
        }
        message.channel.send('<@' + targetMember.user +  '> just recived rep from <@' + messageAuthor + ">. \n" + 'Their rep is now: ' + + repMaxAmount + "/" + repMinAmount)
    }

    if (command === '-rep'){
        var messageAuthor = message.author.id;
        let targetMember = message.mentions.members.first();
        if (!targetMember){
            return message.reply('You need to tag a person in order to give them -rep')
        }
        message.channel.send('<@' + targetMember.user +  '> just lost rep from <@' + messageAuthor + ">. \n" + 'Their rep is now: ' + + repMaxAmount + "/" + repMinAmount)
    }
    



})

client.login(config.token);