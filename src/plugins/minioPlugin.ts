import type { FastifyInstance } from 'fastify';
import Minio from 'minio';
import axios from 'axios';
import { getFileType, sha256 } from '@/lib/util';

export const uploadUrlAsset = async (server: FastifyInstance, url: string) => {
  const client = server.minio as Minio.Client;
  const MINIO_BUCKET = server.config.MINIO_BUCKET as string;
  const asset = await axios.get(url, {responseType: 'arraybuffer'});
  const assetB64 = Buffer.from(asset.data, "base64");
  const sha = sha256(assetB64);
  const fileType = getFileType(url);
  const assetType = (fileType == "mp4") ? `video/${fileType}` : `image/${fileType}`;
  const metadata = {'Content-Type': assetType, 'SHA': sha};
  console.log(` --> Uploading ${url} to ${MINIO_BUCKET}/${sha}`);
  await client.putObject(MINIO_BUCKET, sha, assetB64, metadata);
  return sha
}


export const registerReplicate = async (fastify: FastifyInstance) => {
  try {
    const minio = new Minio.Client({
      endPoint: process.env.MINIO_URL as string,
      accessKey: process.env.MINIO_ACCESS_KEY as string,
      secretKey: process.env.MINIO_SECRET_KEY as string,
    });
    fastify.decorate('minio', minio);
    fastify.decorate('uploadUrlAsset', uploadUrlAsset);
    fastify.log.info('Successfully registered MinioPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Minio, error on register', err);
  }
};

declare module "fastify" {
  interface FastifyInstance {
    minio?: Minio.Client;
    uploadUrlAsset?: (server: FastifyInstance, url: string) => Promise<string>;
  }
}

export default registerReplicate