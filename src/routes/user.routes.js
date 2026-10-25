//we'll make the router and export it
import { Router } from 'express'
import { registerUser } from '../controllers/user.controller.js'
//we'll do the import like this by using {} when we're also exporting in the same way only 

const router=Router()
//just like we made the app with express, //we're making the router with router

router.route("/register").post(registerUser)//this method is in the controllers folder, on calling the /register the register method will be called 
// router.route("/login").post(login)

export default router//if we're exporting by using default then only we can give any desired name in the app.js file


