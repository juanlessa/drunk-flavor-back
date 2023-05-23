import * as dotenv from "dotenv";
dotenv.config()
import { S3, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";

const s3Config = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials:{
       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
   }
})


export const deleteFile = async (fileName: string): Promise<void> => {
    if(process.env.STORAGE_TYPE==='local'){
        fileName = `./tmp/drink/${fileName}`
        try {
            await fs.promises.stat(fileName);
        } catch {
            return;
        }
    
        await fs.promises.unlink(fileName);
        return;
    }
    const s3 = new S3(s3Config);
    try {
        console.log('file name ',fileName);
        
        await s3.headObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
        })
    } catch(error) {
        console.error('find file error');
        console.error(error);
        
        return;
    }
    await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName
    })
};