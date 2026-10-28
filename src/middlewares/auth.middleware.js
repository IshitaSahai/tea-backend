//this middleware will verify if the user exists or not:

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; 

export const verifyJWT=asyncHandler(async(req,_,next)=>{//if the response isn't getting used then we can use _
    //taking the access of the token as the req already has the access of the cookie:-
    //there may not be any access of the accessToken in the cookies as in the case of mobile application so in that case the custom header may be sent by the user:-usually the header that we use is thhe authorization header 
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")//means if we get the token with "Bearer " then that'll be replaced by the empty space and we'll get only the token value instead of getting this full value including the Bearer as well as the space(" ") ie. "Bearer "
        console.log(token)
    
        if(!token){
            throw new ApiError(401,"unauthorized request")
        }
    
        //if we hv the token, we'll check using jwt if the token is correct or not and what all info is in it:-
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)//checking if the token that we've got is same as that of the original token in the .env file
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"invalid access token")
        }
    
        //if the user is surely present then:-adding a new object inside the request 
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")//the value that's truthy is returned, eg:-if error.message!=null/undefined then it's returned otherwise the other value is returned
    }
    

})