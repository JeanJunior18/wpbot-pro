const { WAConnection } = require('@adiwajshing/baileys');
const { default: axios } = require('axios');
const QRCode = require('qrcode');
const firebase = require('../../firebase');

class BaileysClient {
  constructor(token, clientInfo) {
    this.serverName = process.env.SERVER_NAME;
    this.database = firebase.database();
    this.webhookURL = `${clientInfo.webhook}?token=${token}`;
    this.capturedChats = false;

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

    this.conn.on('chats-received', async () => {
      
      console.log('=========> Chat Received');
      this.saveAllChats();
    });

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
    this.conn.version = [2, 2123, 7];

    this.conn.on('chat-update', chatUpdate => {
      // if(!this.capturedChats) { 
      //   this.saveAllChats();
      //   this.capturedChats= true;
      // }
      if (chatUpdate.messages) {
        const message = chatUpdate.messages.all()[0];

        if (message.key.remoteJid === 'status@broadcast') {
          return false;
        }
        if (message.key.remoteJid.includes('@g.us')) {
          return false;
        }

        this.saveNewMessage(message, message.key.remoteJid);
      }
      return true;
    });
  }

  getConnectionState() {
    console.log(this.conn.state);
    return this.conn.state;
  }

  async getHistoryMessages(phoneNumber, limit = 2, onlyUnread) {
    const messages = onlyUnread
      ? await this.conn.loadAllUnreadMessages(`${phoneNumber}@s.whatsapp.net`)
      : await this.conn.loadMessages(
        `${phoneNumber}@s.whatsapp.net`,
        limit,
        null,
        true,
      );

    return messages;
  }

  async saveAllChats() {
    const chats = this.conn.chats.array;

    for(const i in chats) {
      const chat = JSON.parse(JSON.stringify(chats[i]));
      if(!chat.jid.includes('@g.us')){
        chat.avatar = await this.conn.getProfilePicture(chat.jid).catch(() => {}) || '';
        const phone = chat.jid.replace(/[^0-9]+/g, '');
        
        const messages = JSON.parse(JSON.stringify(chat.messages));
        chat.messages = {};

        for(const msg of messages) {
          const {id} = msg.key;
          chat.messages[id] = msg;
        }

        this.database
          .ref(`${this.serverName}/tokens/${this.token}/chats/${phone}`)
          .set(chat);

        
      }
    }

  }

  async getMessages (jid, limit) {
    const {messages: data} = await this.conn.loadMessages(jid, limit).catch(() => {});

    const phone = jid.replace(/[^0-9]+/g, '');
    for (const message of data){
      this.database
        .ref(`${this.serverName}/tokens/${this.token}/chats/${phone}/messages/${message.key.id}`)
        .set(JSON.parse(JSON.stringify(message)));
    }
  }

  async getChats() {
    const chats = await new Promise((res) => {this.database
      .ref(`${this.serverName}/tokens/${this.token}/chats`)
      .once('value', snapshot => res(snapshot.val()));});

    return chats;
  }

  async getQrCode() {
    const qrcode = await QRCode.toDataURL(
      (await this.conn.requestNewQRCodeRef()).ref,
    );
    return qrcode;
  }

  validateNumber() {}

  async sendMessageToClient(data) {
    const {
      token,
      number,
      url,
      type,
      mimetype,
      caption,
      filename,
      message,
      chat_id: chatId,
    } = data;

    let sentMessage = {};

    if (type === 'conversation') {
      sentMessage = await this.conn.sendMessage(number, message, type);
    } else {
      sentMessage = await this.conn.sendMessage(number, { url }, type, {
        mimetype,
        caption,
        filename,
        ptt: true,
      });
    }

    await axios
      .post(
        this.webhookURL,
        {
          sentMessage,
          chatId,
          status: 2,
        },
        { params: { token } },
      )
      .catch(err => console.log(err.response?.data || err.message));
  }

  saveNewMessage(message, jid) {
    console.log(jid,message);
    const phone = jid.replace(/[^0-9]+/g, '');
    this.database
      .ref(`${this.serverName}/tokens/${this.token}/chats/${phone}/messages/${message.key.id}`)
      .set(JSON.parse(JSON.stringify(message)));
  }

  sendMessageToWebHook(data) {
    console.log('Send Message to Webhook', this.webhookURL);
    // console.log(data);

    axios
      .post(this.webhookURL, {
        ...data,
        engine: 'baileys',
      })
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err.message);
      });
  }

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
