import { expect } from 'chai';
import NothingReward from '../../../../api/modules/crates/rewards/nothing';
import SevenDaysPROReward from '../../../../api/modules/crates/rewards/seven-days-pro';
import ThreeMonthsPROReward from '../../../../api/modules/crates/rewards/three-months-pro';
import Tier1LegendBadgeReward from '../../../../api/modules/crates/rewards/tier-1-legend-badge';
import Tier2LegendBadgeReward from '../../../../api/modules/crates/rewards/tier-2-legend-badge';
import Tier3LegendBadgeReward from '../../../../api/modules/crates/rewards/tier-3-legend-badge';
import { BadgeType, SavedUser, UserDocument } from '../../../../data/models/user';
import OneMonthPROReward from '../../../../api/modules/crates/rewards/one-month-pro';
import VoteCrateReward from '../../../../api/modules/crates/rewards/vote-crate-reward';

describe('api/modules/crates', () => {

    describe('rewards', () => {
        let savedUser: UserDocument;

        beforeEach(() => {
            savedUser = new SavedUser();
        });

        it('nothing, returns true', () => {
            const reward = new NothingReward();

            const result = reward.give();

            expect(result).to.be.true;
        });

        it('vote crate reward, returns true', () => {
            const reward = new VoteCrateReward();

            const result = reward.give(savedUser);

            expect(result).to.be.true;
        });

        it('vote crate reward, adds 1 crate to saved user', () => {
            const reward = new VoteCrateReward();

            reward.give(savedUser);

            expect(savedUser.crates).to.equal(1);
        });

        it('tier 3 legend badge, has badge, returns false', () => {
            const reward = new Tier3LegendBadgeReward();

            savedUser.badges.push({
                at: new Date(),
                type: BadgeType.Legend,
                tier: 3
            });

            const result = reward.give(savedUser);

            expect(result).to.be.false;
        });

        it('tier 3 legend badge, has better badge, returns false', () => {
            const reward = new Tier3LegendBadgeReward();

            savedUser.badges.push({
                at: new Date(),
                type: BadgeType.Legend,
                tier: 2
            });

            const result = reward.give(savedUser);

            expect(result).to.be.false;
        });

        it('tier 3 legend badge, does not have badge, returns true', () => {
            const reward = new Tier3LegendBadgeReward();

            const result = reward.give(savedUser);

            expect(result).to.be.true;
        });

        it('tier 2 legend badge, has badge, returns false', () => {
            const reward = new Tier2LegendBadgeReward();

            savedUser.badges.push({
                at: new Date(),
                type: BadgeType.Legend,
                tier: 2
            });

            const result = reward.give(savedUser);

            expect(result).to.be.false;
        });

        it('tier 2 legend badge, has worse badge, returns true', () => {
            const reward = new Tier2LegendBadgeReward();

            savedUser.badges.push({
                at: new Date(),
                type: BadgeType.Legend,
                tier: 3
            });

            const result = reward.give(savedUser);

            expect(result).to.be.true;
        });

        it('tier 2 legend badge, has better badge, returns false', () => {
            const reward = new Tier2LegendBadgeReward();

            savedUser.badges.push({
                at: new Date(),
                type: BadgeType.Legend,
                tier: 2
            });

            const result = reward.give(savedUser);

            expect(result).to.be.false;
        });

        it('tier 2 legend badge, does not have badge, returns true', () => {
            const reward = new Tier2LegendBadgeReward();

            const result = reward.give(savedUser);

            expect(result).to.be.true;
        });

        it('tier 2 legend badge, has worse badge, sets badge tier to 2', () => {
            const reward = new Tier2LegendBadgeReward();

            reward.give(savedUser);            

            const result = savedUser.badges[0].tier;
            expect(result).to.equal(2);
        });

        it('tier 1 legend badge, has badge, returns false', () => {
            const reward = new Tier1LegendBadgeReward();

            savedUser.badges.push({
                at: new Date(),
                type: BadgeType.Legend,
                tier: 1
            });

            const result = reward.give(savedUser);

            expect(result).to.be.false;
        });

        it('tier 1 legend badge, has worse badge, returns true', () => {
            const reward = new Tier1LegendBadgeReward();

            savedUser.badges.push({
                at: new Date(),
                type: BadgeType.Legend,
                tier: 2
            });

            const result = reward.give(savedUser);

            expect(result).to.be.true;
        });

        it('tier 1 legend badge, has worse badge, sets badge tier to 1', () => {
            const reward = new Tier1LegendBadgeReward();

            reward.give(savedUser);

            const result = savedUser.badges[0].tier;
            expect(result).to.equal(1);
        });

        it('7 days pro reward, returns true', () => {
            const reward = new SevenDaysPROReward();

            const result = reward.give(savedUser);

            expect(result).to.be.true;
        });

        it('7 days pro reward, adds 7 days to expiration', () => {
            const reward = new SevenDaysPROReward();
            
            savedUser.premiumExpiration = new Date();
            const date = savedUser.premiumExpiration;
            date.setDate(date.getDate() + 7);

            reward.give(savedUser);
            
            const expected = date.getDay();
            const result = savedUser.premiumExpiration.getDay();

            expect(result).to.equal(expected);
        });

        it('1 month pro reward, returns true', () => {
            const reward = new OneMonthPROReward();

            const result = reward.give(savedUser);

            expect(result).to.be.true;
        });

        it('1 month pro reward, adds 30 days to expiration', () => {
            const reward = new OneMonthPROReward();
            
            savedUser.premiumExpiration = new Date();
            const date = savedUser.premiumExpiration;
            date.setDate(date.getDate() + 30);

            reward.give(savedUser);

            const expected = date.getDay();
            const result = savedUser.premiumExpiration.getDay();

            expect(result).to.equal(expected);
        });

        it('3 months pro reward, returns true', () => {
            const reward = new ThreeMonthsPROReward();

            const result = reward.give(savedUser);

            expect(result).to.be.true;
        });

        it('3 months pro reward, adds 90 days to expiration', () => {
            const reward = new ThreeMonthsPROReward();
            
            savedUser.premiumExpiration = new Date();
            const date = savedUser.premiumExpiration;
            date.setDate(date.getDate() + 90);

            reward.give(savedUser);

            const expected = date.getDay();
            const result = savedUser.premiumExpiration.getDay();

            expect(result).to.equal(expected);
        });
    });
});