import { asyncHandler } from "../utils/asyncHandler.js";

//zsync handler is a higher order function that accepts a function
const registerUser=asyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"ok"//here we've sent the http status code as 200 and sent the json response with it just like we were sending html
    })
})

//now we've made the method and our next step is to create the routes as the main work of the nodejs is to run the method when it gets hit with some url so we create a folder with routes in which we'll keep all urls
export {registerUser}