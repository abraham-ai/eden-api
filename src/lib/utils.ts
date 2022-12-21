import fs from 'fs';
import path from 'path'
import crypto from 'crypto';
import axios from 'axios';

export function randomUUID() {  
  return crypto.randomUUID();
}

export function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

export function writeFile(filename, content) {
  fs.writeFile(filename, content, function(error) {
    if (error) {
      return console.log(err);
    }
  });
}

export function writeJsonToFile(filename, text) {
  writeFile(filename, JSON.stringify(text));
} 

export function getFileType(filename) {
  let fileType = path.extname(filename).slice(1).toLowerCase();
  fileType = (fileType == 'jpg') ? 'jpeg' : fileType;
  return fileType;
}

export function getAllPropertiesValid(obj_canonical, obj) {
  let invalidKeys = Object.keys(obj).filter(e => !Object.keys(obj_canonical).includes(e));
  if (invalidKeys.length > 0) {
    console.log("Invalid keys: ", invalidKeys);
    return false;
  } else {
    return true;
  }
}

export function sha256(data) {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(data);
  return hashSum.digest('hex');
}