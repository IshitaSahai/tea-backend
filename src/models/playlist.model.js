import mongoose, { mongo } from "mongoose";
import { Schema } from "mongoose";

const playlistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:[//there'll be multiple videos in an array 
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Plylist=mongoose.model("Playlist",playlistSchema) 