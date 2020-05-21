import { User } from 'discord.js';
import { SavedUser, UserDocument } from '../data/models/user';
import DBWrapper from './db-wrapper';

export default class Users extends DBWrapper<User, UserDocument> {
    protected async getOrCreate(user: User) {
        if (user.bot)
            throw new TypeError(`Bots don't have accounts`);
    
        const savedUser = await SavedUser.findById(user.id);
        if (savedUser && savedUser.premiumExpiration <= new Date())
            await this.removePro(savedUser);

        return savedUser ?? this.create(user);
    }

    private removePro(savedUser: UserDocument) {
        savedUser.premium = false;
        return savedUser.save();
    }

    protected create(user: User) {
        return new SavedUser({ _id: user.id }).save();
    }
}