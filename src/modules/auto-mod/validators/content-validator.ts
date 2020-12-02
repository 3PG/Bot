import { GuildDocument, MessageFilter } from '../../../data/models/guild';

export interface ContentValidator {
  filter: MessageFilter;

  validate(content: string, savedGuild: GuildDocument): void | Promise<void>;
}