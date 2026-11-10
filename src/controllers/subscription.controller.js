import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"




// Method	    Purpose	                            Return value
// find()	    Finds all matching documents	    Array
// findOne()	Finds the first matching document	One document or null
// findById()	Finds a document using its _id	    One document or null




const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params//channel for which we need to toggle subscription 
    // TODO: toggle subscription

    const channel=await User.findById(channelId)

    if(!channel){
        throw new ApiError(404,"channel not found")
    }

    const isSubscribed=await Subscription.findOne({//checking if the given channel has been subscribed by the current logged in user if the channel exists in the db then it'll return that document otherwise it'll return null
        channel:channelId,
        subscriber:req.user._id//current logged in user 
    })

    let subscribed;

    if(isSubscribed){
        subscribed=false
        await Subscription.findByIdAndDelete(isSubscribed._id)
    }else{
        subscribed=true
        await Subscription.create({
            channel:channelId,
            subscriber:req.user._id
        })
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{subscribed},"subscribe toggled successfully")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const channel=await User.findById(channelId)

    if(!channel){
        throw new ApiError(404,"channel not found")
    }

    const subscribers=await Subscription.find({
        channel:channelId
    })

    //The channel exists.
    // The request is valid.
    // The channel simply has zero subscribers. so there's no need to throw an error:-
    // if(subscribers.length==0){
    //     throw new ApiError(404,"no subscribers found")
    // }

    res.status(200)
    .json(
        new ApiResponse(200,subscribers,"subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscriber=await User.findById(subscriberId)

    if(!subscriber){
        throw new ApiError(404,"subscriber not found")
    }

    const channelsSubscribedTo=await Subscription.find({
        subscriber:subscriberId
    })

    res.status(200)
    .json(
        new ApiResponse(200,channelsSubscribedTo,"channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}