import { v4 as uuidv4 } from 'uuid';

export class Raider {
    name: string;
    uuid: string;
    discordId: string;
    role: 'healer' | 'tank' | 'mdps' | 'rdps' | 'unknown';
    simcProfileS3Location?: string;
    simcProfile: string[] = [];
    
    constructor(name: string, discordId: string, role: 'healer' | 'tank' | 'mdps' | 'rdps' | 'unknown')
    {
        this.name = name;
        this.discordId = discordId;
        this.role = role;
        this.uuid = uuidv4();
    }

    addProfile(profile: string)
    {
        this.simcProfile.push(profile);
    }
}