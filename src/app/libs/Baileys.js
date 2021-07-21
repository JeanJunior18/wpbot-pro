const { WAConnection } = require('@adiwajshing/baileys');
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
    const conn = new WAConnection();

    conn.on('chats-received', async ({ hasNewChats }) => {
      console.log(
        `you have ${conn.chats.length} chats, new chats available: ${hasNewChats}`,
      );

      const unread = await conn.loadAllUnreadMessages();
      console.log(`you have ${unread.length} unread messages`);
    });

    conn.on('contacts-received', () => {
      console.log(`you have ${Object.keys(conn.contacts).length} contacts`);
    });

    conn.on('open', () => {
      console.log(conn.base64EncodedAuthInfo());
    });

    await conn.connect().catch(console.error);

    conn.on('chat-update', chatUpdate => {
      if (chatUpdate.messages && chatUpdate.count) {
        const message = chatUpdate.messages.all()[0];
        console.log('New message');
        console.log(message);
      } else console.log(chatUpdate);
    });
  }

  getConnectionState() {}

  getQrCode() {}

  validateNumber() {}

  sendMessageToClient() {}

  sendMessageToWebHook() {}

  logout() {}

  restart() {}

  close() {}

  isClosed() {}
}

module.exports = BaileysClient;
