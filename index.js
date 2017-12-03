'use strict';

// We use mockery so that we can bypass Dynamo by default
var mockery = require('mockery');
var AWS = require('aws-sdk');

// Use dotenv to configure environment variables
//  Loads variables from local .env file at project root
//  See .env.example for how it works
require('dotenv').config();

setupDynamo();

var Alexa = require('alexa-sdk');
var constants = require('./lib/constants');
var stateHandlers = require('./lib/stateHandlers');
var audioEventHandlers = require('./lib/audioEventHandlers');
var AudioManager = require('./lib/audioManager');
var qs = require('querystring');
var bst = require('bespoken-tools');

// Initial entry point, and checks the signature if necessary
var handler = function(event, context) {
    var appID = null;
    var rssURL = 'https://s3-us-west-1.amazonaws.com/floz-rss-feed-reader/bonEntendeur.rss';

    if (process.env.RSS_URL) {
        rssURL = process.env.RSS_URL;
    }

    if (process.env.APP_ID) {
        appID = process.env.APP_ID;
    }
    processEvent(event, context, appID, rssURL);
};

function processEvent (event, context, appID, rssURL) {
    var alexa = Alexa.handler(event, context);
    if (appID !== null) {
        alexa.appId = appID;
    }
    console.log("APP_ID: " + alexa.appId + " APP_ID ENV: " + appID);
    alexa.dynamoDBTableName = constants.dynamoDBTableName;
    alexa.registerHandlers(
        stateHandlers.startModeIntentHandlers,
        stateHandlers.playModeIntentHandlers,
        stateHandlers.scanModeIntentHandlers,
        stateHandlers.remoteControllerHandlers,
        stateHandlers.resumeDecisionModeIntentHandlers,
        audioEventHandlers.playHandler,
        audioEventHandlers.scanHandler
    );

    if (alexa.state === null || alexa.state === '') {
        alexa.state = constants.states.START_MODE;
    }

    AudioManager.load('URL', rssURL, 60, function (error, feed) {
        if (error !== undefined && error !== null) {
            context.fail(error);
        } else {
            alexa.execute();
        }
    });

}

function setupDynamo (alexa) {
    // Flip this flag if you want to use dynamo
    // If this is not set, we just use a simple, local Mock DB
    if (process.env.USE_DYNAMO && process.env.USE_DYNAMO === "true") {
        AWS.config.update({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            },
            region: process.env.AWS_DEFAULT_REGION
        });
        console.log("!Using Dynamo!");

    } else {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        mockery.registerMock('./DynamoAttributesHelper', require("./lib/mockDynamo"));
    }
}

exports.handler = bst.Logless.capture('8cba919b-fdc9-402a-a90a-29f53905d037', handler);


