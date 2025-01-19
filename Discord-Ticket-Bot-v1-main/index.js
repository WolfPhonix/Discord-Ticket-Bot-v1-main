const { Client, GatewayIntentBits, Partials, ActivityType, ChannelType, PermissionsBitField, ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, Events, Collection, ModalBuilder, TextInputBuilder, AttachmentBuilder, TextInputStyle, AuditLogEvent } = require('discord.js');
const path = require('path');
const ftp = require('basic-ftp');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const axios = require('axios');

const dataFilePath = path.join(__dirname, 'data.json');
let data = require(dataFilePath);


if (!data.tickets) {
  data.tickets = [];
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

function formatDateInBerlinTimezone(date) {
  const berlinTimezone = 'Europe/Berlin';
  return new Date(date).toLocaleString('de-DE', { timeZone: berlinTimezone });
 }


const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a)=>{
    return GatewayIntentBits[a]
  }),
  partials: [
      Partials.Channel
  ],
});

const clientId = 'BOT_CLIENT_ID';
const token = 'BOT_TOKEN';
const ticket_sperre_id = 'BEWERBUNGS_SPERREN_ROLLEN_ID';
const guildId = 'SERVER_ID';
const logChannelId = 'LOGS_CHANNEL_ID';
         
client.once('ready', () => {
  console.log(`🔥 | Bot eingeloggt als ${client.user.tag}`);
  console.log(`⏱️ | Zeitzone gesetzt auf Europe/Berlin (${formatDateInBerlinTimezone(new Date())})`);
  updatePresence();
  setInterval(updatePresence, 160000);
   });

