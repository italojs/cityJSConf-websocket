"use strict";

const { DDB } = require('./database')
const config = require('./config')
const AWS = require("aws-sdk");

AWS.config.update({ region:  config.awsSDK.region });

const response = (err) => {
  if (err) return {
    statusCode: 500,
    body:  JSON.stringify(err)
  }
  return {
    statusCode: 200,
    body: "Done"
  }
}

module.exports.connectionManager = (event, _, callback) => {
  switch (event.requestContext.eventType) {
    case "CONNECT":
      DDB.addConnection(event.requestContext.connectionId)
        .then(() => callback(null, response()))
        .catch(err => callback(null, JSON.stringify(err)))
      break;
    case "DISCONNECT": 
      DDB.deleteConnection(event.requestContext.connectionId)
        .then(() => callback(null, response()))
        .catch(err => callback(null, response(err)))
      break;
  }
};

// Custom event definition
module.exports.sendMessage = async (event, _, callback) => {
  try {
    
    // connect with api gateway
    const {domainName, stage} = event.requestContext
    const apiGateway = new AWS.ApiGatewayManagementApi({
      apiVersion: config.apiGateway.apiVersion,
      endpoint: `${domainName}/${stage}`
    });

    // Get all connections in database
    const connectionData = await DDB.scan("connectionId");
    // try send message for each connected users
    await Promise.all(connectionData.Items.map(async ({ connectionId }) => {
      try {
        // if connectionID isn't connected into apiGateway, it will throw an error
        return apiGateway
          .postToConnection({ 
            ConnectionId: connectionId.S, 
            Data: JSON.parse(event.body).data
          }).promise();
      } catch (err) {
        // If connectionId isn't connected into API Gateway we delete it from database
        if (err.statusCode === 410) return await DDB.deleteConnection(connectionId.S);
        throw err;
      }
    }));
  } catch (err) {
    callback(null, response(err));
  }
  callback(null, response());
};

// Default event
module.exports.defaultMessage = (_, __, callback) => callback(null)


