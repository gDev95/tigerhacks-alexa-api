
'use strict';
var Alexa = require('alexa-sdk');
var firebase = require('firebase');
// setup skill
const APP_ID ='amzn1.ask.skill.36e138ee-5e0d-46a7-a9cd-9104e28d892d';
const SKILL_NAME = 'diactate';
const PROJECT_TITLE = "You can create a new project now,please create a name";
const ERROR_REPROMPT = 'Sorry I can not understand what you are saying';

var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
    apiKey: 'AIzaSyDeOoXMfCIt2-WXJ6mLp3TcCQxcGK-lp38',
    authDomain: 'dictate-244d5.firebaseapp.com',
    databaseURL: 'https://dictate-244d5.firebaseio.com',
    storageBucket: 'dictate-244d5'
  }
// Initialize firebase 
var FIRE =  firebase.initializeApp(config);
var database = firebase.database();

// global variables to be able to pass them in functions we were not able to pass in local scope
var note;
var noteTitle;

function addDefaultNotes(){
    // add note to the end of notes list (for rendering purposes)
    var query = FIRE.database().ref().child("projects").orderByKey().limitToLast(1);
  
    query.on("child_added", function(snapshot){
    var uid = snapshot.key;
    //dictate-244d5/projects/snapshot.key/project/notes.id/body/
    //https://dictate-244d5.firebaseio.com/projects/-KwU0uJhxJtZEtND63NX/project/notes/0/body
  
    FIRE.database().ref('projects/'+ uid +'/project/notes').set([{
      edit:false,
      title: "My First Note",
      body: "Welcome to Dictate!"
    }]);
}); 
}

// push notes to the right project
function escapeWithUid(uid){

  FIRE.database().ref('projects/'+ uid +'/project/notes').set([{
    edit:false,
    title: noteTitle,
    body: note
  }]);
}
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
var handlers ={
      'LaunchRequest': function () {
        var greeting = 'Welcome to dictator, start by saying: create project';
        this.emit(':ask', greeting, 'Say, create new project');
      },
    

    'GetNewProject': function(){
     
        var projectTitle = this.event.request.intent.slots.Title.value;     

        FIRE.database().ref('projects/').push().set({
            project: {
                active:false,
                title: projectTitle,
                notes: null
            }
          }, () => {
          
           this.emit(':askWithCard', 'Your new project title is '+ projectTitle, SKILL_NAME, 'Do you wanna add notes to your project?')      
            
          });
          // add first note to a new project
          addDefaultNotes();
       
     // this.emit(':tell', 'Your new project title is '+ projectTitle, 'what should we do next?');
      //contact firebase function;
    },
    'AddNewNote': function() {
        note = this.event.request.intent.slots.Note.value;
      //  console.log('project title: ' + projectTitle);
      
        noteTitle = note.substring(0,8)+"...";

        var query = FIRE.database().ref().child("projects").orderByKey().limitToLast(1);
        query.on("child_added", function(snapshot,note,noteTitle){
          var uid = snapshot.key;
          escapeWithUid(uid)
    });
    this.emit(':ask', "Note has been added", 'add another node as soon as you are ready.')
} ,
    'AMAZON.StopIntent': function() {
      this.emit(':tell', 'I hope you enjoyed the app, have a good day.');
    },
    'AMAZON.HelpIntent': function () {
      
      var intro = "Dictate lets you help create notes. ";
      var actions = "Create a project by saying: create Project: Project Name. " +
      "You can add notes to it by saying: add Note: My Note Content";
      var message = intro+actions;
      this.emit(':ask', message, message);
    },
    'SessionEndedRequest': function() {
      var goodbye = 'I hope you enjoyed the app, have a good day!';
      this.emit(':tell', goodbye)
    },
    'Unhandled': function() {
      var goodbye = "Have a good day!";
      this.emit(':tell', goodbye);
    }
};      

