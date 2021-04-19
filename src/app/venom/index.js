const { create } = require('venom-bot');

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
            if ((statusSession, session)) {
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
      const {
        id: messageId,
        chatId,
        sender,
        isGroupMsg: isGroup,
        content,
        timestamp,
        from: fromId,
        quotedMsgObj,
      } = data;

      const {
        id,
        pushname: profileName,
        name,
        profilePicThumbObj,
        isMyContact,
        isMe,
        isWAContact,
        isEnterprise,
        isBusiness,
      } = sender;

      const message = {
        id,
        profileName,
        name,
        avatarUrl: profilePicThumbObj.eurl,
        messageId,
        chatId,
        isMyContact,
        isGroup,
        isMe,
        isWAContact,
        isEnterprise,
        isBusiness,
        message: {
          content,
          timestamp,
          fromId,
          quotedMsgObj,
        },
      };

      console.log('New message: ', message);
    });
  }
}

module.exports = Bot;
