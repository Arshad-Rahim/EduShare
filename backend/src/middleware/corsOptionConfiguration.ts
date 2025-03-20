export const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};