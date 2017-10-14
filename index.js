var Firebase = require("firebase")

function buildSpeechletResponse(output,repromptText,shouldEndSession){
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    } 
}
function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}
function getWelcome(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const speechOutput = 'Welcome to The Dictator. ' +
        'start a new project or open an existing project';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Please tell me what to do by saying, start new project or open project';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
}
function getTitleObj(projectTitle){
    return {
        projectTitle,
    }
}

function createNewProject(db,intent,session,callback){
    let projectTitle = intent.slots.Title.value;
    //log intent to blackbox
    console.log(intent);

    let sessionAttributes = {};
    let speachOutput = '';
    let repromptText = '';
    const shouldEndSession = true;
    
    // log project title to blackbox
    console.log("Project Title is ", projectTitle);
    
    if(projectTitle){
        sessionAttributes = getTitleObj(projectTitle);
        speechOutput = `The name of the project is ${projectTitle}`;
        db.ref().child("project") // creates a key called hello
        .set(sessionAttributes)                            // sets the key value to world
        .then(function (data) {
          console.log('Firebase data: ', data);        
          context.succeed();                  // important that you don't call succeed until you are called back otherwise nothing will be saved to the database!
        })
        .catch(function (error) {
            console.log('Firebase error: ', error);
            context.fail();
        });
    }
    else
    {
        speechOutput = 'No valid title given'
    }

    callback(sessionAttributes, buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
}

function onIntent(db,intentRequest, session, callback){
    console.log("IntentRequest: ", intentRequest);
    
    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;
    
    console.log("Intent Name is",intentName);
    if(intentName === 'createProject')
    {
        createNewProject(db,intent,session,callback);
    }
    
    
}
function onLaunch(launchRequest, session, callback)
{
    console.log('Alexa launch')
    getWelcome(callback);
}


exports.handler = (event, context, callback) => {
    // TODO implement
     // then click "add firebase to your web app"
     var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
        apiKey: 'AIzaSyDeOoXMfCIt2-WXJ6mLp3TcCQxcGK-lp38',
        authDomain: 'dictate-244d5.firebaseapp.com',
        databaseURL: 'https://dictate-244d5.firebaseio.com',
        storageBucket: 'dictate-244d5'
      }
    Firebase.initializeApp(config);
    export const db = firebase.database()
    try{
        if(event.session.new){
            console.log("New Session started");
        }
        if(event.request.type ==='LaunchRequest')
        {
            // function calling welcome
            onLaunch(event.request, event.session, (sessionAttributes, speechletResponse) => {
                callback(null, buildResponse(sessionAttributes,speechletResponse));
            })
        } else if (event.request.type === 'IntentRequest') {
            onIntent(db,event.request, event.session,(sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SesionEndedRequest') {
            onSessionEnded(event.request,event.session)
            callback();
        }
        
    } catch(err)
    {
        callback(err);
    }
    
};