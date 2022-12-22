import crypto from 'crypto';
import path from 'path';

export const sha256 = (data: crypto.BinaryLike) => {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(data);
  return hashSum.digest('hex');
}

export const getFileType = (filename: string) => {
  let fileType = path.extname(filename).slice(1).toLowerCase();
  fileType = (fileType == 'jpg') ? 'jpeg' : fileType;
  return fileType;
}