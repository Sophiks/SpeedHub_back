import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadPhoto = upload.single('photo');

export const uploadQuestionsPhotos = upload.array('images', 5);

export const uploadToCloudinary = (fileBuffer, folder = 'speedhub_reviews') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: folder }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(fileBuffer);
  });
};
