import Venom from '../venom';

class VenomController {
  stanceBot(req, res) {
    const bot = new Venom();
    return res.json({ bot });
  }

  connectClient(req, res) {
    const { token } = req.body;
    console.log(token);
    const bot = new Venom();
    bot.connectToClient(token);
    return res.json({});
  }
}

export default new VenomController();
