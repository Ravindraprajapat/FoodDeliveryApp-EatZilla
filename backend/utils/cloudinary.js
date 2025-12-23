import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// ✅ Cloudinary config should be here (once only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    // Delete local file after upload
    fs.unlinkSync(localFilePath);

    return uploadResult.secure_url; // return URL
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    // Remove local file if upload failed
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export default uploadOnCloudinary;


// import { v2 as cloudinary } from 'cloudinary'
// import fs from "fs"
// const uploadOnCloudinary = async (file) =>{

//    cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// try{
//   const result = await cloudinary.uploader.upload(file)
//    fs.unlinkSync(file)
//    return result.secure_url
// }
// catch(error){
//     fs.unlinkSync(file)
//     console.log(error)
// }

// }


// export default uploadOnCloudinary