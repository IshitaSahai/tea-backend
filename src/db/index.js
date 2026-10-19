import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectDB=async()=>{//as db is in another continent so we need async await so that if it takes time to connect     
    try{//mongoose gives a returned object to us:-so whatever response i scoming to us after the connection, we can hold that response:-
         const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         //as we're purely connecting the db here so we're not using the app etc. n all rn 
        console.log(`\n mongodb connected!! db host: ${connectionInstance.connection.host}`)//this gives the url of mongodb at which the connection is made, this is done so that if in case we get connected to some other server other than the db as the db is different for the production, testing and development so atleast we get to know on which host we're getting connected 
    }catch(err){
        //catch code should be written properly so that we get to know where're we getting the error and where's the problem 
        console.log("mongodb connection error :",err)//if the password isn't correct or there's any problem as such in the mongodb connection with the database then this message gets displayed
        //now node js gives the access to the process 
        process.exit(1)//process is the reference of the process on which our current application is running, there're multiple exit codes for exiting, here we've taken 1 
    }
}

export default connectDB//exporting the db connection 

// using exit() method of process object:
//     usecase: It is used if you want to terminate the execution completely regardless of any async operation at all.
//     default value exit(0)  which indicate exit successfully without any interption.
//     any non zero value  like exit(1) indicates process exit intentionaly.

