const ApiResponse={
    constructor(statusCode,data,message="success"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode<400//it should be <400
    }
}

//statuscodes are tof servers:- in order to read more:-https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
