const request = require('request');
const express = require('express');
const app = express();
const axios = require('axios');


// Get these values in https://quire.io/apps/dev
const clientID = '';
const clientSecret = '';
const redirectURI = 'http://uk.platinumhost.xyz:24002/callback';

// Set this from your Discord Channel
const discordWebhookUrl = '';


const authorizationUrl = 'https://quire.io/oauth';
const tokenUrl = 'https://quire.io/oauth/token';

const oid = { "project": null };
const apiURLs = {
    getProjectOID: "https://quire.io/api/project/list",
    followProject: "https://quire.io/api/project" + oid.project,
    exchangeAccessToken: tokenUrl,
}

const activityTypes = {
    0: "%s added a task",
    1: "%s removed a task",
    3: "%s edited a task",
    5: "%s completed a task",
    6: "%s reopened a task",
    7: "%s assigned a member to a task",
    8: "%s unassigned a member from a task",
    9: "%s set a due date for a task",
    10: "%s cleared the due date",
    11: "%s changed the status of a task",
    12: "%s peekabooed a task",
    13: "%s reshowed a task",
    16: "%s added a comment to a task",
    17: "%s undid the completing of a task",
    18: "%s undid the removal of a task",
    19: "%s undid the peekabooing of a task",
    20: "%s added an attachment to a task",
    21: "%s removed an attachment from a task",
    24: "%s set an external team for a task",
    25: "%s removed an external team from a task",
    27: "%s removed a comment from a task",
    28: "%s added a tag to a task",
    29: "%s removed a tag from a task",
    30: "%s transferred a task to another project",
    31: "%s duplicated a task",
    32: "%s mentioned a member in a comment or description",
    33: "%s duplicated a recurring task automatically when completed",
    34: "%s edited the time track",
    35: "%s set the priority of a task",
    36: "%s changed the task type",
    38: "%s set a start date to a task",
    39: "%s cleared the start date"
};

app.use(express.json());

app.get('/install', (req, res) => {
    const authUrl = `${authorizationUrl}?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<html lang="en"><body><a href="${authUrl}">Connect Quire</a></body></html>`);
    res.end();
});

app.get('/callback', async (req, res) => {
    try {
        const token = await exchangeAccessToken(req.query.code);
        oid.project = req.query.host.split("Project:")[1];
        await followProject(token.access_token);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<html lang="en"><body>Success: ${JSON.stringify(req.query.code)}</body></html>`);
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write(`<html lang="en"><body>Error: ${error}</body></html>`);
        res.end();
    }
});

function exchangeAccessToken(code) {
    return new Promise((resolve, reject) => {
        request.post({
            url: apiURLs.exchangeAccessToken,
            form: {
                grant_type: 'authorization_code',
                code: code,
                client_id: clientID,
                client_secret: clientSecret
            }
        }, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            resolve(JSON.parse(body));
        });
    });
}

function getProjectOID(token) {
    return new Promise((resolve, reject) => {
        request.get({
            url: apiURLs.getProjectOID,
            headers: {
                "Authorization": "Bearer " + token
            }
        }, (err, httpResponse, body) => {
            if (err) {
                return reject(err);
            }
            resolve(JSON.parse(body));
        });
    });
}

function followProject(token) {
    return new Promise((resolve, reject) => {
        request.put({
            url: apiURLs.followProject,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "addFollowers": ["app"]
            })
        }, (err, response, body) => {
            if (err) {
                return reject(err);
            }
            resolve(body);
        });
    });
}

function hexToDecimal(hex) {
    return parseInt(hex.replace("#", ""), 16)
}

app.post('/webhook', (req, res) => {
    const body = req.body;
    if (body.type === 'notification') {
        const message = {
            embeds: [
                {
                    title: activityTypes[body.data.type].replace("%s", body.data.user.name),
                    url: body.data.what.url,
                    description: body.data.text,
                    color: parseInt('3366ff', 16),
                    fields: [
                        {
                            name: "Quire ID",
                            value: `${body.data.what.id}`,
                            inline: true
                        },
                        {
                            name: "Name",
                            value: `${body.data.what.name}`,
                            inline: true
                        },
                        {
                            name: "Task Description",
                            value: `${body.data.what.description ? body.data.what.description : "No description"}`,
                            inline: true
                        },
                        {
                            name: "Status",
                            value: `Value: ${body.data.what.status.value}\nColor: ${hexToDecimal(body.data.what.status.color)}\nName: ${body.data.what.status.name}`,
                            inline: true
                        },
                        {
                            name: "Other Description",
                            value: `${body.data.what.description}`,
                            inline: true
                        },

                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Created by Leon1273",
                        icon_url: "https://cdn.discordapp.com/avatars/832218969451921408/c5639a2c0a7c071235650a9b597fe6cd.webp?size=32"
                    }
                }
            ]
        };

        axios.post(discordWebhookUrl, message)
            .then(response => {
                console.log('Successfully sent the message:', response.status);
            })
            .catch(error => {
                console.error('Error sending the message:', error);
            });
    } else {
        console.log('Received unknown event type');
        console.log('Data:', body.data);
    }
});

app.listen(24002, () => {
    console.log('Server is listening on port 24002');
});

app.listen(24008, () => {
    console.log('Server is listening on port 24008');
});

