import mongoose, {Schema} from "mongoose";

const subscriptionSchema=new Schema({
    //both the subscriber and the channel are users as well as channels but we're using different names for them for our own understanding:-
    subscriber:{
        type:Schema.Types.ObjectId,//one who's subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,//the one to whom the subscriber is subscribing 
        ref:"User"
    }

},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)

//whenever the user subscribes to any channel, then a new document is created that contains the channel name and the name of the user who is subscrbing to that channel and a user can subscribe to any number of multiple channels and a single channel can hv any number of multiple susbscribers
//so if we wanna check the no of subscribers of any channel:- we'll count only those documents that'll be having the channel as chaiaurcode, we won't be counting the subscribers, we'll be counting the documents that'll be containing the channel whose subscribers we wanna know  
//so in order to know the no of subscribers of any channel, we'll select the channels to count instead of counting the no of subscribers


//in order to know how many channels a user has subscribed, select the no of documents that'll be having the subscriber as the user for whom we're finding the no of channels that he/she has subscribed

//a new document is created whenver a user subscribes to any channel ie. channel is subscribed by any user and also when a single user subscribes to multiple channels, each time it subsribes to any channel a new document is created 

//NO OF SUBSCRIBERS OF A CHANNEL= COUNT OF THE DOCUMENTS CONTAINING THAT CHANNEL AS THE VALUE OF CHANNEL
//NO OF CHANNELS SUBSCRIBED BY A USER/SUBSCRIBER=COUNT OF DOCUMENTS CONTAINING THAT USER AS A SUBSCRIBER 


//OUR MAIN TASK IS TO JOIN THE SUBSCRIPTION MODEL IN THE USER MODEL IE. JOIN ALLL THE INFO FROM THE SUBSCRIPTION TO THE USER 

//to read abt agregation pipelines, we can use this to search aggregation pipelines:-
// https://www.mongodb.com/docs/manual/reference/operator/aggregation/in/

//direct documentation of aggregation pipelines:-https://www.mongodb.com/docs/manual/core/aggregation-pipeline/

//aggregation pipeline:- it refers to the stages and each statge performs operations on input documents
//it means that if we've a set of 100 documents and at any one stage we applied some filtering via which the no of documents get reduced to 50 then in the next stage the no of documents upon which any operation will be performed will be on 50 documents only ie. the documents that're output from a stage are passed on to the next stage

//EXAMPLE FOR THIS:-WE'VE 2 DOCUMENTS ONE IS THE BOOK AND ANOTHER IS THE AUTHOR:- "book" that conatins info of multiple books and each info contains the _id, title, author_id, genre
//here the author_id is the id of the document "author" which will match with the id of the object of the author document that contains the information of the author that's being refered via the author_id in the books info section, the id of the author in the author document should be the same as that of the author_id that's been specified in the book info section in the book document

//if the id of author in the author document is same as that of the id of the author_id then we can join the author document containing the author details with the book document that contains the same author_id as the id of the aurthor in the author document then the whole info of the so wherever the author_id will be the same as the id of the author in the author document, at all those places, the author document will get attached in the book document

//1st pipeline in an aggregation that we can write is:- $match via which we can write the criteria abt if we wanna find the users of the same usernames or some other criteria if we wanna write something else
 

//in order to join the documents, we should go on aggregation option on the books collection, we've a stage k/a lookup:-that contains some fields ie.:- from: it takes the name of the name of document we wanna join, localField: it takes the name of the field that we hv in our document ie. author_id that we can match from the document that we're trying to attach to the books 
//then we've foreign field ie. the name of the field in the other document that we wanna match 
//the "as" field contains the name of the result field that we'll get 

//in order to add new fields, we use $addFields that will do the work of returning some value of the array that we want ie. for eg:- it's similar to the functionality of appending the first and the last names from the information that the user has entered separately in first name and last name fields 
