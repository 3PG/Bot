import { Router } from 'express';
import { SavedCommand, CommandDocument } from '../../models/command';
import { AuthClient } from '../server';
import * as config from '../../config.json';

import { router as guildsRoutes } from './guilds-routes';
import { router as userRoutes } from './user-routes';
import { SavedUser } from '../../models/user';

export const router = Router();

let commands: CommandDocument[] = [];
SavedCommand.find().then(cmds => commands = cmds);

router.get('/', (req, res) => res.json({ hello: 'earth' }));

router.get('/commands', async (req, res) => res.json(commands));

router.get('/auth', async (req, res) => {
    try {
        const key = await AuthClient.getAccess(req.query.code);
        res.json(key);
    } catch (error) { res.status(400).json(error); }
});

router.post('/stripe-webhook', async(req, res) => {
  try {
    // TODO: add better validation
    if (!req.headers['stripe-signature']) return;
    
    const id = req.body.data.object.metadata.id;
    if (req.body.type === 'checkout.session.completed') {
      await giveUserPro(id);
      return res.json({ success: true });
    }
    res.json({ received: true });
  } catch (error) { res.status(400).json(error); } 
});

async function giveUserPro(id: string) {   
  const savedUser = await SavedUser.findById(id);
  savedUser.premium = true;
  
  const oneMonthLater = new Date(new Date().setDate(new Date().getDate() + 30));
  savedUser.premiumExpiration = oneMonthLater;

  return savedUser.save();
}

router.get('/invite', (req, res) => 
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.webapp.url}/dashboard&permissions=8&scope=bot`));

router.get('/login', (req, res) =>
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.webapp.url}/auth&response_type=code&scope=identify guilds`));

router.use('/guilds', guildsRoutes);
router.use('/user', userRoutes);

router.get('*', (req, res) => res.status(404).json({ code: 404 }));
