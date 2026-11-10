import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found")
    }

    const isLiked=await Like.findOne({//gives the liked document if the user has liked the video 
        video: videoId,
        likedBy: req.user._id
    });

    let liked;

    if(isLiked){
        liked=false
        await Like.findByIdAndDelete(isLiked._id);//we're using isLiked._id because isLiked is the Like document, and we need its own ID to delete the like.
    }else{
        liked=true
        await Like.create({
            video:videoId,
            likedBy:req.user._id
        })
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{liked},"toggled the like successfullly")
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const comment=await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"comment not found")
    }

    const isLiked=await Like.findOne({//matches the comment as per:-
        likedBy:req.user._id,//Has the currently logged-in user liked this particular video? and 
        comment:commentId//Which comment are we checking?
    })//it returns null if the comment hasn't been liked 


    let liked;

    if(isLiked){
        liked=false
        await Like.findByIdAndDelete(isLiked._id)//we're using isLiked._id because isLiked is the Like document, and we need its own ID to delete the like.
    }else{
        liked=true
        await Like.create({
            comment:commentId,
            likedBy:req.user._id
        })
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{liked},"like added on the comment successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }

    const isLiked=await Like.findOne({//returns null if the tweet hasn't been liked 
        tweet:tweetId,
        likedBy:req.user._id
    })

    let liked;

    if(isLiked){
        liked=false
        await Like.findByIdAndDelete(isLiked._id)//taking the id of the like document as like document contains the id of the tweet documents that hv been liked, so if we delete that like document id from the db then the like document won't contain the like for that tweet anymore as it has already deleted the like document for that particular tweet 
    }else{
        liked=true
        await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        })
    }

    res.status(200)
    .json(
        new ApiResponse(200,liked,"tweet like toggled successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos(belonging to the logged in user ie. the videos that the current user has liked)
    const likedVideos=await Like.find({//.find finds all the documents that satisfy the condition
        likedBy:req.user._id,
        video:{$exists:true, $ne:null}//$ne:means not equal to. This checks that the value of video is not null.
        //exists: true Checks whether the video field exists in the document.
    }).populate("video")//in order to get the video details, we use populate as well along with find otherwise we cna simply use the .find without .populate that'll only contain the objectIds of the videos that're liked 

    res.status(200)
    .json(
        new ApiResponse(200,likedVideos,"liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}