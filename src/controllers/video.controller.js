import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const user=await User.findById(userId)

    if(!user){
        throw new ApiError(404,"user not found")
    }
 
    const skip=(Number(page)-1)*Number(limit)

    //We generally want to display only published videos:-
    const filter = {
        isPublished: true
    };

    //$or means at least one condition must match.
    // $regex searches for a matching text pattern.
    // $options: "i" makes the search case-insensitive.
    if (query) {//the search condition via which we should display our results ie. checking if the title or the description of the video matches the search by matching the text patterns via regex and also avoiding the case sentitiveness via $options:"i"
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        filter.owner = userId;
    }

    const sort = {};

    if (sortBy) {
        sort[sortBy] = sortType === "asc" ? 1 : -1;
    } else {
        sort.createdAt = -1;//displays the newest videos first ie. the ones that're created at the last
    }

    const videos=await Video.find(filter).sort(sort).skip(skip).limit(Number(limit))

    return res.status(200)
    .json(
        new ApiResponse(200,videos,"videos fetched successfully")
    )
})

// The Cloudinary response contains several properties, including:
// videoUpload.url
// videoUpload.secure_url
// videoUpload.public_id
// videoUpload.duration



const publishAVideo = asyncHandler(async (req, res) => {
    //req.body contains text data.
    // req.params contains URL parameters.
    // req.query contains query parameters.
    const {title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoFile=req.files?.videoFile?.[0]//each Multer file object contains a path property that stores the local path (where the uploaded file is temporarily saved.) via which we can call the upload on cloudinary function as our function expects a local file path


    //as we're using upload.fields(), req.files is an object whose properties contain arrays of file objects. That's why we're accessing [0] in order to access the 0th indexed object from the array 
    const thumbnailFile=req.file?.thumbnail?.[0]

    if(!videoFile || !thumbnailFile || !title || !description){
        throw new ApiError(400,"all fields are required")
    }

    //as we're using await, JavaScript waits for the video upload to finish before starting the thumbnail upload.
    const videoUpload = await uploadOnCloudinary(videoFile.path);

    const thumbnailUpload = await uploadOnCloudinary(thumbnailFile.path);

    if(!videoUpload || !thumbnailUpload){// If either upload fails, delete whichever file was successfully uploaded
    // because both files are required to publish a video.
    //This ensures that you don't leave an unnecessary file on Cloudinary when the other upload fails.
        if (videoUpload) {
            await deleteFromCloudinary(videoUpload.public_id,"video");
        }

        if (thumbnailUpload) {
            await deleteFromCloudinary(thumbnailUpload.public_id,"image");
        }

        throw new ApiError(500,"error uploading the files to the cloudinary")
    }

    //secure_url: URL of the uploaded file on Cloudinary.
    // public_id: Unique identifier used to manage/delete the Cloudinary asset.
    // duration: Video duration returned by Cloudinary.
    // req.user._id: ID of the authenticated user attached by your JWT middleware.
    const video=await Video.create({//storing the file urls in the db after uploading on the cloudinary //MongoDB database does not store the actual video or thumbnail. Cloudinary stores the files, and MongoDB stores the URLs that point to those files.
        videoFile:videoUpload.secure_url,
        thumbnail:thumbnailUpload.secure_url,
        videoFilePublicId: videoUpload.public_id,
        thumbnailPublicId: thumbnailUpload.public_id,
        title,
        description,
        duration:videoUpload.duration,
        owner:req.user._id
    })

    return res.status(201)//this response is sent to the frontend 
    .json(
        new ApiResponse(201,{video},"video published successfully")
    )

})



const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{video},"video fetched successfully")
    )
})



const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description}=req.body//it'll come from req.body ie. from the info that the user sends at the frontend in order to update

    
    const thumbnailFile=req.file//multer here expects only one file so there's no need to use .thumbnail?.[0] etc.

    if(title===undefined && description===undefined && !thumbnailFile){
        throw new ApiError(400,"atleast one field is required")
    }

    let thumbnailUpload;

    if(thumbnailFile){
        thumbnailUpload=await uploadOnCloudinary(thumbnailFile.path)

        if(!thumbnailUpload) throw new ApiError(500,"thumbnail upload failed")
    }

    const updatedVideo=await Video.findOneAndUpdate(
        {//check so that only the owner can update the video details 
            _id:videoId,
            owner:req.user._id
        },
        {
            ...(title!==undefined && {title}),
            ...(description!==undefined && {description}),
            ...(thumbnailUpload && {thumbnail:thumbnailUpload.secure_url})
        },
        {new:true,runValidators: true}
    )

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found or you are not the owner");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{updatedVideo},"video updated successfully")
    )

})



const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    });

    if (!video) {
        throw new ApiError(404, "Video not found");
    }


    await deleteFromCloudinary(video.videoFilePublicId,"video")
    await deleteFromCloudinary(video.thumbnailPublicId,"image")

    return res.status(200)
    .json(
        new ApiResponse(200,{},"video deleted successfully")
    )
})



const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video doesn't exist")
    }

    const updatedVideo=await Video.findOneAndUpdate(
        {
            _id:videoId,
            owner:req.user._id
        },
        {
            $set:{
                isPublished:!video.isPublished
            }
        },
        {new:true}
    )

    if(!updatedVideo){
        throw new ApiError(404,"video doesn't exist or you aren't the user")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{updatedVideo},"video publish status updated successfully")
    )
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}