import { MessageEmbed, Client } from 'discord.js';
import { Router } from 'express';
import config from '../../../config.json';
import { CommandDocument, SavedCommand } from '../../data/models/command';
import Deps from '../../utils/deps';
import { validateBotOwner, sendError } from '../modules/api-utils';
import Stats from '../modules/stats';
import { AuthClient } from '../server';
import Users from '../../data/users';

export const router = Router();

const bot = Deps.get<Client>(Client),
      stats = Deps.get<Stats>(Stats),
      users = Deps.get<Users>(Users);

let commands: CommandDocument[] = [];
SavedCommand.find().then(cmds => commands = cmds);

router.get('/', (req, res) => res.json({ hello: 'earth' }));

router.get('/commands', async (req, res) => res.json(commands));

router.get('/auth', async (req, res) => {
  try {    
    const key = await AuthClient.getAccess(req.query.code);
    res.redirect(`${config.dashboardURL}/auth?key=${key}`);
  } catch (error) { sendError(res, 400, error); }
});

router.get('/auth', (req, res) => res
  .redirect(`https://discord.com/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.dashboardURL}/dashboard&response_type=code&permissions=8&scope=bot`));

router.post('/error', async(req, res) => {
  try {
    const key = req.query.key;
    let { id } = await AuthClient.getUser(key);
    
    await bot.users.cache
      .get(config.bot.ownerId)
      ?.send(new MessageEmbed({
        title: 'Dashboard Error',
        description: `**Message**: ${req.body.message}`,
        footer: { text: `User ID: ${id ?? 'N/A'}` }
    }));
  } catch (error) { sendError(res, 400, error); }
});

router.get('/stats', async (req, res) => {
  try {
    await validateBotOwner(req.query.key);
  
    res.json({
      general: stats.general,
      commands: stats.commands,
      inputs: stats.inputs,
      modules: stats.modules
    });
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
  
    await savedUser.save();
    
    res.status(200).json({ success: true });
  } catch (error) { sendError(res, 400, error); }
});

router.get('/invite', (req, res) => 
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.dashboardURL}/dashboard&response_type=code&permissions=8&scope=bot`));

router.get('/login', (req, res) =>
  res.redirect(`https://discord.com/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.api.url}/auth&response_type=code&scope=identify guilds&prompt=none`));