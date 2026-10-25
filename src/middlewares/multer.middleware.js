import multer from "multer"
//in order to understand how multer works we can read the documentation:-https://github.com/expressjs/multer

//it's k/a a middleware as this work takes place in between the request url and the task that's to be performed eg:-here upload.single('avatar') is the middleware work
// app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
// })
// so, we received a request on the profile ie. a route and we directly uploaded it as a middleware and then we wrote the method/controller ie. the work that's to be performed  but here we're doing all the work of this middle in a separate file as we wanna keep it separate 

//in order to save the file we should save it in the disk storage as if we store it in the memory then the memory will get filled up 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {//req is the request that we're getting from the user and we get the json data n all from the body in the request, file is with the multer and we get all the files in it ad multer is used bcoz of this file only as we configure json data n everything in the request body of the express but we don't hv the file there so multer or the express file upload is used so that we get one more option in between so that we can use the file
    //cb here is the callback that we usually do by putting the parenthesis/arrow function
    cb(null, "./public/temp")//the 1st parameter of the callback is for the errors that's set to null to indicate that we don't wanna handle any error rn and then we give the destination of the folder where we wanna keep all the files // './' means in the same directory, we wanna keep all our files inside the public folder that contains the temp folder that'll contain all the files and it also has .gitkeep as it's something that has to be present needs to be tracked even if it's empty 
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname)// in order to save the file, we'll take the original name of the file that the user has entered
      //it's not a good thing to do as the user may enter the multipke files with the same name so it may overwrite the files but as the operation is gonna be for a very small time on our server ie. the file will come on our server just for some time till it's uploaded to the cloudinary and then we'll delete it so it's not a problem to save the file with the same name that the user has entered 
  }
})//from this storage function we'll get the filename so the whole problem of the path is resolved here as the multer will return the entire local path file name 

export const upload=multer({
    storage,
})
//we've made a method with the name: storage which is a middleware and we've done the configuration 