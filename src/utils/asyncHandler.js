//CODE IN THE FORM OF THE PROMISES:-
const asyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))//executing the fn taken as a parameter
        .reject((err)=>next(err))//moving to the next function if the error comes 
    }
}


export {asyncHandler}



//try catch:-
//this is a higher order fn that can accept a fn as a parameter as well and also can return it as a variable 
//firstly the fn is accepted and then it's passed in another fn ie.:-
// const asyncHandler=(fn)=>{()=>{}}
//ie. the funciton that we've taken as an argument is further executed in the form of the arrow function, order to make it async function we write async in front of the arrow function:-
// const asyncHandler=(fn)=>async()=>{}

//we extract the req,res,next from the function that we've passed as the argument:-
//we're putting a wrapper of async and try catch around every funciton that we take in the argument 
// const asyncHandler=(requestHandler)=>async(req,res,next)=>{
//     try{
//         await requestHandler(req,res,next)
//     }catch(err){   
//         res.status(err.code || 500).json({
//             success:false,//so that it's easy for the frontend handling
//             message: err.message//
//         })//another way of handling error 
//     }
// }



//we need to standardize both teh code of the api response as well as the error 
//study for it:-http://nodejs.org/api/errors.html