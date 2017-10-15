'use strict';
var Alexa = require('alexa-sdk');
var firebase = require('firebase');

var APP_ID ='amzn1.ask.skill.36e138ee-5e0d-46a7-a9cd-9104e28d892d';
var SKILL_NAME = 'diactate';
var PROJECT_TITLE = "You can create a new project now,please create a name";
var ERROR_REPROMPT = 'Sorry I can not understand what you are saying';

var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
    apiKey: 'AIzaSyDeOoXMfCIt2-WXJ6mLp3TcCQxcGK-lp38',
    authDomain: 'dictate-244d5.firebaseapp.com',
    databaseURL: 'https://dictate-244d5.firebaseio.com',
    storageBucket: 'dictate-244d5'
  }
var FIRE =  firebase.initializeApp(config);
var database = firebase.database();

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
var handlers ={
      'LaunchRequest': function () {
        var greeting = 'Welcome to dictator, create a new project';
        this.emit(':ask', greeting, 'Say, create new project');
      },
    'GetNewProject': function(){
     
        var projectTitle = this.event.request.intent.slots.Title.value;     

        FIRE.database().ref('/projects/projects/').push().set({
            project: {
                active:false,
                title: projectTitle
            }
          }, () => {
            this.emit(':tellWithCard', 'Your new project title is '+ projectTitle, SKILL_NAME, 'what should we do next?')      
        });

      console.log('project title: ' + projectTitle);
     // this.emit(':tell', 'Your new project title is '+ projectTitle, 'what should we do next?');
      //contact firebase function;
    }
};
    
    