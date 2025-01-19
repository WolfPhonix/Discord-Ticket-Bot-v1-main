const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, PermissionFlagsBits, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const data = require('/home/container/data.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('closerequest')
    .setDMPermission(false)
    .setDescription('🔐〢Anfrage auf schließung'),
  async execute(interaction) {
   const ticketData = data.tickets.find(u => u.ticketId === interaction.channelId);
   if (!ticketData) {
  return interaction.reply({ content: '`❌`〢Dieser Befehl kann nur in einem Ticket ausgeführt werden.', ephemeral: true });
}
    const requestEmbed = new EmbedBuilder()
            .setTitle(`\`🎫\`〢**Schließ-Anfrage**`)
            .setDescription(`<@${interaction.user.id}> hat das Schließen dieses Tickets angefordert.
Bitte Akzeptiere oder Verweigere mit den untenstehenden Schalteflächen.`)
            .setColor('#0798e3');

          const acceptbutton = new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('✅ x Akzeptieren')
            .setStyle(ButtonStyle.Success);
		  const verweigerebutton = new ButtonBuilder()
            .setCustomId('verweigerung')
            .setLabel('❌ x Ablehnen')
            .setStyle(ButtonStyle.Secondary);

         
          const requestRow = new ActionRowBuilder()
            .addComponents(acceptbutton)
      		.addComponents(verweigerebutton);
     await interaction.reply({ content: `<@${ticketData.userid}>`, embeds: [requestEmbed], components: [requestRow] });
  },
};
