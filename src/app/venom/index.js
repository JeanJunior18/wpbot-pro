import { create } from 'venom-bot';

class Bot {
  // constructor() {
  //   create(
  //     'Jean',
  //     // Catch QrCode
  //     (base64Qr, asciiQr, attemps, urlCode) => {
  //       console.log('QrCode', asciiQr);
  //       console.log('Attemps', attemps);
  //       console.log('urlCode', urlCode);
  //     },
  //     // Status Find
  //     (statusSession, session) => {
  //       console.log('statusSession', statusSession);
  //       console.log('session', session);
  //     },
  //   ).then(async client => {
  //     const token = await client.getSessionTokenBrowser();

  //     console.log('Token', token);
  //     this.start(client);
  //     this.client = client;
  //   });
  // }

  async connectToClient(clientToken) {
    if (clientToken) {
      const token = await new Promise((res, rej) => {
        create(clientToken, base64 => {
          if (base64) {
            console.log('BASE');
            return res(base64);
          }
          console.log('Sem token');
          return rej();

          // token = { base64 };
        });
      });
      return token;
    }
    return null;
  }

  start(client) {
    client.onMessage(message => {
      console.log('New message: ', message);
    });
  }
}

export default Bot;