function updatePresence() {
  const totalTickets = data.tickets.length;
  client.user.setPresence({
    activities: [{ name: `🎫 - ${totalTickets} Tickets`, type: ActivityType.Watching }],
    status: 'dnd',
  });
}
client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;

  const selectedValue = interaction.values[0];
  const ticket1 = data.tickets.find(t => t.userid === interaction.user.id);
   if (interaction.member.roles.cache.has(ticket_sperre_id)) {
       return interaction.reply({content:"`❌`〢Du hast eine Bewerbungssperre und kannst deshalb kein Ticket öffnen", ephemeral: true});
   }
  if (selectedValue === 'cancel') {
      await interaction.deferUpdate();
  }
 if (!ticket1) {
  if (selectedValue === 'support' || selectedValue === 'meldung' || selectedValue === 'bewerbung' || selectedValue === 'ausleih') {
    const username = interaction.user.username;
    const formattedUsername = username.charAt(0).match(/[a-zA-Z]/) ? username.charAt(0).toUpperCase() + username.slice(1) : username;
    const fselect = selectedValue.charAt(0).match(/[a-zA-Z]/) ? selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1) : selectedValue;

    const channelName = `${fselect}︱${interaction.user.globalName}`;
    const categoryId = interaction.channel.parentId;

    try {
      const thread = await interaction.channel.threads.create({
        name: channelName,
        type: ChannelType.PrivateThread,
        permissionOverwrites: [
        {
			id: interaction.guild.id,
			allow: [PermissionsBitField.Flags.SendMessages],
		},
		{
			id: interaction.guild.id,
			allow: [PermissionsBitField.Flags.SendMessages],
		},
		],
       })
        .then(async (thread) => {
          updatePresence();
          await thread.members.add(interaction.user);
		  const ticketembed = new EmbedBuilder()
            .setTitle(`\`🎫\`〢${fselect} - ${interaction.user.globalName}`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`Willkommen zu Ihrem Ticket! Ein Teammitglied wird sich so schnell wie möglich um Sie kümmern. Bitte beschreiben Sie Ihr Problem so genau wie möglich. Sie können das Ticket jederzeit schließen, indem Sie auf die Schaltfläche unten klicken.

**Details:**
> Ticket Panel: ${fselect}
> Erstellt am: ${formatDateInBerlinTimezone(new Date())}`)
            .setColor('#0798e3');

          const closebutton = new ButtonBuilder()
            .setCustomId('close')
            .setLabel('⛔ x Ticket schließen')
            .setStyle(ButtonStyle.Secondary);

         
          const embedrow = new ActionRowBuilder()
            .addComponents(closebutton);
          thread.send({ embeds: [ticketembed], components: [embedrow] });

          const logEmbed2 = new EmbedBuilder()
              .setTitle(`\`🔓\`〢Ein Ticket wurde geöffnet!`)
        .setDescription(`・Ticket-ID: #${interaction.channel.id}
					・Ticket Panel: ${fselect}
                    ・Ticket erstellt von: <@${interaction.user.id}> *(${interaction.user.tag})*
                    ・Datum und Uhrzeit: ${formatDateInBerlinTimezone(new Date())}`)
        .setColor('#89CA8C');

          const buttonlog = new ButtonBuilder()
            .setCustomId('join')
            .setLabel('🚪 x Ticket beitreten')
            .setStyle(ButtonStyle.Secondary);
          const logChannel = await interaction.guild.channels.cache.get(logChannelId);
		  const logembedrow = new ActionRowBuilder()
            .addComponents(buttonlog);
          
          const sentLogEmbed2 = await logChannel.send({ embeds: [logEmbed2], components: [logembedrow] });

          const ticketData = {
            ticketId: thread.id,
            userid: interaction.user.id,
            usertag: interaction.user.tag,
            ticketpanel: selectedValue,
            logEmbed2Id: sentLogEmbed2.id,
          };

          data.tickets.push(ticketData);
          fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

          await interaction.reply({ content: `\`✅\`〢Dein Ticket wurde hier erstellt: <#${thread.id}>`, ephemeral: true });
        })
    } catch (error) {
      interaction.reply({ content: '`❌`〢Es ist ein Fehler aufgetreten! Bitte melde folgenden Error einem Administrator:``` ' + error + "```", ephemeral: true });
    };
  }
  } else {
      await interaction.reply({ content:"`❌`〢Du kannst nicht mehr als ein Ticket erstellen", ephemeral: true })
  }
  
});


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  const threadId = interaction.channelId;
  const thread = await client.channels.fetch(threadId);
  if (interaction.customId === 'verweigerung') {
          if (interaction.user.id !== ticketData.userid) {
        return interaction.reply({ content:"`❌`〢Du kannst du nicht!", ephemeral: true });
    }
      interaction.message.delete();
  } else if (interaction.customId === 'close' || interaction.customId === 'accept') {
    try {
        if (interaction.customId === 'accept' && interaction.user.id !== ticketData.userid) {
        return interaction.reply({ content:"`❌`〢Du kannst du nicht!", ephemeral: true });
    }
    
        const ticketuserId = ticketData ? ticketData.userid : null;
        const ticketusertag = ticketData ? ticketData.usertag : null;
        const selectedticketpanel = ticketData ? ticketData.ticketpanel : null;
        const fselectedpanel = selectedticketpanel.charAt(0).match(/[a-zA-Z]/) ? selectedticketpanel.charAt(0).toUpperCase() + selectedticketpanel.slice(1) : selectedticketpanel;

        const logEmbed = new EmbedBuilder()
            .setTitle(`\`🔒\`〢Ein Ticket wurde geschlossen!`)
            .setDescription(`・Ticket-ID: #${interaction.channel.id}
                    ・Ticket Panel: ${fselectedpanel}
                    ・Ticket erstellt von: <@${ticketuserId}> *(${ticketusertag})*
                    ・Ticket geschlossen von: <@${interaction.user.id}> *(${interaction.user.tag})*
                    ・Datum und Uhrzeit: ${formatDateInBerlinTimezone(new Date())}`)
            .setColor('#E17272');
        
        

        const logChannel = await interaction.guild.channels.cache.get(logChannelId);

        const messages = await interaction.channel.messages.fetch();
        let messageLog = '';

        messages.forEach(message => {
            const timestamp = formatDateInBerlinTimezone(message.createdAt);
            const username = message.author.username;
            const content = message.content;

            messageLog += `[${timestamp}] ${username}: ${content}\n`;
        });

        const pasteBinUrl = await uploadToPastebin(messageLog);
         const transcriptbutton = new ButtonBuilder()
      .setLabel('🔗 x Transcript öffnen')
      .setURL(pasteBinUrl)
      .setStyle(ButtonStyle.Link);
    const buttonsRow3 = new ActionRowBuilder()
      .addComponents(transcriptbutton);

		
        await logChannel.send({ embeds: [logEmbed], components: [buttonsRow3] });
        await interaction.reply({ content:"`🔒`〢Du hast das Ticket erfolgreich geschlossen!", ephemeral: true })
        await thread.send('`🔒`〢Ticket wurde geschlossen!');

        if (ticketData) {
            const dataIndex = data.tickets.indexOf(ticketData);
            data.tickets.splice(dataIndex, 1);
            fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        }
        await thread.delete();

    } catch (error) {
        interaction.reply({ content: '`❌`〢Es ist ein Fehler aufgetreten! Bitte melde folgenden Error einem Administrator:``` ' + error + "```", ephemeral: true });
    }
} else if (interaction.customId === 'join') {
    try {
      const ticketData = data.tickets.find(t => t.logEmbed2Id === interaction.message.id);

      if (ticketData) {
        const threadId = ticketData.ticketId;
        const ticketpanel = ticketData.ticketpanel;
        const thread = await client.channels.fetch(threadId);
        
        if (thread) {
          await thread.members.add(interaction.user);
          await interaction.reply({ content: `\`✅\`〢Du wurdest dem Ticket hinzugefügt: <#${thread.id}>`, ephemeral: true });
        } else {
          await interaction.reply({ content: '`❌`〢Das Ticket existiert nicht mehr oder ein Fehler ist aufgetreten!', ephemeral: true });
        }
      } else {
        await interaction.reply({ content: '`❌`〢Das Ticket konnte nicht gefunden werden!', ephemeral: true });
      }
    } catch (error) {
      interaction.reply({ content: '`❌`〢Es ist ein Fehler aufgetreten! Bitte melde folgenden Error einem Administrator:``` ' + error + "```", ephemeral: true });
    }
  }  
});



async function uploadToPastebin(messageLog) {
    const apiKey = 'PASTEBIN_API_KEY'; 
    const apiUrl = 'https://pastebin.com/api/api_post.php';

    const formData = new URLSearchParams();
    formData.append('api_dev_key', apiKey);
    formData.append('api_option', 'paste');
    formData.append('api_paste_code', messageLog);
    formData.append('api_paste_private', '1');

    try {
        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.startsWith('https://')) {
            return response.data; 
        } else {
            throw new Error('Fehler beim Hochladen auf Pastebin');
        }
    } catch (error) {
        throw new Error('Fehler beim Hochladen auf Pastebin: ' + error.message);
    }
}

client.commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('✅ | Aktualisiere die Slash Commands (/)');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [...client.commands.values()].map(command => command.data.toJSON()) },
    );

    console.log('✅ | Alle Slash Commands (/) wurden erfolgreich geladen');
  } catch (error) {
    console.error(error);
  }
})();
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (!client.commands.has(commandName)) return;
    
  try {
    await client.commands.get(commandName).execute(interaction);
    } catch (error) {
    await interaction.reply({ content: '`❌`〢Es ist ein Fehler aufgetreten! Bitte melde folgenden Error einem Administrator:``` ' + error + "```", ephemeral: true });
  }
});

client.login(token);
