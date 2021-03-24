"use strict";

module.exports = {
    dynamo: {
        Table: process.env.CONNECTION_TABLE,
        apiVersion: { apiVersion: "2012-10-08" } 
    },
    awsSDK: {
        region: process.env.AWS_REGION
    },
    apiGateway: {
        apiVersion: "2018-11-29",
    }
}