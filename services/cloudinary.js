import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    console.log("Uploading file to Cloudinary:", localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "Internship Test",
    });

    if (!response) {
      console.error("Error in uploading image to Cloudinary.");
      return null;
    }

    console.log("Image uploaded successfully:", response.secure_url);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("Temp file deleted:", localFilePath);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("Temp file deleted after error:", localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
