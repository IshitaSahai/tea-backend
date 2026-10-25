//2ND APPROACH OF MAKING A DB:- 
// require('dotenv').config({path: './env'}) 
//improved version:-
import dotenv from "dotenv"//this syntax can be used via an experimantal feature by writing it in the dev scripts in package.json
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()//till this point only the mongodb databse has been connected but the application hasn't started listening by using the db , so we'll make the app to listen in the then block so that the server can get started 
.then(()=>{//before listening on the app, we also listen to the errors:-
    app.on("error",(error)=>{
        console.log("err",error)
        throw error
    }) 
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server running at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("mongodb connectionn failed",err)
})



//1ST APPROACH OF MAKING A DB:- 
// //we sometimes initialize the app.js file as well in this file that's made via express:-
// import express from "express"
// const app=express()

// // function conectDB(){

// // }

// //we can also use iifi:-//it's a good pracitce to start the iifi with the semi colon as if there's no semi colon in the previous line in the code then it may lead to some problems 
// //connecting the db:-in order to connect the db, we need to give the db name as well by putting the slash after taking the variable from the .env
// ;(async()=>{
//     try{//db has been connected via this line:-
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         //after the db connection, the work that we need to do is the listening work on the app, but we also need to listen to the errors, these r used so that if the db has been connnected but the express app isn't able to talk then we can use it :-
//         app.on("error",(error)=>{
//             console.log("err",error)
//             throw error
//         })
//         //this is the backend app:-
//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listening on port ${process.env.PORT}`)
//         })
//     }catch(error){
//         console.log(error)
//         throw error
//     }
// })()
// // conectDB()

// //it's a good approach that we've written the entire db connection inside the single iifi and not poluting anything outside it 
// //but our index file has been polluted so much 

//as early as possible in the application, import and configure dotenv ie. require('dotenv').config() as it's our environment file so we want that as soon as our application loads, the environment variables get available everywhere so that if they get available in the main file then wherever we've used those variables, all the files will get access to that environment variables 