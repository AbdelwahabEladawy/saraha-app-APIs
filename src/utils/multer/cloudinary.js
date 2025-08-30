import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

export const cloudConfig = () => {
  const cfg = {
    cloud_name: (process.env.CLOUD_NAME || '').trim(),
    api_key: (process.env.API_KEY || '').trim(),
    api_secret: (process.env.API_SECRET || '').trim(),
    secure: true
  };

  console.log('Cloudinary config:', {
    cloud_name: cfg.cloud_name,
    api_key: cfg.api_key,
    secret_len: cfg.api_secret.length
  });

  cloudinary.config(cfg);
  return cloudinary;
};
