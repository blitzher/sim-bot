import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { initialise } from "../data/manager";
import fs from "fs";

export class S3Uploader {
    s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({ region: "eu-west-1" });
    }

    async putObject(key: string, body: any, bucket: string) {
        const putImageDataCommand = new PutObjectCommand({
            "Bucket": bucket,
            "Key": key,
            "Body": body
        });

        const putResponse = await this.s3Client.send(putImageDataCommand)
    }

    async getObject(key: string, bucket: string) {
        const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        const object = await this.s3Client.send(getObjectCommand);

        return object;
    }

    async getObjectHead(key: string, bucket: string)
    {
        const getObjectHeadCommand = new HeadObjectCommand({
            Bucket: bucket,
            Key: key
        })
        const getResponse = await this.s3Client.send(getObjectHeadCommand);

        return getResponse;
    }

    async objectExists(key:string, bucket: string)
    {
        try{
            await this.getObjectHead(key, bucket);
            return true;
        }
        catch(err)
        {
            console.log(err) //TO DO
            return false;
        }
    }

}