const Discord = require('discord.js');
const quickDB = require('quick.db');
const ms = require('ms');

const config = require('./configs/config.json');
const package = require('./package.json');

//Initisializing discord client
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const prefix = config.prefix;

//On client ready
client.once('ready', ()=> {
    console.log('RepBot is now online!')
    client.user.setPresence({activities:[{name:'r-commands || Reputation 100000'}]})
})


//Create new database table
var repTable = new quickDB.table('repTable');

//When bot sees that message was created
client.on('messageCreate', (message) =>{

    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return; 

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //--------------Commands under here-------------

    if (command === '-version'){
        message.channel.send('RepBot running version: ' + package.version );
    }

    if (command === '-commands' || command === '-cmd'){

        const embed = new Discord.MessageEmbed()
        .setTitle('Commands')
        .setDescription('A list of RepBot commands!')
        .setColor('#F63016')
        .addFields(
            {
                name:'__r+rep__',
                value:'Give someone a reputation point! \n***Usage: r+rep @user***',
                inline: true
            },
            {
                name:'__r-rep__',
                value:'Take away someones reputation point! \n***Usage: r-rep @user***',
                inline: true
            },
            {
                name:'__r-check__',
                value:'Check someones reputation! \n***Usage: r-check @user or r-check to check yourself***',
                inline: true
            }
        )
        .addFields(

            {
                name:'__r-set__',
                value:'Set someones reputation! __**ADMIN ONLY**__ \n***Usage: r-set @user [valueToSet]***',
                inline: true
            },
            {
                name:'__r-resettimer || r-rt__',
                value:'Reset the cooldown between rep commands! __**ADMIN ONLY**__ \n***Usage: r-resettimer or r-rt***',
                inline: true
            }

        )
        .setFooter('RepBot', 'https://www.linkpicture.com/q/ProfilePic.png')

        message.channel.send({embeds: [embed]});
    }



    if(command === '+rep'){
        const timeout = 43200000;
        const cooldown = quickDB.fetch(`plusrep_${message.author.id}`);

        if (cooldown !== null && timeout - (Date.now() - cooldown) > 0){
            const time = ms(timeout - (Date.now() - cooldown));
            message.channel.send(`Sorry you must wait **${time}** before using this command again!`)
        }else{

            var messageAuthor = message.author.id;
            let targetMember = message.mentions.members.first();

            if (!targetMember){
               return message.reply('You need to tag a person in order to give them +rep')
            }
            if (targetMember.user == messageAuthor){
                return message.reply('You cant give yourself rep!')
            }
        
            repTable.add('reputation_' + targetMember.user, 1);
            var targetMemberRep = repTable.fetch('reputation_' + targetMember.user);
            message.channel.send('<@' + targetMember.user +  '> just recived rep from <@' + messageAuthor + ">. \n" + 'Their rep is now: ' + `**` + targetMemberRep + `**`);

            quickDB.set(`plusrep_${message.author.id}`, Date.now());
        }
        
    }

    if (command === '-rep'){
        const timeout = 43200000;
        const cooldown = quickDB.fetch(`minusrep_${message.author.id}`);

        if (cooldown !== null && timeout - (Date.now() - cooldown) > 0){
            const time = ms(timeout - (Date.now() - cooldown));
            message.channel.send(`Sorry you must wait **${time}** before using this command again!`)
        }else{
            var messageAuthor = message.author.id;
            let targetMember = message.mentions.members.first();

            if (!targetMember){
               return message.reply('You need to tag a person in order to give them -rep')
            }
            if (targetMember.user == messageAuthor){
                return message.reply('You cant give yourself rep!')
            }

            repTable.subtract('reputation_' + targetMember.user, 1);
            var targetMemberRep = repTable.fetch('reputation_' + targetMember.user);

            message.channel.send('<@' + targetMember.user +  '> just lost rep from <@' + messageAuthor + ">. \n" + 'Their rep is now: ' + `**` + targetMemberRep + `**`);

            quickDB.set(`minusrep_${message.author.id}`, Date.now());
        }
    
    }

    if (command === "-check"){
        let targetMember = message.mentions.members.first();
        let msgAuthor = message.author.id;

        if (!targetMember){
            let rep = repTable.fetch('reputation_' + msgAuthor);

            const embed = new Discord.MessageEmbed()
            .setTitle(`${message.author.username}`)
            .setColor('#F63016')
            .addField('Reputation:', `${rep}`)

            return message.reply({embeds: [embed]});
        }
        let rep = repTable.fetch('reputation_' + targetMember.user);
        
        const embed = new Discord.MessageEmbed()
        .setTitle(`${targetMember.displayName}`)
        .setColor('#F63016')
        .addField('Reputation:', `${rep}`)

        message.reply({embeds: [embed]});

    }

    if (command === '-top'){
        const guild = client.guilds.cache.get('684035492446339073');
        const memberCount = guild.memberCount;
        //TODO: THIS COMMAND :)

    }

    if (command === "-set"){
        let targetMember = message.mentions.members.first();
        
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You dont have permission to run this command!')
        }
        if (!targetMember){
            return message.reply('You didnt tag anyone to give reputation to')
        }
        if (args[1] == undefined){
            return message.reply('Didnt mention how much rep to give')
        }

        var valueToSet = parseInt(args[1], 10);
        

        repTable.set('reputation_' + targetMember.user, valueToSet);
        message.channel.send('<@' + targetMember.user +  '> reputation has been set to: ' + valueToSet);
    }

    //CANT GET TO WORK WITH REPTABLE WORKED WITH DEAFULT TABLE
   // if (command === '-clearrep'){
      //  if (!message.member.permissions.has('ADMINISTRATOR')) {
      //      return message.reply('You dont have permission to run this command!')
      //  }

     //   console.log(repTable.fetch('reputation_'));

        //message.reply('Deleted all of reputation data!');

  //  }

    if (command === '-resettimer' || command === '-rt'){
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You dont have permission to run this command!')
        }

        let minusTimer = quickDB.all().map(entry => entry.ID).filter(id => id.startsWith('minusrep_'));
        let plusTimer = quickDB.all().map(entry => entry.ID).filter(id => id.startsWith('plusrep_'));  

        minusTimer.forEach(quickDB.delete);
        plusTimer.forEach(quickDB.delete);

        message.reply('Deleted all of timer data!');

    }
    


})

client.login(config.token);