import { Router } from 'express';
import { SavedCommand, CommandDocument } from '../../data/models/command';
import { AuthClient } from '../server';
import * as config from '../../config.json';
import { SavedUser, BadgeType } from '../../data/models/user';

import { router as guildsRoutes } from './guilds-routes';
import { router as userRoutes } from './user-routes';
import { router as musicRoutes } from './music-routes';
import Deps from '../../utils/deps';
import Users from '../../data/users';
import { bot } from '../../bot';
import { MessageEmbed } from 'discord.js';

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
      } catch (error) { sendError(res, 400, error); }
});

router.post('/auth-vote', async(req, res) => {
  try {
    const secrets = [ req.get('X-DBL-Signature'), req.get('Authorization') ]; // dbl, top.gg
    const containsSecret = secrets
      .some(s => 
        s?.includes(config.bot.botLists.dbl.webhookSecret) ||
        s?.includes(config.bot.botLists.topGG.webhookSecret));
    if (!containsSecret)
      throw new TypeError('No secret found');
    
    const id = req.body.id || req.body.user;
    const user = bot.users.cache.get(id)
    const savedUser = await users.get(user);
        
    savedUser.votes++;
    savedUser.crates += 3;
  
    await savedUser.save();
    
    res.status(200).json({ success: true });
  } catch (error) { sendError(res, 400, error); }
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
  } catch (error) { sendError(res, 400, error); }
});

router.post('/error', async(req, res) => {
  try {
    const { message } = req.body;

    const key = req.query.key;
    let user = { id: 'N/A' };
    if (key)
      user = AuthClient.getUser(key);
    
    await bot.users.cache
      .get(config.bot.ownerId)
      .send(new MessageEmbed({
        title: 'Dashboard Error',
        description: `**Message**: ${message}`,
        footer: { text: `User ID: ${user.id}` }
      }));
    } catch (error) { sendError(res, 400, error); }
});

async function giveUserPro(id: string) {  
  const user = bot.users.cache.get(id);
  const savedUser = await users.get(user);

  savedUser.premium = true;
  savedUser.premiumExpiration = new Date(new Date().setDate(new Date().getDate() + 30));

  bot.guilds.cache
    .get('598565371162656788')?.members.cache
    .get(id)?.roles
    .add('599596068145201152');

  await savedUser.save();
}

router.get('/invite', (req, res) => 
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.webapp.url}/dashboard&permissions=8&scope=bot`));

router.get('/login', (req, res) =>
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.webapp.url}/auth&response_type=code&scope=identify guilds`));

router.use('/guilds', guildsRoutes);
router.use('/guilds/:id/music', musicRoutes);
router.use('/user', userRoutes);

router.get('*', (req, res) => res.status(404).json({ code: 404 }));

export function sendError(res: any, code: number, error: Error) {
  return res.status(code).json({ code, message: error?.message })
}
