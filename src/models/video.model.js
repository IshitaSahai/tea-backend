import mongoose,{mongo, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
//we'll be using the mongoose-aggregate-paginate-v2 in this file, it's used as a plugin 
//1st step is to import it:-
import mongoosseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema=new Schema({
    videoFile:{
        type:String,//cloudnary url
        required:true,
    },//mongodb allows us to store the small video and images files in the form of media files only but it's not a gppd practice as it puts a lot of load on the db so they're kept separately in the code
    thumbnail:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{//it won't be given by the user, it'll be given by the clounary, as soon as cloudnary uploads any file, it gives the file information ie. the url of the file, it also sends the time/duration of the video 
        type:Number,
        default:0,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{//checks if the video is publicly available or not 
        type:Boolean,
        default:true,
    },
    owner:{//owner of the video will be the user 
        type:Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true})

//before exporting mongoosseAggregatePaginate we need to use it with the videoschema:-there're many methods with the videoschema ie. many middlewares can be injected in mongoose and also the self plugins can also be injected (https://mongoosejs.com/docs/middleware.html)
//we can also add our own plugins in mongoose:-
videoSchema.plugin(mongooseAggregatePaginate)//now we can write the aggregation querie

export const Video=mongoose.Model("Video",videoSchema)

