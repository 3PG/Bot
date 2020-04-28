# 3PG - Simple, powerful Discord bot
**Dashboard**: https://github.com/theADAMJR/3PG-Dashboard

Simple multi-purpose Discord bot made with TypeScript

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8d6c9610e0eb4ae5a4045ab3b92f80bc)](https://www.codacy.com/manual/ADAMJR/3PG?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=theADAMJR/3PG&amp;utm_campaign=Badge_Grade)

## Installation
1) Fork/download this respository
2) `npm i` to install packages

### Config
`config.json` example:
```
{
    "bot": { // https://discordapp.com/developers/applications
        "token": "yourBotToken",
        "secret": "oauthSecret",
        "id": "discordBotId"
    },
    "api": {
        "url": "https://3PG.xyz/api",
        "managerPermission": "MANAGE_GUILD",
        "stripe": { // https://dashboard.stripe.com/test/apikeys
            "apiKey": "stripeAPIKey"
        }
    },
    "webapp": {
        "url": "https://3PG.xyz",
        "distPath": "/dist/dashboard"
    },
    "lavalink": {
        "password": "youshallnotpass"
    },
    "tests": { // optional -> used for tests
        "guild": {
            "id": "yourTestGuildId"
        }
    },
    "mongoURL": "mongodb://localhost/3PG",
    "modules": ["announce", "autoMod", "commands", "general", "music", "xp", "settings"]
}
```
- Remove Comments


## Hosting
1) `npm start` to start the bot, and Lavalink

### Database
- Remember to have a local MongoDB database running `mongod`

### Music
- Have Lavalink.jar running - `java -jar Lavalink.jar` (done with npm start)

[Lavalink Setup](https://github.com/Frederikam/Lavalink#server-configuration)

## Troubleshooting
- Open an issue, if you find any bugs or have any suggestions etc.

### Common Errors
`UnhandledPromiseRejectionWarning: MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Possible Cause**: No MongoDB server instance running, start with `mongod`
