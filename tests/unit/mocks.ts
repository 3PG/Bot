import { SavedGuild } from "../../data/models/guild"

export default class Mocks {
  guild = new SavedGuild();

  autoMod: any = {
    validateMsg: () => {}
  }

  commandService: any = {
    handle: () => false
  }

  guilds: any = {
    get: () => this.guild
  }

  leveling: any = {
    validateXPMsg: () => { throw new Error(); }
  }
}