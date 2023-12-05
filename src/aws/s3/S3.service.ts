import { Injectable } from "@nestjs/common";
import fs from "fs";
import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// S3 Bucket Name
const S3_BUCKET = "model-editor-bucket";

// S3 Region
const REGION = "ap-southeast-2";

const credentials = {
  accessKeyId: "AKIA6NWBO65KHMG6VEUV",
  secretAccessKey: "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"
};

@Injectable()
export class S3Service {


  constructor() {
  }

  uploadToS3(dirPath: string, fileName: string) {
    const filePath = `${dirPath}/${fileName}`;

    //@ts-ignore
    const s3 = new S3({
      region: REGION,
      credentials: credentials
    });

    // Files Parameters
    const params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: fs.createReadStream(filePath)
    };

    // Uploading file to s3

    const upload = s3
      .putObject(params);

    // await upload.then((err, data) => {
    //     console.log(err);
    //     // File successfully uploaded
    //     // alert("File uploaded successfully.");
    // });
  }

  async downloadFromS3(s3FileName: string, dirPath: string, saveToFileName: string) {
    //@ts-ignore
    const s3Client = new S3({
      region: REGION,
      credentials: credentials
    });

    const getObjectCommand = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3FileName,
    });

    const filePath = `${dirPath}/${saveToFileName}`;

    try {
      const response = await s3Client.send(getObjectCommand);
      //@ts-ignore
      const readableStream = Readable.from(response.Body);

      const writeStream = fs.createWriteStream(filePath);
      readableStream.pipe(writeStream);

      return new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });
    } catch (error) {
      console.error("Error reading JSON file from S3:", error);
      throw error;
    }
  }
}
