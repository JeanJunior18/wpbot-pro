const Venom = require('venom-bot');
const firebase = require('../../firebase');

class VenomClient {
  constructor(token) {
    this.createClient();

    this.token = token;
    this.client = {};
    this.clientData = {
      token,
      connectionStatus: 'starting',
      qrcodeAttempt: 0,
      qrcode: null,
    };

    this.database = firebase.database();
  }

  createClient() {
    console.log('Create a Client for ', this.token);

    Venom.create(
      this.token,
      (base64Qr, asciiQR, attempt) => {
        console.log('\n Update QRCode \n');
        this.clientData.qrcode = base64Qr;
        this.clientData.qrcodeAttempt = attempt;
      },
      status => {
        console.log('\n Status Log', status, '\n');
        this.clientData.connectionStatus = status;
      },
      {
        logQR: false,
        disableSpins: true,
        disableWelcome: true,
      },
    )
      .then(client => this.start(client))
      .catch(err => {
        console.log('Error on connect', err.message);
        this.clientData = {
          ...this.clientData,
          connectionStatus: 'disconnected',
          qrcode: null,
        };
      });
  }

  async start(client) {
    this.client = client;

    const sessionInfo = await client.getSessionTokenBrowser();
    this.database.ref(`tokens/${this.token}/sessionInfo`).set(sessionInfo);

    client.onMessage(data => {
      this.sendMessageToWebHook(data);
    });
  }

  sendMessageToClient(data) {
    if (this.clientData.connectionStatus !== 'chatsAvailable')
      throw new Error('Client not started');

    const { number, type, message, url, filename, caption } = data;

    if (type === 'conversation') {
      console.log('Send Text Message');
      return this.client.sendText(number, message);
    }
    if (type === 'audioMessage') {
      console.log('Send Voice Message');
      return this.client.sendVoice(number, url);
    }
    return this.client.sendFile(number, url, filename, caption);
  }

  sendMessageToWebHook(data) {
    console.log('Send Message to Webhook');

    return data;
  }
}

module.exports = VenomClient;
