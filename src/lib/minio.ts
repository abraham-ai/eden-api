import Minio from 'minio';

export const minio = new Minio.Client({
  endPoint: process.env.MINIO_URL as string,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
});