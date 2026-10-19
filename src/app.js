import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"//it's used so that we can access the cookies of the user's browser from our server and set them, as there're some ways via which we can keep some secure cookies in the user browser, those secure cookies can be read by the server only and can be removed as well only via the server 
//all these packages are configured after we make the app


const app=express()

//cors:-the use method is used for all the middlewares and the configurations 
app.use(cors({//some options that're used at production level:-onw option is origin:- it means which origin r we allowing:-
    origin:process.env.CORS_ORIGIN,
    //we can use ctrl+space in order to see more available options:-
    credentials:true
}))//the cors gets configured via this line, in case if we wanna do some settings as well of the cors then we can do the settings in it as well, we can see the documentation to see the corsOptions that's an object in which we can define its origin(which means that we've a backend and from where/which places from the frontend r we gonna accept the request as not every other request will be accepted, only a few ones from the frontend will get accepted), we can also define the optionsuccessstaus n all 

//before going to the cookie data, we need to do some settings as the data will come from many places to the backend ie. from the url, json,body, form so there're some settings/security setitngs/practices that're used, for eG:-if json data is coming then we can't allow the unlimited data to come, we'll set a limit that'll ensure that the server doesn't crash 

//we use this:- format when we configure the form:-
app.use(express.json({//previously the express couldn't take the json files this much easily, we were needed to use body-parsers n all in order to accept them but now it's not needed as all the work of body-parsers in now in all the versions of the express (just a short note abt multer:- we do the file uploading configuration via it as express isn't ready for file uploads unlike these json uploads)
    limit:"16kb"//how much limit of the json do we wanna accept 
}))//it means that we're doing the configuration of the json ie. we're accepting the json here


//in order to configure the data from the url:-there may be some problems when we do the configuration via the url, as in url, sometimes whatever we search gets encoded in some other format, so there're separate encoders for the url that converts the special characters of the urls (egg:- the url encooded value for the space is %20), so we need to tell express that the data can come that way as well, so we need to do a configurationn for that as well:-
app.use(express.urlencoded({extended:true, limit:"16kb"}))//we can also use some other options/keywords ie. it means that we can give the nested objects as well inside it 

//one more final configuration for storing files, folders as well in our own servers so we make a public folder/assets that can be accessed by anyone at all:-
app.use(express.static("public"))//public is a folder in which we're storing these all, it has already been made in our folder structure


app.use(cookieParser())


export {app}//we can also export it using export default app 

//whenever any asynchronous db gets connected, it also returns a promise, and we've written an asynchronous method ie. conneDB, so it also returns a promise so we can keep .then and .catch in the index.js file now 


//express api request:- handles how and when the data is coming from the request 
//response:- when and how do we need to send the data in the response 
//many options r there in request :- req.params:- whenever the data comes via the url it mostly comes via params only eg:- the url vontaining ?search='some term', so we'll handle how to handle all those parameters in the request 
//req.body:- the data can come in many forms like forms, json and many others and for that we need to do some configurations 

//whenever we use req.body(), we get the instructions that we can use the body-parser etc, but nowadays we don't need to use body-parser packages n all as they're all included in the express already

//many times we may also take the data from the cookies:- we need to learn what are the cookies, how r they stored from the server to the browser of the user and how to read the cookies

//cookie-parser:- it's an npm package, we need to install this in order to use it 

//cors is also a big problem that has to be handled at the backend 

//docs in order to install the coookie-parser n all the packages:- https://www.npmjs.com/package/
//to install we use npm i cookie-parser cors 
//another package that we need is the cors:- it allows us to do the settings for the cross origin resource sharing:- it's used using:- app.use(cors())
//we use the middlewares mostly using the app.use() only

//app.use() is used whenever we want to do any congiguration settings or use the middlewares 

