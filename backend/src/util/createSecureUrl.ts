import { v2 as cloudinary } from "cloudinary";

export const createSecureUrl = async (publicId:string,type:string) => {
  try {
    console.log("PUBLIC ID",publicId)
    const options = {
      resource_type: `${type}`,
      type: "upload", // Matches the upload type
      sign_url: true, // Ensures the URL is signed
      // secure: true, // U   se HTTPS
    };

    const signedUrl = cloudinary.url(publicId, options);

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
};
