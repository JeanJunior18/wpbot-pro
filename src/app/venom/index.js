import { create } from 'venom-bot';

class Bot {
  constructor() {
    create(
      'Jean',
      // Catch QrCode
      (base64Qr, asciiQr, attemps, urlCode) => {
        console.log('QrCode', asciiQr);
        console.log('Attemps', attemps);
        console.log('urlCode', urlCode);
      },
      // Status Find
      (statusSession, session) => {
        console.log('statusSession', statusSession);
        console.log('session', session);
      },
    ).then(async client => {
      const token = await client.getSessionTokenBrowser();

      console.log('Token', token);
      this.start(client);
      this.client = client;
    });
  }

  connectToClient(clientToken) {
    if (clientToken) create(clientToken).then(client => this.start(client));
    else this.errorConnect();
  }

  errorConnect() {
    return 'error';
  }

  start(client) {
    client.onMessage(message => {
      console.log('New message: ', message);
    });
  }
}

export default Bot;
