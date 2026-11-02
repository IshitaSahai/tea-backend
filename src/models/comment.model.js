import mongoose,{mongo, Schema, Types} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";//used to allow the user to load the comments or get it from the other page 

const commentSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true})


commentSchema.plugin(mongooseAggregatePaginate)//it has the ability to decide that starting from where till where will it give the videos 
export const Comment=mongoose.model("Comment",commentSchema)

