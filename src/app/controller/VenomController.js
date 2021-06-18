const Venom = require('venom-bot');

class VenomController {
  constructor(token) {
    console.log('Instance Venom Class', token);

    this.token = token;
    this.client = {};
    this.clientData = {
      token,
      connectionStatus: 'starting',
      qrcodeAttempt: 0,
      qrcode: null,
    };
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
      { logQR: false },
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

  start(client) {
    this.client = client;

    client.onMessage(() => {
      console.log('Send Message to Server');
    });
  }

  sendMessageToClient() {
    console.log('Send Message to Client');
  }

  sendMessageToWebHook() {
    console.log('Send Message to Webhook');
  }
}

module.exports = VenomController;
