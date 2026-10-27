import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from '../utils/ApiResponse.js'
import e from "express";
//async handler is a higher order function that accepts a function
const registerUser=asyncHandler(async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"//here we've sent the http status code as 200 and sent the json response with it just like we were sending html
    // })

    //steps/algorithms for registering a user:-
    //1. get the user details from frontend by the user:-we can directly take the data of the user details  via postman from the get/post requests that we've sent 
    //we hv to check from the user.model that which user details we need to take 
    //2. validation:- checking if the user hasn't sent the empty username/email, and if all of it is in the correct format or not, we'll check atleast not empty for all the fields
    //3. check if already exists:- via username,email
    //4. if user account doesn't exist then attempt to make an account and while doing so check if files r there or not :-images,avatar
    //5. if images exist then upload them to cloudinary-create entry in db if they're available :-we already hv a utility of cloudinary that gives a response (that contains a url) on getting an image, check if avatar has been uploaded or not, if not then also we can't proceed as it's a required field 
    //6. if the image has been uploaded on cloudinary and the avatar has been properly uploaded then we create user object that contains all the information detials- when we send the data in mongodb, then as it's a nosql db, so mostly the objects are made and uploaded - create entry in db 
    //7. remove password and refresh token fields from response as we don't wanna send the password to the user as when we do the entries in the mongodb then whatever has been made, all the details including the password and everything comes to the user as the response if we don't remove it and we don't want that so we remove the passoword and refresh token so that the user doesn't get it
    //8. check for user creation 
    //9. if user created then return response else send the error

    const {fullname,username,email,password}=req.body//if the data may come from the form or the json then we'll get it in req.body otherwise if it's coming from url then we need to handle it differently
    //console.log("email",email)//as we haven't closed this request in the response so the request will get stuck at the postman while we're trying to test it

    //validation:-
    // if(fullname===""){//apierror accepts the satuscode as well as the message 
    //     throw new ApiError(400,"fullname is required")
    // }
    //instead of using the if else everytime for each condition, we're using this 1 single if block that executes everything
    if(//we can check the condition using the some method that returns true or false 
        [fullname,email,username,password].some((field)=>field?.trim()==="")//if the field exists and after trimming the fields also, if any one of these fields is empty, then, true will be returned
    ){
        throw new ApiError(400,"all fields are compulsory/required")
    } 

    //till now we've not done anything related to handling the files that're coming from the frontend and if we try to handle directly using the req.body then we'll not be able to handle the files we'll only be able to handle the data so we'll go to the routes file and perform file handling (of the files coming from the frontend) related tasks there 


    //to check if user already exisits or not we need to import user from the usermodel file and that user can directly contact with the db as it's created with mongoose and the user will call mongodb on our behalf any no of times we want:-

//we're asking the user to find the 1st user in the db that matches the email/username that the user has enterd:- if we find any one of the email/username same  we'll send an error to the user that the email/username already exists then we'll give the error to the user that it already exists:-
 const existedUser= await User.findOne({
    //operators an be used:-
    $or:[{username},{email}]//it checks all the values together that're needed to be checked  
})

if(existedUser){
    throw new ApiError(409,"user with email or username already exits")
}

//the whole data comes in the req.body but as we've passed a middlleware in the routes, so we get the access to some more fields in the req.body as the middleware adds those fields in the routes
const avatarLocalPath=req.files?.avatar[0]?.path//the entire path of the file that multer has uploaded will be in this //we'll get the object of the 1st property via this
// const coverImageLocalPath=req.files?.coverImage[0]?.path


let coverImageLocalPath;//checking it properly as there may be issues if we use the ? optional syntax as in that case we're surely expecting that there will be surely the coverimage array inside of the file and considering that we're directly taking its path without checking if it's surely available or not:-

if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){//checking if coverimage is an array or not and if it's then its length is ?0 or not
    coverImageLocalPath=req.files.coverImage[0].path
}


if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")
}


//uploading the image to cloudinary:-
const avatar=await uploadOnCloudinary(avatarLocalPath)//it'll upload the image to cloudinary so here we're awaiting it until the further code gets executed


const coverImage=await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400,"avatar file is required")
}


//now if the avatar has been successfully uploaded on the cloudinary so upload it in the db:-user is the one who's talking to the db:-

const user=await User.create({
    //these are the keys that're to be added in the postman as well while testing 
    fullname,
    avatar: avatar.url,//sending only the url of the object that we're storing in the db
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
})



//check if user has been created if yes then remove password and refresh token from it:-
const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"//these 2 won't be in the response 
)

if(!createdUser){
    throw new ApiError(500,"something went wrong while registering user")
}


//sending response if the user is created:-
return res.status(201).json(
    //sending the data by making the class of the apiresponse that's sent:-
    new ApiResponse(200,createdUser,"registered successfully")
)


})




//now we've made the method and our next step is to create the routes as the main work of the nodejs is to run the method when it gets hit with some url so we create a folder with routes in which we'll keep all urls
export {registerUser}