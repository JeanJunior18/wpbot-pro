const Venom = require('../venom');

class VenomController {
  constructor() {
    this.sessions = {};
    this.newClient = this.newClient.bind(this);
    this.checkSessions = this.checkSessions.bind(this);
    this.sendTextMessage = this.sendTextMessage.bind(this);
  }

  async newClient(req, res) {
    const { token } = req.body;

    if (this.sessions[token]) {
      return res.json('Has Session');
    }

    const bot = new Venom();

    const qrcode = await bot.connectToClient(token);

    const interval = setInterval(() => {
      console.log(' Try get Client ');
      if (bot.client) {
        console.log(' Client Catch ');
        this.sessions[token] = bot.client;
        clearInterval(interval);
      }
    }, 1000);
    return res.json(qrcode);
  }

  async sendTextMessage(req, res) {
    const { token, phone, text } = req.body;
    const client = this.sessions[token];
    if (!client) {
      return res.status(400).json('Não há sessão ativa neste token');
    }
    await client.sendText(`${phone}@c.us`, text);
    return res.json('Mensagem Enviada');
  }

  async checkSessions(req, res) {
    console.log(this.sessions);
    return res.json(Object.keys(this.sessions));
  }
}

module.exports = new VenomController();
