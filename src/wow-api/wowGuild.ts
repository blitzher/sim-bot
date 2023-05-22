type GuildId = number;

type WoWGuild = {
    name: string;
    id: GuildId;
    memberCount: number;
    rosterLink: string;
    achiementLink: string;
}

export default WoWGuild;