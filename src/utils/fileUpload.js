import multer from 'multer';

const FILE_MAX_MB = 4;

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const fileFilter = (req, file, cb) => {
  if (ACCEPTED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const fileTypes = ACCEPTED_FILE_TYPES.map(n => `.${n.split('/')[1]}`);
    cb(`Invalid file type. Allowed types: ${fileTypes.join(', ')}.`, false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * FILE_MAX_MB
  }
});

export const fileErrorHandler = (res, err) => {
  // Parse error.
  let msg;
  if (!err.code) {
    msg = err;
  } else {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        msg = `File is too large. Max size: ${FILE_MAX_MB}mb.`;
        break;

      default:
        msg = err.toString();
        break;
    }
  }
  res.status(400).json({ messages: [msg] });
};

export default upload;
