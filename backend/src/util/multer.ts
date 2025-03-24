import multer from "multer";



export const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory temporarily
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (matches frontend)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF, JPG, and PNG files are allowed"));
    }
    cb(null, true);
  },
});
