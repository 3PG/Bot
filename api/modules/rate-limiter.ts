import rateLimit from 'express-rate-limit';
import rateLimitStore from '@lykmapipo/rate-limit-mongoose';
import config from '../../config.json';

const windowMs = 1 * 60 * 1000;
export default rateLimit({
    store: rateLimitStore({ windowMs }),
    max: 30,
    message: `ITS TIME TO STOP! ITS TIME TO STOP OK! NO MORE!`,
    skip: (req, res) => {
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;        
        return config.api.whiteListedIPs.some(ip => ip === clientIP);
    }
});