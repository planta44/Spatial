const cloudinary = require('cloudinary').v2;

const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const uploadBuffer = ({ buffer, folder, resourceType = 'auto', originalFilename }) =>
  new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true
    };

    if (originalFilename) {
      options.filename_override = originalFilename;
    }

    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });

    stream.end(buffer);
  });

module.exports = {
  cloudinary,
  cloudinaryEnabled,
  uploadBuffer
};
