import mongoose, {Schema} from "mongoose";//we're importing shema as well so that we can use the schema directly instead of doing mongoose.schema everytime
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true,//in order to make any field searcheable in an optimised manner, set its index to true, it becomes a little expensive but if we know that we're gonna use it for the searching a lot then we can set the index to true so that it starts to come in the db searching  //in order to enable searching field on any field then set its index to true 

        //we shouldn't set index:true in every field otherwise the performance degrades a lot
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String,//we'll be using the cloudnary url:- it's an aws service where we upload the images, files and videos and it gives us the url 
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[//it's an array as we keep on adding multiple values of the ids in it u
        {//we're adding the types/the properties of the values that we;ll be adding in this array:-
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],//this field alone makes our project very complex and next level so we need to install a special package for this purpose ie. mongoose-aggregate-paginate-v2:- it allows us to write the aggregation queries, true power of mongodb in the production comes from this (https://www.npmjs.com/package/mongoose-aggregate-paginate-v2,https://www.mongodb.com/docs/manual/core/aggregation-pipeline/)
    password:{
        type:String,//it's string as whenever we're keeping the password in the db, keep it by encrypting, the challenge here is that if we've kept the password by encrypting it and we're entering the actual password at the password field then how r we gonna match it with the original password . we need to solve this challenge:-
        required:[true,"Password is required"],//custom error msg slong with true field can be given
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true})//via timestamps, we get createdAt and updatedAt 

//password and token things explanation:-
//now after importing both bcrypt and jsonwebtoken we need to see how to encrypt everything:- direct encryptinon isn't possible so we take the help of the hooks n all pf mongoose (https://mongoosejs.com/docs/middleware.html#pre)
//pre hook:-if any uer has written any call/controller to save any data then just before that we can make this hook run ie. it helps to encrypt 
userSchema.pre("save",async function(){//encryption n all is a time taking process so we should use async await and as it's a middleware so we must use next:-  
    //the work that we wanna do is that whenever our all fields r getting saved take the password from it and save it by encrypting
    if(!this.isModified("password")) return;

    //bcrypt does a lot of work behind the scenes 
    this.password=await bcrypt.hash(this.password,10);//takes 2 parameters:- what to hash and how many rounds of hashing rounds to take 
    //we need to make sure that it runs only when there's a modification in the password field and if there's no change in the password and only the other fields have changed then there's no need to do the encryption  

})//these hooks are similar to app.listen, app.on(error)



//we need to make some custom methods in it so that when we import the user, we can check that the password that has been encrypted is correct or not as the password that we've saved is encryped but what the user will send outside will be just the actual password :-
userSchema.methods.isPasswordCorrect=async function(password){
    //bcrypt can also check password:-
    //tells in true or false if the password got matched or not:-
    return await bcrypt.compare(password, this.password)//2 oarameters:-data in the string, and the encrypted password
    //the encrypted password can be accessed via this as we're making the method using userschema that contains the password and just like pre has the access to the access of the objects both before and after storing in the db:-

}

userSchema.methods.generateAccessToken=function(){//it returns the access token of jwt as soon as it's created 
    return jwt.sign(
        {//giving payload:- the info that we want it to store:-
            //this method is already saved in the db and 'this' has the access to all 
            _id:this._id,//we'll get from mongodb
            //we can get access to all others using the db query so if we don't want to store others then we can ignore them:-
            email:this.email,
            username:this.username,
            fullname:this.fullname//left one before : is the name/key of the payload and right one after this is the one coming from the db 
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken= function(){//it has less info as it keeps on refreshing 
    return jwt.sign(
        {//giving payload:- the info that we want it to store:-
            //this method is already saved in the db and 'this' has the access to all 
            _id:this._id,//we'll get from mongodb
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
//both r jwt token and only differ in their usage and nothing else at all

//we can decide before which events can we use this hook 
//after that we need to give a callback but the arrow function doesn't have the access to the context 

export const User=mongoose.model("User",userSchema)

//packages:-
//bcrypt:- package of core nodejs library (https://www.npmjs.com/package/bcrypt)
//bcryptjs:- optimized js with 0 dependency and compaptible to bcrypt (https://www.npmjs.com/package/bcryptjs)
// almost both have the same functionality so amyone can be used 

//bcrypt:-helps to hash the password so our problem of storing password gets resolved ie. we can't keep the clear text password and if the passwords are getting encrypted then we need to decrypt them as well all that gets resolved via the password 

//library for the token- jwt (json web token) both bcrypt and token are based on cryptography 

//to see the tokens:-https://www.jwt.io/
//3 parts of the tokens:- headers: they're automatically injected, main role is of the payload: it's a fancy name for the data that we wanna send(userid,email) automatically gets encrypted in payload 

//verification signature:-good cryptographic algorithm
//secret:-secret is the thing that makes the token unique and it protects everything


//EXPLANATION ABT JWT:- jwt is a bearer token:- it means whoever bears it that's considered correct ie. whoever will be sending us this token we'll send the data to them, it's like a key
//the library jwt automatically gives us the tokens but we'll need to hv some things like variables n all for that 
//it's usually written in .env by generating sone very complex strings they can be generated using any algo like sha-256 etc in the production these strings should be used but here we can use anything like 231 or any random text 
// REFRESH_TOKEN_EXPIRY has more duration than ACCESS_TOKEN_EXPIRY

//we're using both session and cookies and using very much security but the access token won't be stored in db unlike refresh token