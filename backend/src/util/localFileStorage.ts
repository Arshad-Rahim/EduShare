import crypto from "crypto";
import fs from "fs";
import path from "path";

const getUploadRoot = () => {
  return path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR || "uploads");
};

const normalizeKey = (key: string) => {
  return key.replace(/\\/g, "/").replace(/^\/+/, "");
};

const getSafeExtension = (originalName?: string, mimetype?: string) => {
  const originalExtension = path.extname(originalName || "").toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  const mimeExtension = mimetype?.split("/")[1];

  if (!mimeExtension) {
    return "";
  }

  if (mimeExtension === "jpeg") return ".jpg";
  if (mimeExtension === "quicktime") return ".mov";

  return `.${mimeExtension}`;
};

const createStorageKey = (
  folder: string,
  prefix: string,
  originalName?: string,
  mimetype?: string
) => {
  const safeFolder = normalizeKey(folder).replace(/\.\./g, "");
  const safePrefix = String(prefix || "file").replace(/[^a-zA-Z0-9-_]/g, "_");
  const extension = getSafeExtension(originalName, mimetype);
  const uniqueName = `${safePrefix}-${Date.now()}-${crypto
    .randomBytes(6)
    .toString("hex")}${extension}`;

  return normalizeKey(path.posix.join(safeFolder, uniqueName));
};

export const saveUploadedFileLocally = async (
  file: Express.Multer.File,
  folder: string,
  prefix: string
): Promise<string> => {
  const key = createStorageKey(
    folder,
    prefix,
    file.originalname,
    file.mimetype
  );

  const destination = path.join(getUploadRoot(), key);

  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.writeFile(destination, file.buffer);

  return key;
};

export const saveBufferLocally = async (
  buffer: Buffer,
  mimetype: string,
  originalName: string,
  folder: string,
  prefix: string
): Promise<string> => {
  const key = createStorageKey(folder, prefix, originalName, mimetype);
  const destination = path.join(getUploadRoot(), key);

  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.writeFile(destination, buffer);

  return key;
};

export const resolveLocalFileUrl = (key: string): string => {
  if (!key) return "";

  if (/^https?:\/\//i.test(key)) {
    return key;
  }

  const baseUrl = (
    process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
  ).replace(/\/+$/, "");

  const cleanKey = normalizeKey(key);

  if (cleanKey.startsWith("uploads/")) {
    return `${baseUrl}/${cleanKey}`;
  }

  return `${baseUrl}/uploads/${cleanKey}`;
};