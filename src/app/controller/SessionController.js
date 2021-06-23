const { sessions } = require('./ClientManagerController');

module.exports = {
  async sessions(req, res, next) {
    try {
      const data = Object.keys(sessions).map(token => {
        const { clientInfo, clientData, webhookURL } = sessions[token];

        const sessionInfo = {
          token,
          clientInfo: {
            host: clientInfo.host,
            organization: clientInfo.organization,
          },
          clientData,
          webhookURL,
        };
        console.log(sessionInfo);
        return sessionInfo;
      });
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  },
};
