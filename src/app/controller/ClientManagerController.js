const { default: axios } = require('axios');
const VenomClient = require('../libs/Venom');
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
  }

  initializeClients() {
    const tokenRef = this.database.ref(`/${this.serverName}/tokens`);

    tokenRef.on('child_added', snapshot => {
      console.log('CHILD ADDED');
      const token = snapshot.key;
      if (!snapshot.val()) return;
      if (this.sessions[token]) return;
      const clientInfo = snapshot.val();

      this.sessions[token] = new VenomClient(token, clientInfo);
    });
  }

  async getClientStatus(req, res, next) {
    console.log('Get Client Status', req.body);
    try {
      const token = req.params.token || req.body.token;
      const session = this.sessions[token];

      const clientStatusRef = this.database.ref(
        `${this.serverName}/tokens/${token}/status`,
      );

      if (!session.clientSession.page._closed) {
        const connectionState = await session.clientSession.getConnectionState();

        clientStatusRef.update({
          connectionState,
          isPhoneConnected: await session.clientSession.isConnected(),
        });

        let qr = null;
        if (connectionState !== 'CONNECTED') {
          qr = await session.clientSession.getQrCode();
        }

        if (qr) {
          clientStatusRef.update({ qrCodeUrl: qr.base64Image });
        } else {
          clientStatusRef.update({ qrCodeUrl: null });
        }
      } else {
        clientStatusRef.update({
          connectionState: 'browserClosed',
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
    console.log('Command', req.body);
    try {
      const { token, command } = req.body;
      const session = this.sessions[token];

      if (session.clientSession.page._closed) {
        console.log('Opening Browser');

        delete this.sessions[token].clientSession;
        this.sessions[token] = new VenomClient(
          token,
          this.sessions[token].clientInfo,
        );
      } else if (command === 'logout') {
        await session.clientSession.logout();
      } else if (command === 'start') {
        await session.clientSession.restartService();
      } else {
        return res.status(418).json({ error: 'Invalid Command' });
      }
      return res.json({ message: `Command ${command} success` });
    } catch (err) {
      return next(err);
    }
  }

  async sendMessage(req, res, next) {
    console.log('Send Message', req.body);
    try {
      const { token, number, chat_id: chatID } = req.body;

      if (!number)
        return res.status(410).json({ error: 'Phone number is not provided' });

      req.body.number = `${number}@c.us`;
      const webhookURL = `${this.sessions[token].clientInfo.webhook}?token=${token}`;

      this.sessions[token]
        .sendMessageToClient(req.body)
        .then(msgResponse => {
          axios
            .post(webhookURL, {
              cmd: 'ack',
              chat_id: chatID,
              ack: 2,
              engine: 'venom',
              message: msgResponse,
            })
            .catch(err => {
              console.log('Error on send DELIVERED ACK - ', err.message);
            });
        })
        .catch(err => {
          console.log(err.message);
          axios
            .post(webhookURL, {
              cmd: 'ack',
              chat_id: chatID,
              ack: 0,
              engine: 'venom',
            })
            .catch(e => {
              console.log('Error on send ERROR ACK - ', e.message);
            });
        });

      return res.json({ message: 'Sending Message' });
    } catch (err) {
      return next(err);
    }
  }

  async createToken(req, res, next) {
    console.log('Create token', req.body);
    try {
      const { organization, webhook, token, host } = req.body;

      const clientInfo = { organization, webhook };

      await this.database.ref(`${host}/tokens/${token}`).set(clientInfo);

      this.sessions[token] = new VenomClient(token, clientInfo);
      return res.json({
        message: `Token from ${organization} created - ${token}`,
      });
    } catch (err) {
      return next(err);
    }
  }

  async deleteToken(req, res, next) {
    console.log('Delete Token', req.body);
    try {
      const { token, host } = req.params;
      const session = this.sessions[token];

      if (session.clientSession) {
        await session.clientSession.logout();
        await session.clientSession.close();
      }

      await this.database.ref(`${host}/tokens/${token}`).remove();

      delete this.sessions[token];

      return res.json({ message: `Token ${token} deleted` });
    } catch (err) {
      return next(err);
    }
  }

  async updateToken(req, res, next) {
    console.log('Update Token', req.body);
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
    console.log('Validate Number', req.body);
    try {
      const { token, value } = req.body;

      const session = this.sessions[token];

      const records = [];

      for (const number of value) {
        const { numberExists } = await session.clientSession.checkNumberStatus(
          `${number}@c.us`,
        );
        records.push({ number, exist: numberExists || false });
      }

      return res.json({ records });
    } catch (err) {
      return next(err);
    }
  }
}

const clientManager = new ClientManager();

module.exports = { clientManager, sessions: clientManager.sessions };
