const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

require('dotenv').config();

const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 🔥 EDIT THESE
const WALL_CHANNEL_ID = "1472712043239837830";
const EMOJI_ID = "1472388555304210482";
const REACTION_THRESHOLD = 1;

client.on('messageReactionAdd', async (reaction, user) => {

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      return;
    }
  }

  if (reaction.emoji.id !== EMOJI_ID) return;
  if (reaction.count < REACTION_THRESHOLD) return;

  const message = reaction.message;
  const wallChannel = message.guild.channels.cache.get(WALL_CHANNEL_ID);

  if (!wallChannel) return;

  const existing = await wallChannel.messages.fetch({ limit: 100 });
  const alreadyPosted = existing.find(msg =>
    msg.embeds[0]?.footer?.text?.includes(message.id)
  );

  if (alreadyPosted) return;

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.displayAvatarURL()
    })
    .setDescription(message.content || "*No text*")
    .addFields(
      { name: "Reactions", value: `${reaction.count}`, inline: true },
      { name: "Jump", value: `[Go to message](${message.url})`, inline: true }
    )
    .setFooter({ text: `Message ID: ${message.id}` })
    .setTimestamp();

  wallChannel.send({ embeds: [embed] });
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
