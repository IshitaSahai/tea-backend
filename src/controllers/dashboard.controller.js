import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {

    const { channelId } = req.params;

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: channel._id
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$videoLikes" } }
            }
        }
    ]);

    const {
        totalVideos = 0,
        totalViews = 0,
        totalLikes = 0
    } = videoStats[0] || {};

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    );
});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const {page=1,limit=10}=req.query
    const {channelId}=req.params
    const videos=await Video.find({owner:channelId})//It tells MongoDB: "Find all video documents where the value of the owner field equals channelId."
    .skip((Number(page)-1)*Number(limit))
    .limit(Number(limit))

    res.status(200).
    json(
        new ApiResponse(200,videos,"videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
}