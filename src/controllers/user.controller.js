import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken";
import { use } from "react";


//method to generate access and refresh tokens:-
const generateAccessAndRefreshTokens=async(userid)=>{
    try {
        const user=await User.findById(userid)//find the user in order to generate its token
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        //we give the access token to the user but we store the refresh token in the db as well so that we don't hv to ask the password to the user again n again :-
        //user contains all the properties and contains everything including refreshtoken as well and user is an object so we can easily add the refreshtoken in it:-
        user.refreshToken=refreshToken
        //saving the user:-
        //no need to store this method in any db as it just has to be done 
        await user.save({validateBeforeSave:false})//while saving the mongoose models kick-in which means that all the required fields will be required to be entered in order to even save the model but here we're not having any password to save so we use this method so that it doesn't check for all the required fields and we can save only whichever fields we need to save:-


        //now we've saved refresh token in the db but we still hv their reference, so we can return those methods:-
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}



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

const loginUser=asyncHandler(async(req,res)=>{
    //steps/todos for login of a user:-
    //1. take data from the user using req.body
    //login can be done via username/email
    //2. validate the data if it's correct or not(non empty etc validity)
    //3. check if the user already exists if not then redirect to register page/ask to register first 
    //if the user DNE then tell the request to login that the user DNE 
    //4. if the user exists then match their password and if it doesn't match then tell pass is wrong else give them the access to the application and generate and give them the access to all the refresh/access tokens etc  
    //send these tokens in the form of secure cookies and send the response that the login has been done successfully 

    const {email,username,password}=req.body
    console.log(email)

    if(!username && !email){//if both aren't present 
        //if we need to write for either email or password:- !(email || password)
        throw new ApiError(400,"username or password is required")
    }

    //if both/anyone of them exists:-find the user in the db of either username/email or both:-
    const user=await User.findOne({//$and,$comment,$or,$nor etc r all the mongodb operators:- they can be used to get if either of the username or the email exists:-
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user doesn't exist")
    }

    //if user exists check pass:-User is the object of mongodb here, so we shouldn't find the methods here via User, instead we should use user to find the methods:-findOne, updateOne etc methodds are the ones that're available via mongoose of the mongodb 
    //all the methods that we've defined in the user.model are the ones that're available in the user 
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"invalid user credentials")
    }

    //make access and refresh tokens if pass is correct:-
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    //now we've both refresh and access tokens nd now we need to send them to the cookies:-

    //we've the access of the refreshtoken at a different place than that of the user reference that we're having and that's empty as we took the access of the refrehs token of the user differently and the refresh token that we're having the access is in different variables afterwards :-
    //so we can either update the token in the user via object or we can directly make anpther db query, we need to perform the operations as per our own thinking by properly knowing if it's an expensive operation for us to make the db query or to update via the object:-
    //we're updating in the db:-
    //this variable contains all the fields that we need to send  
    const loggedInUser=await User.findById(user._id).
    select("-password -refreshToken")

    //now we need to send the cookies and in order to do so we need to design some options for cookies:-
    const options={
        httpOnly:true,
        secure:true
    }//by default anyone can modify our cookies at the frontend but as soon as we set httpOnly and secure as true then the cookies become modifiable only via the server and we can't modify it via frontend
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(//we're sending the refresh token and access token here as we're handling the case when the user is trying to save the refrehs and access token on their own (they may be saving it in their local storage due to some reason or maybe they're developing a  mobile appplication in which the cookie won't be set) 
        new ApiResponse(
            200,//statuscode
            {//data as an object
                user:loggedInUser,accessToken,refreshToken
            },
            "user logged in successfully"//message
        )
    )
})


