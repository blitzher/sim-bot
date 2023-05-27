import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { initialise } from "../data/manager";
import fs from "fs";

export class S3Uploader
{
    s3Client: S3Client;

    constructor()
    {
        this.s3Client = new S3Client({region: "eu-west-1"});
    }

    async putObject(key: string, body: any, bucket: string){
        const putImageDataCommand = new PutObjectCommand({
            "Bucket" : bucket,
            "Key": key,
            "Body": body
        });

        const putResponse = await this.s3Client.send(putImageDataCommand)
    }

    async getObject(key: string, bucket: string){
        const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        try{
        this.s3Client.send(getObjectCommand).then(
            async (data) => {
                console.log(await data.Body?.transformToString());
            }
        );
        }
        catch(err)
        {
            console.log(err);
        }
    }

}