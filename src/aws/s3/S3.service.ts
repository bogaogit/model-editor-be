import { Injectable } from "@nestjs/common";
import fs from "fs";
import { S3 } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
  constructor() {
  }

  uploadToS3(dirPath: string, fileName: string) {
    // S3 Bucket Name
    const S3_BUCKET = "model-editor-bucket";

    // S3 Region
    const REGION = "ap-southeast-2";
    const filePath = `${dirPath}/${fileName}`;

    // S3 Credentials
    // AWS.config.update({
    //     accessKeyId: "AKIA6NWBO65KHMG6VEUV",
    //     secretAccessKey: "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",
    // });
    const credentials = {
      accessKeyId: "AKIA6NWBO65KHMG6VEUV",
      secretAccessKey: "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"
    };

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
}
