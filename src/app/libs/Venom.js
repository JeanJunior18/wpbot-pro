const Venom = require('venom-bot');
const firebase = require('../../firebase');

class VenomClient {
  constructor(token, clientInfo) {
    this.token = token;
    this.clientSession = null;
    this.clientInfo = clientInfo;
    this.clientData = {
      token,
      connectionStatus: 'starting',
      qrcodeAttempt: 0,
      qrcode: null,
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
        this.clientData.connectionStatus = status;
      },
      {
        logQR: false,
        disableSpins: true,
        disableWelcome: true,
      },
      this.clientInfo?.sessionInfo || {},
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
    console.log('===>', this.token, 'Started');
    this.clientSession = client;

    const sessionInfo = await client.getSessionTokenBrowser();
    this.database.ref(`tokens/${this.token}/sessionInfo`).set(sessionInfo);

    client.onMessage(data => {
      this.sendMessageToWebHook(data);
    });

    client.onStateChange(state => {
      console.log('State Udpate', state);

      if (state === 'CONFLICT') {
        client.useHere();
      }
    });
  }

  sendMessageToClient(data) {
    if (this.clientData.connectionStatus !== 'chatsAvailable')
      throw new Error('Client not started');

    const { number, type, message, url, filename, caption } = data;

    if (type === 'conversation') {
      console.log('Send Text Message');
      return this.clientSession.sendText(number, message);
    }
    if (type === 'audioMessage') {
      console.log('Send Voice Message');
      return this.clientSession.sendVoice(number, url);
    }
    return this.clientSession.sendFile(number, url, filename, caption);
  }

  sendMessageToWebHook(data) {
    console.log('Send Message to Webhook');

    return data;
  }
}

module.exports = VenomClient;
