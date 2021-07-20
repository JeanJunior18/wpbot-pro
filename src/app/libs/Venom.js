const Venom = require('venom-bot');
const { default: axios } = require('axios');
const firebase = require('../../firebase');

class VenomClient {
  constructor(token, clientInfo) {
    this.serverName = process.env.SERVER_NAME;
    this.database = firebase.database();
    this.webhookURL = `${clientInfo.webhook}?token=${token}`;

    this.clientStatusRef = this.database.ref(
      `${this.serverName}/tokens/${token}/status`,
    );
    this.clientStatusRef.set({
      token,
      sessionStatus: 'starting',
      qrCodeUrl: null,
      browserStarted: false,
      isPhoneConnected: false,
    });

    this.token = token;
    this.clientSession = null;
    this.clientInfo = clientInfo;
    this.browserStarted = false;

    this.createClient(token);
    this.initFirebaseListener();
  }

  initFirebaseListener() {
    this.database
      .ref(`${this.serverName}/tokens/${this.token}`)
      .on('child_changed', snapshot => {
        const allowedUpdateKeys = ['organization', 'webhook'];

        if (allowedUpdateKeys.includes(snapshot.key)) {
          this.clientInfo[snapshot.key] = snapshot.val();
          this.webhookURL = `${this.clientInfo.webhook}?token=${this.token}`;
        }
      });
  }

  createClient(token) {
    Venom.create(
      token,
      null,
      status => {
        console.log('\n Status Log', status, '\n');
        this.clientStatusRef.update({ sessionStatus: status });
      },
      {
        logQR: false,
        disableSpins: true,
        disableWelcome: true,
        waitForLogin: false,
        useChrome: true,
        browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      this.clientInfo?.sessionInfo || {},
    )
      .then(client => this.start(client))
      .catch(err => {
        console.log('Error on connect', err);
        this.clientStatusRef.update({
          sessionStatus: 'disconnected',
          qrCodeUrl: null,
        });
      });
  }

  async start(client) {
    console.log('===>', this.token, 'Started');
    this.browserStarted = true;
    this.clientSession = client;

    this.clientStatusRef.update({
      browserStarted: true,
      isPhoneConnected: true,
      connectionState: await client.getConnectionState(),
    });

    client.onMessage(data => {
      this.sendMessageToWebHook(data);
    });

    client.onAck(ackData => {
      if (ackData.ack === 3) {
        axios
          .post(this.webhookURL, {
            ...ackData,
            cmd: 'ack',
            engine: 'venom',
          })
          .catch(err =>
            console.log('Error on send ACK UPDATE - ', err.message),
          );
      }
    });

    client.onStateChange(async state => {
      console.log(this.token, 'State Udpate', state);
      this.clientStatusRef.update({ connectionState: state });

      if (state === 'CONFLICT') {
        client.useHere();
      } else if (state === 'CONNECTED') {
        this.clientStatusRef.update({ isPhoneConnected: true });
        const updateSessionInfo = await client.getSessionTokenBrowser();
        this.database
          .ref(`${this.serverName}/tokens/${this.token}/sessionInfo`)
          .set(updateSessionInfo);
      } else if (state === 'UNPAIRED') {
        this.clientStatusRef.update({ isPhoneConnected: false });
        this.database
          .ref(`${this.serverName}/tokens/${this.token}/sessionInfo`)
          .remove();
      } else {
        this.clientStatusRef.update({ isPhoneConnected: false });
      }
    });
  }

  async getConnectionState() {
    await this.clientSession.getConnectionState();
  }

  async getQrCode() {
    await this.clientSession.getQrCode();
  }

  async validateNumber(value) {
    const records = [];

    for (const number of value) {
      const { numberExists } = await this.clientSession.checkNumberStatus(
        `${number}@c.us`,
      );
      records.push({ number, exist: numberExists || false });
    }
  }

  async sendMessageToClient(data) {
    if (!this.browserStarted) throw new Error('Client not started');

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
    if (!data.isGroupMsg) {
      console.log('Send Message to Webhook', this.webhookURL);

      axios
        .post(this.webhookURL, {
          ...data,
          engine: 'venom',
        })
        .then(res => {
          console.log(res.data);
        })
        .catch(err => {
          console.log(err.message);
        });
    }
  }

  async logout() {
    await this.clientSession.logout();
  }

  async restart() {
    await this.clientSession.restartService();
  }

  async close() {
    await this.clientSession.close();
  }

  isClosed() {
    return this.clientSession.page._closed;
  }
}

module.exports = VenomClient;
