import { wow } from "blizzard.js"
import { WoWClient } from "blizzard.js/dist/wow";
import { Locales } from "blizzard.js/dist/endpoints";
import { WoWItem, WoWGuild } from "../wow-api";

import config from "../config.json" assert {type: "json"};
import { UserError, ErrorReplies } from "../utilities.js";

export class DogWoWClient {
    private static instance_: DogWoWClient;
    private wowClient_!: WoWClient;
    private ourLocale_: Locales;
    private maxItemsToReturn_: number = 3;

    private constructor() {
        this.ourLocale_ = "en_GB";


        console.log("WoW Client succesful initialised");
    };

    public static getInstance(): DogWoWClient {
        if (!DogWoWClient.instance_) DogWoWClient.instance_ = new DogWoWClient();

        return DogWoWClient.instance_;
    }

    public async initialise() {
        wow.createInstance({
            key: config.TOKENS.WOW_CLIENT_ID,
            secret: config.TOKENS.WOW_CLIENT_SECRET,
            origin: 'eu',
            locale: 'en_GB'
        }).then((client) => {
            this.wowClient_ = client;
        });
    }

    private getAPIDataAsWoWItem(wowItemAPIData: any): WoWItem {
        const myItem: WoWItem = {
            name: wowItemAPIData.data.name.en_GB,
            id: wowItemAPIData.data.id,
            slot: wowItemAPIData.data.inventory_type.type,
            ilvl: wowItemAPIData.data.level
        }

        return myItem;
    }

    public async searchItemsByName(nameOfItem: string): Promise<WoWItem[]> {
        const itemSearchArguments = { name: nameOfItem, locale: this.ourLocale_ };

        const response = await this.wowClient_.itemSearch(itemSearchArguments);

        const foundItemsResponse = response.data.results.slice(0, this.maxItemsToReturn_);
        if (foundItemsResponse.length === 0) throw (new UserError(ErrorReplies.CANNOT_FIND_ITEM_WOW_API(nameOfItem)));

        const foundItems = foundItemsResponse.map((foundItemReponse: any) => {
            return this.getAPIDataAsWoWItem(foundItemReponse);
        });


        return new Promise<WoWItem[]>(resolve => { resolve(foundItems) });
    }

    public async searchItemsByID(idOfItem: number): Promise<WoWItem[]> {
        return new Promise(resolve => { });
    }


    private getAPIDataAsGuild(wowGuildAPIData: any): WoWGuild {
        const myGuild: WoWGuild = {
            name: wowGuildAPIData.name,
            id: wowGuildAPIData.id,
            memberCount: wowGuildAPIData.member_count,
            rosterLink: wowGuildAPIData.roster.href,
            achiementLink: wowGuildAPIData.achievements.href
        }
        return myGuild;
    }

    public async getDogGuild(): Promise<WoWGuild> {
        try {
            /*TO DO*/
            const guildSearchArguments = { realm: "tarren-mill", name: "dog-company-ltd" };
            const response = await this.wowClient_.guild(guildSearchArguments);
            const dogGuild = this.getAPIDataAsGuild(response.data);

            return new Promise<WoWGuild>(resolve => { resolve(dogGuild) });
        }
        catch (err) {
            throw err;
        }
    }

    public async getDogAchievements(): Promise<string> {
        try {
            /*TO DO*/
            const myResource: 'achievements' = 'achievements';
            const guildAchievementSearchArguments = { realm: "tarren-mill", name: "dog-company-ltd", resource: myResource };

            const myRoster: 'roster' = 'roster';
            const guildRosterSearchArguments = { realm: "tarren-mill", name: "dog-company-ltd", resource: myRoster };

            const myActivity: 'activity' = 'activity';
            const guildActivitySearchArguments = { realm: "tarren-mill", name: "dog-company-ltd", resource: myActivity };

            const achievementResponse = await this.wowClient_.guild(guildAchievementSearchArguments);
            const rosterResponse = await this.wowClient_.guild(guildRosterSearchArguments);
            const activityResponse = await this.wowClient_.guild(guildActivitySearchArguments);


            return new Promise<string>(resolve => { resolve("found achieves") });
        }
        catch (err) {
            throw err;
        }
    }
}