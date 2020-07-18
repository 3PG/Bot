import { Router } from 'express';
import { XPCardGenerator } from '../modules/image/xp-card-generator';
import { SavedMember } from '../../data/models/member';
import { AuthClient, stripe } from '../server';
import { bot } from '../../bot';
import Deps from '../../utils/deps';
import Users from '../../data/users';
import config from '../../config.json';
import Crates from '../modules/crates/crates';
import { sendError } from './api-routes';
import { getUser } from '../modules/api-utils';

export const router = Router();

const crates = Deps.get<Crates>(Crates),
      users = Deps.get<Users>(Users);

router.get('/', async (req, res) => {
    try {
        const user = await getUser(req.query.key);
        res.json(user);
    } catch (error) { sendError(res, 400, error); }
});

const items = [
    {
        name: '3PG PRO',
        description: 'Support 3PG, and unlock exclusive features!',
        amount: 499,
        currency: 'usd',
        quantity: 1
    }
];
router.get('/pay', async(req, res) => {
    try {
        const user = await getUser(req.query.key);
        
        const session = await stripe.checkout.sessions.create({
            success_url: `${config.dashboard.url}/payment-success`,
            cancel_url: `${config.dashboard.url}/pro`,
            payment_method_types: ['card'],
            metadata: { id: user.id },
            line_items: items
        });
        res.send(session);
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

router.get('/open-crate', async (req, res) => {
    try {
        const user = await getUser(req.query.key);
        const savedUser = await users.get(user);

        if (savedUser.crates <= 0)
            throw new TypeError('No crates in inventory');

        const result = crates.open(savedUser);
        
        await savedUser.save();
        
        res.json(result);
    } catch (error) { sendError(res, 400, error); }
});