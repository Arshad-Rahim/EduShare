// this code is for creating secure url for the cloudinary


// import { v2 as cloudinary } from "cloudinary";

// export const createSecureUrl = async (publicId:string,type:string) => {
//   try {
//     console.log("PUBLIC ID",publicId)
//     const options = {
//       resource_type: `${type}`,
//       type: "upload", // Matches the upload type
//       sign_url: true, // Ensures the URL is signed
//       // secure: true, // U   se HTTPS
//     };

//     const signedUrl = cloudinary.url(publicId, options);

//     return signedUrl;
//   } catch (error) {
//     console.error("Error generating signed URL:", error);
//     throw new Error("Failed to generate signed URL");
//   }
// };


// this code is for create the secure url for the s3 bucket

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../app";

// Updated: Function to generate a signed URL for S3 objects
export const createSecureUrl = async (
  key: string,
  type: "image" | "video"
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: key,
    });

    // Generate a signed URL that expires in 1 hour (3600 seconds)
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error("Error generating S3 signed URL:", error);
    throw new Error("Failed to generate secure URL");
  }
};