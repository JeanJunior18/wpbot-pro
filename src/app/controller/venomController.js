import Venom from '../venom';

class VenomController {
  stanceBot(req, res) {
    const bot = new Venom();
    return res.json({ bot });
  }
}

export default new VenomController();
