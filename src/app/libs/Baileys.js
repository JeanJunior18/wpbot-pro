const { WAConnection } = require('@adiwajshing/baileys');
const QRCode = require('qrcode');
const firebase = require('../../firebase');

class BaileysClient {
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

    this.start(token);
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

  async start(token) {
    console.log(token);
    this.conn = new WAConnection();

    if (this.clientInfo.sessionInfo)
      this.conn.loadAuthInfo(this.clientInfo.sessionInfo);

    this.conn.removeAllListeners('qr');

    this.conn.on('open', () => {
      const updateSessionInfo = this.conn.base64EncodedAuthInfo();
      this.database
        .ref(`${this.serverName}/tokens/${this.token}/sessionInfo`)
        .set(updateSessionInfo);
    });

    this.conn.browserDescription[0] = `Blubots ${this.serverName}`;

    this.conn.on('qr', async qr => {
      this.clientStatusRef.update({ qrCodeUrl: await QRCode.toDataURL(qr) });
    });

    await this.conn.connect().catch(console.error);

    this.conn.on('chat-update', chatUpdate => {
      if (chatUpdate.messages && chatUpdate.count) {
        const message = chatUpdate.messages.all()[0];
        console.log('New message');
        console.log(message);
      } else console.log(chatUpdate);
    });
  }

  getConnectionState() {
    console.log(this.conn.state);
    return this.conn.state;
  }

  async getQrCode() {
    const qrcode = await QRCode.toDataURL(
      (await this.conn.requestNewQRCodeRef()).ref,
    );
    return qrcode;
  }

  validateNumber() {}

  sendMessageToClient() {}

  sendMessageToWebHook() {}

  logout() {}

  restart() {}

  close() {}

  isConnected() {
    return this.conn.phoneConnected;
  }

  isClosed() {
    return false;
  }
}

module.exports = BaileysClient;
