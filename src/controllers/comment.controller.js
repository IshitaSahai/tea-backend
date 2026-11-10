import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params//Used to extract specific values that are part of the URL path.
    const {page = 1, limit = 10} = req.query//Used to extract optional information passed after ? in the URL.
    //limit=10 means Display 10 users per page.
    //page=1 means fetch 1st page 

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found")
    }

    const skip=(Number(page)-1)*Number(limit);

    const comments=await Comment.find({
        video:videoId
    })
    .skip(skip)
    .limit(Number(limit))//it specifies the maximum number of documents to return.
    //skip() tells MongoDB how many documents(here comments) to ignore before returning results. eg:- if page=2 and limit=10 => skip=(page-1)*limit 

    return res.status(200).json(
        new ApiResponse(200,comments,"Comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}=req.body

    const {videoId}=req.params

    if(!content){
        throw new ApiError(400,"content of the comment is missing")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found")
    }

    const owner=req.user._id;

    const comment=await Comment.create({
        content,
        video:videoId, //it's used as it's the actual mongodb object referencing that video and video is just the document that's returned by Video.findById(videoId) as while returning the videoId, although mongoose can directly cast a Video document to its _id when assigning it to an objectId reference but explicitly passing the ID avoids the ambiguity 
        owner
    })

    //if comment fetched then send it to the database:-
    return res.status(201)
    .json(
        new ApiResponse(201,comment,"comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content}=req.body

    const {commentId}=req.params

    if(!content){
        throw new ApiError(400,"content is missing")
    }

    const comment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {new:true}
    )

    if(!comment){
        throw new ApiError(404,"comment not found")
    }

    return res.status(200).json(
        new ApiResponse(200,comment,"comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    const comment=await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"comment not found")
    }

    await Comment.findByIdAndDelete(commentId)

    return res.status(200)
    .json(
        new ApiResponse(200,{},"comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}