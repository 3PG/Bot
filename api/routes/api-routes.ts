import { Router } from 'express';
import { SavedCommand, CommandDocument } from '../../models/command';
import { AuthClient } from '../server';
import * as config from '../../config.json';
import { SavedUser, BadgeType } from '../../models/user';

import { router as guildsRoutes } from './guilds-routes';
import { router as userRoutes } from './user-routes';
import { router as musicRoutes } from './music-routes';
import Deps from '../../utils/deps';
import Users from '../../data/users';
import { bot } from '../../bot';

export const router = Router();

const users = Deps.get<Users>(Users);

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

router.post('/auth-vote', async(req, res) => {
  try {
    const secrets = [ req.get('X-DBL-Signature'), req.get('Authorization') ]; // dbl, top.gg
    const containsSecret = secrets.some(s => s && s.includes(config.bot.botLists.dbl.webhookSecret));
    if (!containsSecret)
      throw new TypeError('No secret found');
    
    const id = req.body.id || req.body.user; // dbl || top.gg
    const user = bot.users.cache.get(id)
    const savedUser = await users.get(user);

    console.log('wee woo');
    
        
    savedUser.votes++;
  
    // TODO: remove after June 1st
    const noBadgeYet = savedUser.badges.some(b => b.type === BadgeType.EarlySupporter);
    if (noBadgeYet)
      savedUser.badges.push({
        at: new Date(),
        type: BadgeType.EarlySupporter
      });
  
    await savedUser.save();
    
    res.status(200).json({ success: true });
  } catch (error) { res.status(400).json(error?.message); } 
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
  } catch (error) { res.status(400).json(error?.message); } 
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
router.use('/guilds/:id/music', musicRoutes);
router.use('/user', userRoutes);

router.get('*', (req, res) => res.status(404).json({ code: 404 }));
