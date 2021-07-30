const VenomClient = require('../libs/Venom');
const BaileysClient = require('../libs/Baileys');
const firebase = require('../../firebase');

class ClientManager {
  constructor() {
    this.sessions = {};
    this.database = firebase.database();
    this.serverName = process.env.SERVER_NAME;
    this.initializeClients();
    console.log('Starting Server', this.serverName);

    this.getClientStatus = this.getClientStatus.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.createToken = this.createToken.bind(this);
    this.deleteToken = this.deleteToken.bind(this);
    this.updateToken = this.updateToken.bind(this);
    this.restartAndLogout = this.restartAndLogout.bind(this);
    this.validateNumber = this.validateNumber.bind(this);
    this.attendanceList = this.attendanceList.bind(this);
    this.attendanceMessages = this.attendanceMessages.bind(this);
  }

  startService(token, clientInfo) {
    switch (process.env.ENGINE.toLowerCase()) {
    case 'venom':
      return new VenomClient(token, clientInfo);
    case 'baileys':
      return new BaileysClient(token, clientInfo);
    default:
      return new BaileysClient(token, clientInfo);
    }
  }

  initializeClients() {
    const tokenRef = this.database.ref(`/${this.serverName}/tokens`);

    tokenRef.on('child_added', snapshot => {
      const token = snapshot.key;
      if (!snapshot.val()) return;
      if (this.sessions[token]) return;
      const clientInfo = snapshot.val();

      this.sessions[token] = this.startService(token, clientInfo);
    });
  }

  async getClientStatus(req, res, next) {
    try {
      const token = req.params.token || req.body.token;
      const session = this.sessions[token];

      const clientStatusRef = this.database.ref(
        `${this.serverName}/tokens/${token}/status`,
      );
      if (!session.isClosed()) {
        const connectionState = await session.getConnectionState();

        clientStatusRef.update({
          connectionState,
          isPhoneConnected: await session.isConnected(),
        });

        let qr = null;
        if (connectionState !== 'CONNECTED' && connectionState !== 'open') {
          qr = await session.getQrCode().catch(() => console.log('Não foi possível pegar QRcode'));
        }

        if (qr) {
          clientStatusRef.update({ qrCodeUrl: qr });
        } else {
          clientStatusRef.update({ qrCodeUrl: null });
        }
      } else {
        clientStatusRef.update({
          isPhoneConnected: false,
        });
      }

      const payload = await new Promise(resolve => {
        clientStatusRef.once('value', snapshot => resolve(snapshot.val()));
      });

      return res.json({
        status: {
          ...payload,
          myNumber: !!this.sessions[token],
        },
      });
    } catch (err) {
      return next(err);
    }
  }

  async restartAndLogout(req, res, next) {
    try {
      const { token, command } = req.body;
      const session = this.sessions[token];

      if (session.isClosed()) {
        console.log('Opening Browser');

        delete this.sessions[token].clientSession;
        this.sessions[token] = this.startService(
          token,
          this.sessions[token].clientInfo,
        );
      } else if (command === 'logout') {
        await session.logout();
      } else if (command === 'start') {
        await session.restart();
      } else {
        return res.status(418).json({ error: 'Invalid Command' });
      }
      return res.json({ message: `Command ${command} success` });
    } catch (err) {
      return next(err);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { token, number, chat_id: chatID } = req.body;

      if (!number)
        return res.status(410).json({ error: 'Phone number is not provided' });

      req.body.number = `${number}@c.us`;
      // const webhookURL = `${this.sessions[token].clientInfo.webhook}?token=${token}`;

      this.sessions[token]
        .sendMessageToClient(req.body)
        .catch(err => {
          console.log(err.message);
        });

      return res.json({ message: 'Sending Message' });
    } catch (err) {
      return next(err);
    }
  }

  async createToken(req, res, next) {
    try {
      const { organization, webhook, token, host } = req.body;

      const clientInfo = { organization, webhook };

      await this.database.ref(`${host}/tokens/${token}`).set(clientInfo);

      return res.json({
        message: `Token from ${organization} created - ${token}`,
      });
    } catch (err) {
      return next(err);
    }
  }

  async deleteToken(req, res, next) {
    try {
      const { token, host } = req.params;
      const session = this.sessions[token];

      if (session.clientSession) {
        await session.logout();
        await session.close();
      }

      await this.database.ref(`${host}/tokens/${token}`).remove();

      delete this.sessions[token];

      return res.json({ message: `Token ${token} deleted` });
    } catch (err) {
      return next(err);
    }
  }

  async updateToken(req, res, next) {
    try {
      const { token, host: currentHost } = req.params;
      const { organization, host, webhook, sessionInfo } = req.body;

      const data = {};

      if (organization) data.organization = organization;
      if (host) data.host = host;
      if (webhook) data.webhook = webhook;
      if (sessionInfo) data.sessionInfo = sessionInfo;

      if (currentHost === host || !host)
        await this.database.ref(`${currentHost}/tokens/${token}`).update(data);
      else {
        await this.database
          .ref(`${currentHost}/tokens/${token}`)
          .once('value', async snapshot => {
            const client = snapshot.val();

            await this.database.ref(`${currentHost}/tokens/${token}`).remove();
            await this.database.ref(`${host}/tokens/${token}`).set(client);
          });
      }

      return res.json({ message: `Token ${token} updated` });
    } catch (err) {
      return next(err);
    }
  }

  async validateNumber(req, res, next) {
    try {
      const { token, value } = req.body;

      const session = this.sessions[token];

      const records = session.validateNumber(value);

      return res.json({ records });
    } catch (err) {
      return next(err);
    }
  }

  async attendanceMessages (req, res, next) {
    try {
      const { limit } = req.query;
      const { phone } = req.params;
      const { token } = req.body;
      const session = this.sessions[token];
      session.getHistoryMessages(phone);

      return res.json({message: 'Updadating Messages'});
    } catch (err) {
      return next(err);
    }
  }

  async attendanceList (req, res, next) {
    try {
      const { token } = req.body;

      const session = this.sessions[token];

      const chats = await session.getChats();

      return res.json(chats);
    } catch (err) {
      return next(err);
    }
  }
}

const clientManager = new ClientManager();

module.exports = { clientManager, sessions: clientManager.sessions };
