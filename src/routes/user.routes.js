//we'll make the router and export it
import { Router } from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'
//we'll do the import like this by using {} when we're also exporting in the same way only 
import {upload} from '../middlewares/multer.middleware.js'
//the thing is how to use the upload now, middleware is something that gets executed at the middle ie. meet me while going at the destination 

import {verifyJWT} from '../middlewares/auth.middleware.js'


const router=Router()
//just like we made the app with express, //we're making the router with router


//now when any request is made at the /register route then this  registerUser method gets executed but we want the middleware to be inserted before this method 
router.route("/register").post(
    //for inserting a middleware, insert it just before the method that has to be executed after sending the request at the route/url given
    upload.fields([//.fields takes an array and Returns middleware that processes multiple files associated with the given form fields.
        {
            name:"avatar",//we'll take the first file with the name avatar so when the frontend field will be made then there also the field for that file needs to be created with the name avatar
            maxCount:1 
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),//we can't use .array as it takes many files in a single field and also .single gives a single file, as we need multiple files so we'll use .fields 
    registerUser
)//this method is in the controllers folder, on calling the /register the register method will be called 
// router.route("/login").post(login)


router.route("/login").post(loginUser)

//secured routes:-
router.route("/logout").post(verifyJWT,logoutUser)

//we're making the endpoint of the refresh token here:-
router.route("/refresh-token").post(refreshToken)//as we've done all the decode token work in the controller so we don't need this verifyJWT MIDDLEWARE 



//now for checking the validation, we'll go to the controllers file for checking it 

export default router//if we're exporting by using default then only we can give any desired name in the app.js file


