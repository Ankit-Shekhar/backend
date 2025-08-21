//uploading files to cloudinary server through "localFilePath" provided to us by Multer

import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// this config gives permission to user to upload their files by checking their name , key and secret
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {

            // auto detect which type of file is being uploaded
            resource_type: "auto"
        })
        //file has been added successfully

        console.log("File is uploaded on Cloudinary", response.url);
        //once the file is successfully uploaded it must be unlinked as well
        fs.unlinkSync(localFilePath)
        return response;


    } catch (error) {
        //remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        return null;
    }
}
export { uploadOnCloudinary }