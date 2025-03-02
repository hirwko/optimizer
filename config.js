module.exports = {
  TOKEN: "",  // Your bot token here
  language: "ja",  // Set the language if needed
  ownerID: ["1106711955563098152", ""],  // Add owner ID(s)
  mongodbUri: "mongodb+srv://tatsumihirako:Revel001@discordbot.wdmjg.mongodb.net/?retryWrites=true&w=majority",  // Your MongoDB connection URI
  setupFilePath: './commands/setup.json',  // Path to setup file
  commandsDir: './commands',  // Directory where your commands are stored
  embedColor: "#1db954",  // Embed color
  activityName: "music",  // Activity name (what the bot is doing)
  activityType: "LISTENING",  // Activity type (LISTENING, PLAYING)
  SupportServer: "https://discord.gg/GSsbGwV8vt",  // Support server link
  embedTimeout: 5,  // Embed timeout (in seconds)
  errorLog: "",  // Log error path (if required)
  nodes: [
    {
      name: "XX",
      password: "fuckyall",
      host: "78.46.65.243",
      port:  5017,
      secure: false
    }
  ],
}
