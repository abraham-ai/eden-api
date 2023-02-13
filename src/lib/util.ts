import crypto from 'crypto';
import path from 'path';


export const sha256 = (data: crypto.BinaryLike) => {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(data);
  return hashSum.digest('hex');
};

export const getFileType = (filename: string) => {
  let fileType = path.extname(filename).slice(1).toLowerCase();
  return fileType;
};

export const getContentType = (fileType: string) => {
  fileType = fileType.toLowerCase();
  if (fileType == 'mp4') {
    return `video/${fileType}`;
  } else if (fileType == 'jpg') {
    return `image/jpeg`;
  } else if (fileType == 'png') {
    return `image/png`;
  } else if (fileType == 'txt') {
    return `text/plain`;
  } 
};