import Venom from '../venom';

class VenomController {
  stanceBot(req, res) {
    const bot = new Venom();
    return res.json({ bot });
  }

  async connectClient(req, res) {
    const { token } = req.body;
    const bot = new Venom();
    const qrcode = await bot.connectToClient(token);
    return res.json({ qrcode });
  }
}

export default new VenomController();
