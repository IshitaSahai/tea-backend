import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    //initially the playlist can remain empty and the user can add the videos in it afterwards 
    // const videos = await Video.find({
    //     owner: req.user._id,
    //     videoFile: { $exists: true, $ne: null }
    // });//it fetches the videos uploaded by the logged in user but creating a playlist doesn't necessarily mean that the playlist should contain all videos uploaded by that user, here we're jus creating the playlist and not adding the videos n all to it

    if(!name || !description){
        throw new ApiError(400,"name and description required")
    }

    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    res.status(201)
    .json(
        new ApiResponse(201,playlist,"playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params//id of the user whose playlists we wanna retrive 
    //TODO: get user playlists
    const user=await User.findById(userId)

    if(!user){//user is found via the userId or not 
        throw new ApiError(404,"user not found")
    }

    const playlists=await Playlist.find({//returns an array always(either with the values or empty)
        owner:userId,
    })

    if(playlists.length==0){
        throw new ApiError(404,"no playlists found")
    }

    res.status(200)
    .json(
        new ApiResponse(200,{playlists},"playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"playlists not found")
    }

    res.status(200)
    .json(
        new ApiResponse(200,{playlist},"playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found")
    }

    await Playlist.findByIdAndUpdate(
        playlistId,
        {//methods used inside mongodb upadate queries like findByIdAndUpdate
            $addToSet:{
                videos:videoId
            }
        },
        {new:true}
    )

    res.status(201)
    .json(
        new ApiResponse(201,{},"added to playlist successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    
    const playlist=await Playlist.findById(playlistId)

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found")
    }

    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }

    await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                video:videoId
            }
        },
        {new:true}
    )

    res.status(200)
    .json(
        new ApiResponse(200,{},"video removed successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }

    // $pull removes an element from an array. It does not delete an entire document.
    // await Playlist.findByIdAndUpdate(
    //     playlistId,
    //     {
    //         $pull:{
    //             playlist:playlistId
    //         }
    //     },
    //     {new:true}
    // )
    
    await Playlist.findByIdAndDelete(playlistId)

    res.status(200)
    .json(
        new ApiResponse(200,{},"playlist deleted successfully")
    )
})





// Operator	        What it does	      Common use
// $set 	    Updates a field	        Update playlist name
// $unset	    Removes a field	        Remove a field
// $push	    Adds to an array	    Add an item, duplicates allowed
// $addToSet	Adds unique array elements	Add video to playlist
// $pull	    Removes matching array elements	Remove video from playlist
// $pop	    Removes first or last array element	Remove first/last video




const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    //this isn't required as we're already checking this requirement in the updatedPlaylist 
    // const playlist=await Playlist.findById(playlistId)

    // if(!playlist){
    //     throw new ApiError(404,"playlist not found")
    // }

    if(!name && !description){
        throw new ApiError(401,"Atleast name or description is required")
    }

    const updatedPlaylist=await Playlist.findOneAndUpdate(//to find both the fields id and the owner 
        {
            _id:playlistId,//checks if the playlist id exists and 
            owner:req.user._id//checks if the logged in user trying to change it is the owner 
        },
        {//... spreads the properties of an object into another object. In our controller, it helps us dynamically include only the fields the user wants to update, it's useful so that if we pass only any one of them then only the field that we'll pass will be taken into the object and the one that we're not passing won't be included in the object, it's beneficial as compared to what we were doing previously ie. directly using name,description as in that case we would hv to include both the fields even if any one of them is undefined 
            $set:{
                ...(name && {name}),
                ...(description && {description})
            }
        },
        {new:true, runValidators:true}//runValidators checks the schema validation rules eg:- name must be a string, description must be a string etc. 
    )

    if(!updatedPlaylist){
        throw new ApiError(404,"playlist not found or u r not the owner")
    }

    res.status(200)
    .json(
        new ApiResponse(200,{updatedPlaylist},"playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}