import Venom from '../venom';

class VenomController {
  stanceBot(req, res) {
    // eslint-disable-next-line no-new
    new Venom();
    return res.json();
  }

  async connectClient(req, res) {
    const { token } = req.body;
    const bot = new Venom();
    const status = await bot.connectToClient(token);
    return res.json(status);
  }
}

export default new VenomController();
