import crypto from 'crypto';

export const sha256 = (data: crypto.BinaryLike) => {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(data);
  return hashSum.digest('hex');
};

