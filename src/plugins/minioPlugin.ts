import type { FastifyInstance } from 'fastify';
import Minio from 'minio';
import axios from 'axios';
import { getFileType, sha256 } from '../lib/util';

export const uploadUrlAsset = async (server: FastifyInstance, url: string) => {
  const client = server.minio as Minio.Client;
  const MINIO_BUCKET = server.config.MINIO_BUCKET as string;
  const asset = await axios.get(url, {responseType: 'arraybuffer'});
  const assetB64 = Buffer.from(asset.data, "base64");
  const sha = sha256(assetB64);
  const fileType = getFileType(url);
  console.log("FILE TYPE: " + fileType)
  const assetType = (fileType == "mp4") ? `video/${fileType}` : `image/${fileType}`;
  const metadata = {'Content-Type': assetType, 'SHA': sha};
  console.log(` --> Uploading ${url} to ${MINIO_BUCKET}/${sha}`);
  await client.putObject(MINIO_BUCKET, sha, assetB64, metadata);
  return sha
}

export const minioUrl = (server: FastifyInstance, sha: string) => {
  return `${server.config.MINIO_URL}/${server.config.MINIO_BUCKET}/${sha}`
}


export const registerMinio = async (fastify: FastifyInstance) => {
  try {
    let minio
    if (process.env.MINIO_PORT) {
      minio = new Minio.Client({
        endPoint: process.env.MINIO_URL as string,
        port: parseInt(process.env.MINIO_PORT as string),
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY as string,
        secretKey: process.env.MINIO_SECRET_KEY as string,
      });
    } else {
      minio = new Minio.Client({
        endPoint: process.env.MINIO_URL as string,
        accessKey: process.env.MINIO_ACCESS_KEY as string,
        secretKey: process.env.MINIO_SECRET_KEY as string,
      });
    }
    fastify.decorate('minio', minio);
    fastify.decorate('uploadUrlAsset', uploadUrlAsset);
    fastify.log.info('Successfully registered MinioPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Minio, error on register', err);
    console.error(err);
  }
};

declare module "fastify" {
  interface FastifyInstance {
    minio?: Minio.Client;
    uploadUrlAsset?: (server: FastifyInstance, url: string) => Promise<string>;
  }
}

export default registerMinio