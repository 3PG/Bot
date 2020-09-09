# 3PG
The all-in-one, highly customizable Discord bot.

![Dashboard Preview](https://3pg.xyz/assets/docs/img/dashboard-v2.2.0b.png)

# Setup
Please follow the [2PG Setup](https://github.com/theADAMJR/2PG) to use the bot.

`config.json`
```json
{
    "bot": {
        "token": "",
        "secret": "",
        "id": "533947001578979328",
        "ownerId": "218459216145285121",
        "activity": "3PG.xyz",
        "voteURLs": [
            "https://dbots.co/bots/525935335918665760/vote",
            "https://top.gg/bot/525935335918665760/vote",
            "https://discordbotlist.com/bots/525935335918665760/upvote"
        ],
        "botLists": {
            "dbl": {
                "token": "",
                "webhookSecret": ""
            },
            "topGG": {
                "token": "",
                "webhookSecret": ""
            }
        }
    },
    "guild": {
        "id": "599596068145201152",
        "premiumRoleId": "598565371162656788"
    },
    "api": {
        "port": "3000",
        "url": "http://localhost:3000/api",
        "stripeSecretKey": "",
        "stripeWebhookSecret": ""
    },
    "dashboardURL": "http://localhost:4200",
    "mongoURL": "mongodb://localhost/3PG"
}```