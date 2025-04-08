

import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory temporarily
  limits: { fileSize: 50 * 1024 * 1024 }, // Increased file size limit to 50MB for videos
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/avi",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only PDF, JPG, PNG, and video files (MP4, AVI, MOV) are allowed"
        )
      );
    }
    cb(null, true);
  },
});
