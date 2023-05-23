import * as dotenv from "dotenv";
dotenv.config()
import multer from "multer";
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import crypto from "crypto";
import { resolve } from "path";


const s3Config = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials:{
       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
   }
})


const storageTypes = {
    local: multer.diskStorage({
        destination: resolve(__dirname, "..", "..", "./tmp/drink"),
        filename: (request, file, callback) => {
            const fileHash = crypto.randomBytes(16).toString("hex");
            const fileName = `${fileHash}-${file.originalname}`;
            return callback(null, fileName);
        },
    }),
    s3: multerS3({
        s3: s3Config,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (request, file, callback) => {
            const fileHash = crypto.randomBytes(16).toString("hex");
            const fileName = `${fileHash}-${file.originalname}`;
            return callback(null, fileName);
        },
    })
}

export default {
    upload() {
        return {
            storage: storageTypes['s3'],
            limits: { fieldSize: 10 * 1024 * 1024 } //10MB
        };
    },
};