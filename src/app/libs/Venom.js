const https = require('https');
const fs = require('fs');
const Venom = require('venom-bot');
const { default: axios } = require('axios');
const firebase = require('../../firebase');

class VenomClient {
  constructor(token, clientInfo) {
    this.token = token;
    this.clientSession = null;
    this.clientInfo = clientInfo;
    this.clientData = {
      token,
      sessionStatus: 'starting',
      qrcodeAttempt: 0,
      qrcode: null,
      browserStarted: false,
    };

    this.database = firebase.database();

    this.createClient(token);
  }

  createClient(token) {
    console.log('Create a Client for ', token);

    Venom.create(
      token,
      (base64Qr, asciiQR, attempt) => {
        console.log('\n Update QRCode \n');
        this.clientData.qrcode = base64Qr;
        this.clientData.qrcodeAttempt = attempt;
      },
      status => {
        console.log('\n Status Log', status, '\n');
        this.clientData.sessionStatus = status;
      },
      {
        logQR: false,
        disableSpins: true,
        disableWelcome: true,
        waitForLogin: false,
        useChrome: false,
        browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      this.clientInfo?.sessionInfo || {},
    )
      .then(client => this.start(client))
      .catch(err => {
        console.log('Error on connect', err);
        this.clientData = {
          ...this.clientData,
          sessionStatus: 'disconnected',
          qrcode: null,
        };
      });
  }

  async start(client) {
    console.log('===>', this.token, 'Started');
    this.clientSession = client;
    this.clientData.browserStarted = true;
    const sessionInfo = await client.getSessionTokenBrowser();
    this.clientData.connectionState = await client.getConnectionState();

    this.database.ref(`tokens/${this.token}/sessionInfo`).set(sessionInfo);

    client.onMessage(data => {
      this.sendMessageToWebHook(data);
    });

    client.onStateChange(async state => {
      console.log('State Udpate', state);

      if (state === 'CONFLICT') {
        client.useHere();
      }

      if (state === 'CONNECTED') {
        const updateSessionInfo = await client.getSessionTokenBrowser();
        this.database
          .ref(`tokens/${this.token}/sessionInfo`)
          .set(updateSessionInfo);
      }

      if (state === 'UNPAIRED') {
        this.database.ref(`tokens/${this.token}/sessionInfo`).remove();
      }
    });
  }

  async sendMessageToClient(data) {
    if (!this.clientData.browserStarted) throw new Error('Client not started');

    const { number, type, message, url, filename, caption } = data;

    if (type === 'conversation') {
      console.log('Send Text Message');
      return this.clientSession.sendText(number, message);
    }
    if (type === 'audioMessage') {
      const base64Audio = await axios
        .get(url, { responseType: 'arraybuffer' })
        .then(
          response =>
            `data:audio/mpeg;base64,${Buffer.from(
              response.data,
              'binary',
            ).toString('base64')}`,
        );

      return this.clientSession.sendVoiceBase64(number, base64Audio);
    }
    return this.clientSession.sendFile(number, url, filename, caption);
  }

  sendMessageToWebHook(data) {
    if (data.isGroupMsg) {
      console.log('Ignore group message');
      return data;
    }
    console.log('Send Message to Webhook');

    return data;
  }
}

module.exports = VenomClient;
