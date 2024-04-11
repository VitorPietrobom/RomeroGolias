# Discord Bot Romero Golias

## Description
This Discord bot provides various functionalities related to gaming, anime, and other activities. It can update and compare Steam game libraries, manage anime watching progress, and perform other utility tasks.

## Features
- **Update Games**: Users can update their list of owned games on Steam.
- **Compare Games**: Users can compare their game libraries with others to find common games.
- **Anime Progress**: Users can update their progress in watching anime episodes.
- **Anime Registration**: Users can register new anime titles for tracking.

## Setup
1. Clone this repository.
2. Install dependencies using `npm install`.
3. Create a `keys.js` file in the root directory with the following structure:
    ```javascript
    module.exports = {
        DiscordAPIKey: 'YOUR_DISCORD_API_KEY',
        SteamAPIKey: 'YOUR_STEAM_API_KEY'
    };
    ```
    Replace `YOUR_DISCORD_API_KEY` with your Discord bot API key and `YOUR_STEAM_API_KEY` with your Steam API key.
4. Update the `firebase.js` file with your Firebase configuration if you're using Firebase for data storage.
5. Run the bot using `node bot.js`.

## Usage
- Use `*help` command to see available commands and their descriptions.
- Commands:
  - `*cadastrar {Discord Mention} {Steam ID}`: Register a new user with their Discord mention and Steam ID.
  - `*update-jogos {Discord Mention}`: Update the game library of a user.
  - `*comparar {User Mention 1} {User Mention 2} ... {User Mention n}`: Compare game libraries of multiple users.
  - `*anime`: View anime information.
  - `*update-anime {Anime Name} episodio {Episode Number} {Link}`: Update anime watching progress.
  - `*cadastrar-anime {Anime Name} {Starting Episode}`: Register a new anime title for tracking.

## Dependencies
- discord.js
- steamapi
- firebase
