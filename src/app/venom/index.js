const { create } = require('venom-bot');
const messageView = require('../views/message');

class Bot {
  constructor() {
    this.client = null;
  }

  async connectToClient(clientToken) {
    if (clientToken) {
      const token = await new Promise((res, rej) => {
        create(
          clientToken,
          base64 => {
            if (base64) {
              return res({ qrcode: base64 });
            }
            return rej();
          },
          (statusSession, session) => {
            if (statusSession && session && statusSession !== 'notLogged') {
              return res({ token: session, state: statusSession });
            }
            return null;
          },
        ).then(client => this.start(client, clientToken));
      });
      return token;
    }
    return null;
  }

  async start(client) {
    this.client = client;

    client.onMessage(data => {
      messageView.render(data);
      console.log('=============================================');
    });
  }
}

module.exports = Bot;
