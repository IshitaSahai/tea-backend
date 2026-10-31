//it's a very reusable code thatn can be used in many other projects 
//the goal of this file is that we've got the files via the file system ie. it has already been uploaded on the server, whichever service it'll use, it'll give the path of the local file to us ie. the files that've come on our server rn
//the path that we're following is:- files have come on the local server, now it'll (fs) give us the local path from the server and then we'll add the files on the cloudinary 
//if our file has been successfully uploaded on cloudinary then we can remove it from our local server as it's no longer needed 
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"//it's the file system, in node we get a file system, and we don't hv to import this library it comes with nodejs by default, it helps to read, write, remove the files and helps to do all the work like opendir,openpath, in syn/async  
//so when we need to manage the entire file system, then we use the file system "fs" :- if we wanna change the permission of any file, read the data of any file, open any file
//we mainly want the path of the files, and we'll easily get the file path
//unlink:-our file system works by linking and unlinking the files, if we delete any file then our file gets unlinked from the file system, the file remains there only but it gets unlinked from the file system  
//so we can delete the file if it has been uploaded successfully tp cloudinary by unlinking it 


    // Configuration:- it gives the permission to upload the files n all 
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above on cloudinary to copy your API secret
    });
    
//we'll create a method in which we'll give the path of the local file as a parameter and then we'll upload the file, if  it gets uploaded successfully then we'll unlink the file 
//there can be problems in these file tasks so we need to wrap them in the try catch or something 

    // Upload an image
     const uploadOnCloudinary = async(localFilePath)=>{//if we've got the localfilepath
        try {
            if(!localFilePath) return null//if we dont't hv path of file that we've on our local server then we'll return null otherwise we'll upload the file:-
            //upload the file on cloudinary if the path exists:-
            const response=await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"//which resource we're uploading (image,raw,videos etc)
            }
        )//we can also give many other options for upload 
        //file has been uploaded successfully :-
        //console.log("file has been uploaded successfully on cloudinary", response.url)//the public url after getting uploaded

        //unlinking the file as it's been uploaded on the cloudinary 
        fs.unlinkSync(localFilePath)
        return response//user gets a complete response and can take any data that they want from it 
        //if the file hasn't been uploaded/mistake in path:-
        } catch (error) {//2 cases:-if the file hasn't been uploaded successfully or there's any mistake in the localfilepath
           //if someone is using this cloudinary method then we can be sure that the file is on the server as we've the local file path but the problem is that it has not got uploaded, so we should remove the file from the server for a safe cleaning purpose otherwise so many malicious/corrupted files will remain on the server so we've an option to unlink on "Fs":-
           fs.unlinkSync(localFilePath)//removes the locally saved temporary file as the upload operation got failed 
           return null//just for the sake that the method returns properly 
        }
    }  

    const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId);

        return response;
    } catch (error) {
        console.log("Error deleting image from Cloudinary:", error);
        return null;
    }
};


export {uploadOnCloudinary, deleteFromCloudinary}