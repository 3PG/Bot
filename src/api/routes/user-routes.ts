import { Router } from 'express';
import { XPCardGenerator } from '../modules/image/xp-card-generator';
import { SavedMember } from '../../data/models/member';
import Deps from '../../utils/deps';
import Users, { Plan } from '../../data/users';
import { sendError } from '../modules/api-utils';
import { getUser } from '../modules/api-utils';
import { Client, User } from 'discord.js';
import { UserDocument } from '../../data/models/user';

export const router = Router();

const bot = Deps.get<Client>(Client),
      users = Deps.get<Users>(Users);

router.get('/', async (req, res) => {
    try {
        const user = await getUser(req.query.key);
        res.json(user);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/saved', async (req, res) => {
    try {        
        const user = await getUser(req.query.key);
        const savedUser = await users.get(user);
        res.json(savedUser);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/xp-card-preview', async (req, res) => {
    try {        
        delete req.query.cache;

        const user = await getUser(req.query.key);
        const savedUser = await users.get(user);
        if (!savedUser)
            return res.status(404).send('User not found');

        const rank = 1;
        const generator = new XPCardGenerator(savedUser, rank);

        const member = new SavedMember();
        member.xp = 1800;
        
        delete req.query.key;
        const image = await generator.generate(member, { ...savedUser.xpCard, ...req.query });
        
        res.set({'Content-Type': 'image/png'}).send(image);
    } catch (error) { sendError(res, 400, error); }
});

router.put('/xp-card', async (req, res) => {
    try {
        const user = await getUser(req.query.key);
        const savedUser = await users.get(user);

        savedUser.xpCard = req.body;
        await savedUser.save();
        
        res.send(savedUser);
    } catch (error) { sendError(res, 400, error); }
});

router.put('/refer', async (req, res) => {
    try {
        const user = await getUser(req.query.key);
        const savedUser = await users.get(user);

        const targetUser = await validateReferral(req.body.tag, user, savedUser);   
        
        savedUser.referralIds.push(targetUser.id);
        await savedUser.save();

        if (savedUser.referralIds.length === 3)
            await users.givePro(user.id, Plan.One);
        
        res.send(savedUser);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id', (req, res) => {
    try {
        res.send(bot.users.cache.get(req.params.id));
    } catch (error) { sendError(res, 400, error); } 
});

async function validateReferral(tag: string, user: User, savedUser: UserDocument) {
    const isValidUserTag = /^.+#\d{4}/.test(tag);
    if (!isValidUserTag)
        throw new TypeError('Target user tag is invalid.');

    const targetUser = bot.users.cache.find(u => u.tag === tag);
    if (!targetUser)
        throw new TypeError('Target user not found in any serverss.');

    const owns3PGGuild = bot.guilds.cache.some(g => g.ownerID === targetUser.id);
    if (!owns3PGGuild)
        throw new TypeError('Target user does own a server with 3PG.');

    if (targetUser.id === user.id)
        throw new TypeError('You cannot refer yourself!');
    if (targetUser.bot)
        throw new TypeError('You cannot refer a bot.');

    const savedUsers = await users.getAll();
    if (savedUser.referralIds.includes(targetUser.id))
        throw new TypeError('You have already referred this user.');

    const alreadyReferred = savedUsers
        .some(su => su.referralIds.includes(targetUser.id));
    if (alreadyReferred)
        throw new TypeError('Someone else has already referred this user.');

    return targetUser;
}
