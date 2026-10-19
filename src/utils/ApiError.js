class ApiError extends Error{//making class to modify the functions of the Error class so that we can use as per we want:-
    //we're making our own constructor to overwrite:-
    constructor(
        statusCode,
        message="something went wrong",//default msg
        errors=[],
        stack=""
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false//message will go but the success flag along with the msg will be false if someone is detecting it
        this.errors=errors


        if(stack){//sometimes the files of api errors is too long that's handled in a stack trace that where's the problem in the file
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)//we've passedd the instance in teh stack trace that what're we talking abt
        }
    }
}

export {ApiError}


//now we can't make the response file in a similar way as the errors can be traced in the node.js but the work of req,res that we're doing is not in core node.js we've used framework express for it but express doesn't give us anything but we can make our own class for the response so that the process becomes streamlined