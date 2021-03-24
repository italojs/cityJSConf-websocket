"use strict";

const AWS = require("aws-sdk");
const { dynamo, awsSDK } = require('./config');
AWS.config.update({ region:  awsSDK.region });

class DataBase {
    constructor(){
        this.DDB = new AWS.DynamoDB(dynamo.apiVersion);
    }

    async addConnection (connectionId) {
        return this.DDB.putItem({
          TableName: dynamo.Table,
          Item: {
            connectionId: { S: connectionId }
          }
        }).promise();
    }

    async deleteConnection (connectionId) {
        return this.DDB.deleteItem({
            TableName: dynamo.Table,
            Key: {
            connectionId: { S: connectionId }
            }
        }).promise();
    }
    
    async scan (ProjectionExpression) {
        return await this.DDB.scan({
            TableName: dynamo.Table,
            ProjectionExpression
          }).promise()
    } 
}

module.exports = { DDB : new DataBase()}
  
  