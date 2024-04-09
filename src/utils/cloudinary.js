import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// method to upload file -- param: local file path || if successfully uploaded, unlink the file.
const uploadOnCloudinary = async ( localFilePath ) => {
    try {
        if (!localFilePath) return `FILE NOT FOUND IN GIVEN PATH.`
        
        // uploading file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"  // to understand what type of file is going to upload
        })

        // if file is uploaded successfully
        // console.log(`File has been successfully uploaded to cloudinary. URL :: ${response.url}`);
        
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);  // removes the file stored in our db
        return null;
    }
};


export { uploadOnCloudinary };