# Quire-Discord-Notifications

## Description
A simple Quire App to send notifications to a Discord Channel

## Installation
To get started, open the `index.js` file and then edit these values to suit your configuration `clientID`, `clientSecret` and `discordWebhookUrl`.

- You can find the arguments for the `clientID` and `clientSecret` at https://quire.io/apps/dev after creating a application.
- For the `discordWebhookUrl`, you can either right click a channel, press **Edit Channel**, then go to **Integrations**, then **Wehooks** and create a new webhook.

To allow the app to view your repo, simply visit http://localhost:24002/install and then click on "**Connect Quire**" and follow the steps provided. It should say "**Success: ${X}**". If not, then create an issue and I'll try and help as best as I can. Since there are a lot of different configurations, I may not be able to help.

Then you can run the `index.js` file with `node index.js`, it should create two open ports where **Port 24002** is used as the callback and **Port 24008** is the Webhook listener to receive different events.

## Contributing
If for some reason you want to clean up the code or make it more user friendly, you can do so in a pull request. This repo will probably not be updated unless the API changes.
