import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export class DynamoUploader
{
    table: string;
    dynamoClient: DynamoDBDocumentClient;

    constructor(table: string){
        this.table = table;

        const marshallOptions = {
            convertEmptyValues: false,
            removeUndefinedValues: true,
            convertClassInstanceToMap: true
        };
    
        const unmarshallOptions = {
            wrapNumbers: false, 
        };

       this.dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({region: "eu-west-1"}));
    };

    async putObjectDynamo(objectToPut: Object)
    {
        const jsonObject = JSON.parse(JSON.stringify(objectToPut));
        const putItemCommand = new PutCommand({
            TableName: this.table,
            Item: jsonObject
        });

        try {
            const putResponse = await this.dynamoClient.send(putItemCommand);
        }
        catch (putDynamoError) {
            throw(putDynamoError);
        }
    }
}