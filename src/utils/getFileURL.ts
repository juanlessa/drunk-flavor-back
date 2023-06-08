import * as dotenv from "dotenv";
dotenv.config()


export const getFileURL = (fileName: string): string => {
    if(process.env.STORAGE_TYPE==='local'){
        fileName = `${process.env.APP_HOST}:${process.env.APP_PORT}/files/${fileName}`
    }else{
        fileName = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${fileName}`
    }
    return fileName
};