const logoutUser=asyncHandler(async(req,res)=>{
    //we'll remove the cookies and then also update the refresh token of the user:-
    //we can use the middlewares in order to get the id of the user that's logged in
    //now as the middleware has already been executed, so we've the access of the req.user in this 
    //we were logged in and already had the access token, a query wa made from the db based on the access token and added the the req.user there:-
    // req.user._id
    await User.findByIdAndUpdate(
        req.user._id,//find the user
        {//what fields to update
            $set:{//using mongodb operator:-
                refreshToken:undefined
            }
        },
        {
            new:true//returned response will give the new updated value otherwise it may give the old value along with refreshtoken
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)    
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out successfully"))
})

//now we've made the method and our next step is to create the routes as the main work of the nodejs is to run the method when it gets hit with some url so we create a folder with routes in which we'll keep all urls


//WE'LL MAKE THE CONTROLLER TO MAKE AN ENDPOINT FOR REFRESHING THE ACCESS TOKEN:-
const refreshAccessToken=asyncHandler(async(req,res)=>{
    //we can get the access token refreshed by sending the refresh token to the db and we can access that refresh token via cookies if anyone is hitting that endpoint 

    //this is the refresh token that we're fetching from the user's end ie. it's not the one that's stored in our db, it's the one that the user is having on their side that's y we've kept the name as incoming refresh token which means that the token is coming from the user's end via cookies and it isn't the token from our db:-
    const incomingRefreshToken=req.cookie.refreshToken || req.body.refreshToken//in case if someone is using the mobile application then we may get the cookies via body

    if(!incomingRefreshToken){
        //this apierror is the error response only that we're sending, as if our application isn't performing well/there's some problem in it then it's better to get the apierror like this instead of getting the fake api response of 200 even when our application isn't performing as it's desired/is producing some undesired outcomes:-
        throw new ApiError(401,"unauthorised request")//as our token isn't correct so we're saying it's an unauthorized request
    }

    //now we'll also need to verify the incoming token:-via jwt.verify, we get the raw token that we've stored in the db, the token that the user gets is an encrypted token so via this jwt.verify, we get the decoded form encrypted token that's with the user so that we can directly match it with the token that's stored in our db:- 
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        //as while generating the refreshtoken in the user.model, we entered only the _id, so we'd be having the access of that id with us, so we can take the information of the user by asking a query to the mongodb:-
        const user= await User.findById(decodedToken?._id)//via User here, we're accessing the id from the db whose schema we've made in our user.model
    
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
    
        //now while making the method, generateAccessAndRefreshTokens, we also saved the refresh token ie. the encoded(encrypted) token in the user so we need to match the incoming refresh token that the user is sending us and the token that's with the user whom we've founded by decoding the incoming refresh token from the user:-
    
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used")
        }
    
        //if the tokens match then we can make the new token and give it to the user:-
        const options={//as we're sending the token in the cookies
            httpOnly:true,
            secure:true
        }
    
        //generating new tokens:-
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(200),
            {accessToken,refreshToken:newRefreshToken},
            "access token refreshed successfully"
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }   
})  


const changeCurrentPassword=asyncHandler(async(req,res)=>{
    //WE WANNA MAKE THE USER TO CHANGE CURRENT PASSWORD VIA THIS:-
    //our headache isn't to check if the user is loggedin or not as we've the middleware verifyjwt via which we'll check it for us when we'll be making the route:-
    const {oldPassword,newPassword}=req.body//user needs to enter the old password in order to change it to the new one 
    //finding the old user as we'll need the user to verify the password by going in the user's password field:-
    //if the user is able to change their password it means that the user is logged in and if the user is logged in they may hv gone via the auth middleware during logging in and the auth middleware does the work of storing user in the req.user so we can get user id from there:-
    const user=await User.findById(req.user?._id)
    //checking the password is correct or not:-
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
    }
    //if the old password is correct:-
    user.password=newPassword
    //saving password in order to call the hook:-
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed successfully"))
})


//we need to make an endpoint to get the current user:-
//it's a simple task as if the user is logged in then we can directly get the access of the user as req.user=user in the middleware that has been inserted:-
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,res.user,"current user fetched successfully")
})


//we're allowing the password to get updated as there's usually a separate page for the password and we can change it as per the no of times we're allowing to change the password
//it's the same as we can't change the username any no of times in some use cases so we need to allow all the changes at the backend as per our use case

const updatetAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body
    //ADVICE:- IF ANY FILE IS TO BE UPDATED THEN ITS ENDPOINTS SHOULD BE KEPT DIFFERENTLY AS IT'S A BETTER APPROACH AS IF THE USER ONLY WANTS TO UPDATE THEIR IMAGE THEN THEY CAN DO ONLY THAT, WE CAN GIVE THE IMAGE UPDATE AND SAVE OPTION TO THE USER DIRECTLY THERE ONLY 
    //IF WE SAVE THE WHOLE OF THE ACCOUNT DATA AGAIN THEN THE TEXT DATA GOES AGAIN N AGAIN SO THE CONGESTION IN THE NETWORK GETS INCREASED
    if(!fullname || !email){
        throw new ApiError(400,"all fields are required")
    }

    //sending the info to update both the email and username:-
    const user=User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                // email:email,
                email,//we can use only 1 value instead of key val pair if our both the values r same like above
            }
        },
        {new:true}//via this parameter, the upadted info will be returned
    ).select("-password")//in case of changing the password, we just took the filed and updated it and then ran .save method as we were also needed to call the hook there but here, we don't need to call any hook so we can directly use the findByIdAndUpdate method

    return res
    .status(200)
    .json(new ApiResponse(200,user,"account details updated successfully"))

})


//updating files:-we need to use 1. multer middleware to accept the files, and 2. auth middleware in order to check if user is logged in as only the logged in users can update the files, so we'll need to take care of this while doing routing:-
const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path//as we need only one file here so we don't need to use the .files method here
    //if we don't wanna use cloudinary n all then we can directly save this in our db without using cloudinary n all
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is missing")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading an avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar updated successfully"))
})


const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path//as we need only one file here so we don't need to use the .files method here
    //if we don't wanna use cloudinary n all then we can directly save this in our db without using cloudinary n all
    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file is missing")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"error while uploading coverImage")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                CoverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover image updated successfully"))

})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateUserAvatar,
    updateUserCoverImage
}