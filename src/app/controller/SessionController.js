const { sessions } = require('./ClientManagerController');
const firebase = require('../../firebase');

const database = firebase.database();

module.exports = {
  async sessions(req, res, next) {
    try {
      const sessionsList = await new Promise(resolve => {
        database.ref().once('value', snapshot => {
          const hostList = snapshot.val();

          const data = {};
          for (const host in hostList) {
            const { tokens } = hostList[host];
            const tokenData = {};
            for (const token in tokens) {
              tokenData[token] = {
                organization: tokens[token].organization,
                status: tokens[token].status,
                webhook: tokens[token].webhook,
              };
            }
            data[host] = tokenData;
          }

          resolve(data);
        });
      });

      return res.json(sessionsList);
    } catch (err) {
      return next(err);
    }
  },

  async closeSession(req, res, next) {
    try {
      const { token } = req.body;

      const session = sessions[token];

      await session.clientSession.close();

      firebase
        .database()
        .ref(`${process.env.SERVER_NAME}/tokens/${token}/status`)
        .update({
          browserStarted: false,
          connectionState: 'CLOSED',
          isPhoneConnected: false,
          sessionStatus: 'browserClosed',
        });

      return res.json({ message: `${token} browser closed` });
    } catch (err) {
      return next();
    }
  },
};
