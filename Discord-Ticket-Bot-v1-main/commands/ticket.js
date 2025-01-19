const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, PermissionFlagsBits, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDMPermission(false)
    .setDescription('📚〢Ticket Commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('🔧〢Erstelle ein Ticketsystem'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: '`❌`〢Dieser Befehl kann nur in einem Server ausgeführt werden.', ephemeral: true });
    }
      
      if (interaction.options.getSubcommand() === 'setup') {
      const ticketEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription(`### \`🎫\` | TICKET SUPPORT
> \`👤\` | **Anmerkung zum Ticket Support**
> Wir bitte dich nur Ticket's zu öffnen die mit deinen ausgewählten Thema übereinstimmen! 
 
> \`📋\` | **Diese auswahlen gibt es:** 
> | Allgemeiner Support
> | Report
> | Teamler Bewerbung 
> | Geld- Itemausleih 
 
> \`📰\` | **Information zum Ticket Support:**
> Um ein Ticket zu öffnen drücke unten auf das Select Menü und wähle eine Kategorie aus. Es wird sich möglicher weiße ein Fenster eröffnen, wo du dein Anliegen genauer beschreiben musst!
`);
        const ticketselect = new StringSelectMenuBuilder()
			.setCustomId('ticketselect')
			.setPlaceholder('📌〢Wähle eine Option...')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('📌 x Allgemeiner Support')
					.setDescription('Klicken mich an um ein Ticket zu öffnen')
					.setValue('support'),
				new StringSelectMenuOptionBuilder()
					.setLabel('📡 x Einen Benutzer melden')
					.setDescription('Klicken mich an um ein Ticket zu öffnen')
					.setValue('meldung'),
				new StringSelectMenuOptionBuilder()
					.setLabel('🚀 x Bewerbung')
					.setDescription('Klicken mich an um ein Ticket zu öffnen')
					.setValue('bewerbung'),
				new StringSelectMenuOptionBuilder()
					.setLabel('📨 x Geld- Itemausleih')
					.setDescription('Klicken mich an um ein Ticket zu öffnen')
					.setValue('ausleih'),
                new StringSelectMenuOptionBuilder()
					.setLabel('❌ x Interaction Abbrechen')
					.setDescription('Klicken mich an um die Interaction abzubrechen')
					.setValue('cancel'),
			
			);
      const row = new ActionRowBuilder()
			.addComponents(ticketselect);
      await interaction.channel.send({ embeds: [ticketEmbed], components: [row] });
      await interaction.reply({ content: '`✅`〢Das Ticketsystem wurde erfolgreich erstellt!', ephemeral: true });
    }
  },
};
