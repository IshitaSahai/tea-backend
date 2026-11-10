import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user=req.user._id;

    const {content}=req.body

    if(!user){
        throw new ApiError(404,"user not found")
    }

    if(!content){
        throw new ApiError(404,"tweet content is required")
    }
    
    const tweet=await Tweet.create({
        owner:user,
        content:content
    })

    res.status(201)
    .json(
        new ApiResponse(201,{tweet},"tweet created successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user=req.user._id

    if(!user){
        throw ApiError(404,"user not found")
    }

    const tweets=await Tweet.find({
        owner:user
    })

    res.status(200)
    .json(
        new ApiResponse(200,{tweets},"tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params//req.params contains an object containing all the route parameters but we need only the tweetId

    const tweet=await Tweet.findById(tweetId)

    const {content}=req.body//returns an object but we need only the content 

    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }

    if(!content){
        throw new ApiError(400,"content is required")
    }

    const updatedTweet=await Tweet.findByIdAndUpdate(
        {//verification to ensure that only the owner can update the tweet with the given id and noone else can 
            _id:tweetId,
            owner:req.user._id
        },
        {
            content:content
        },
        {new:true,runValidators: true}//returns the new tweet and runValidators: true checks that the content that we're sending is as per what's required as per the schema 
    )

    if(!updatedTweet){
        throw ApiError(400,"tweet not updated")
    }

    res.status(200)
    .json(
        new ApiResponse(200,{updatedTweet},"tweet updated successfully")
    )

})

//findOneAndDelete : a Mongoose method used to find a single document matching a given condition and delete it from the MongoDB collection.

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId}=req.params

    const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }

    await Tweet.findOneAndDelete({
        _id:tweetId,
        owner:req.user._id
    })

    res.status(200)
    .json(
        new ApiResponse(200,{},"tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}