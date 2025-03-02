module.exports = {
  name: 'loop',
  description: 'Toggles looping for the current song.',
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message); // Using DisTube to manage the queue
    if (!queue) {
      return message.reply("There is no song currently playing.");
    }

    // Checking if the argument is `on` or `off`
    if (args[0] === 'on') {
      if (queue.looping) {
        return message.reply("The song is already looping.");
      }
      queue.looping = true;
      message.channel.send("The current song will now loop indefinitely.");
    } else if (args[0] === 'off') {
      if (!queue.looping) {
        return message.reply("The song is not looping.");
      }
      queue.looping = false;
      message.channel.send("The loop has been disabled. The next song will play.");
    } else {
      message.reply("Please specify either `-loop on` or `-loop off`.");
    }
  },
};
