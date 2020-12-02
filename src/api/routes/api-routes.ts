import { MessageEmbed, Client } from 'discord.js';
import { Router } from 'express';
import { CommandDocument, SavedCommand } from '../../data/models/command';
import Deps from '../../utils/deps';
import { validateBotOwner, sendError } from '../modules/api-utils';
import Stats from '../modules/stats';
import { auth } from '../server';
import { ErrorLogger } from '../modules/error-logger';

export const router = Router();

const errorLogger = Deps.get<ErrorLogger>(ErrorLogger);
const stats = Deps.get<Stats>(Stats);

let commands: CommandDocument[] = [];
SavedCommand.find().then(cmds => commands = cmds);

router.get('/', (req, res) => res.json({ hello: 'earth' }));

router.get('/commands', async (req, res) => res.json(commands));

router.get('/auth', async (req, res) => {
  try {  
    const key = await auth.getAccess(req.query.code.toString());
    res.redirect(`${process.env.DASHBOARD_URL}/auth?key=${key}`);
  } catch (error) { sendError(res, 400, error); }
});

router.post('/error', async(req, res) => {
  try {
    await errorLogger.dashboard(req.body.message);
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

router.get('/invite', (req, res) => 
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_ID}&redirect_uri=${process.env.DASHBOARD_URL}/dashboard&response_type=code&permissions=8&scope=bot`));

router.get('/login', (req, res) => res.redirect(auth.authCodeLink.url));
