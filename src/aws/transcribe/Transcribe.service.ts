import { Injectable } from "@nestjs/common";
import { promises as fsPromises } from "fs";
import { S3 } from "@aws-sdk/client-s3";
import {
  GetTranscriptionJobCommand,
  LanguageCode,
  StartTranscriptionJobCommand,
  TranscribeClient
} from "@aws-sdk/client-transcribe";
import { DirectoryUtils } from "../../utils/Directory.utils";
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from "../s3/S3.service";
@Injectable()
export class TranscribeService {
  constructor(
    private s3Service: S3Service
  ) {
  }

  async createTranscribeJob(fileName: string, saveToFile: string) {
    const S3_BUCKET = "model-editor-bucket";

    const REGION = "ap-southeast-2";
    const credentials = {
      accessKeyId: "AKIA6NWBO65KHMG6VEUV",
      secretAccessKey: "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"
    };

    //@ts-ignore
    const s3 = new S3({
      region: REGION,
      credentials: credentials
    });

    //@ts-ignore
    const transcribeClient = new TranscribeClient({
      region: REGION,
      credentials: credentials
    });

    const transcribeJobName = `${fileName.replaceAll(" ", "_")}-${uuidv4()}-transcript`

    const startTranscriptionParams = {
      TranscriptionJobName: transcribeJobName,
      Media: {
        "MediaFileUri": `s3://${S3_BUCKET}/${fileName}.wav`
      },
      OutputBucketName: S3_BUCKET,
      IdentifyLanguage: true
    };

    // await transcribeClient.send(
    //   new StartTranscriptionJobCommand(transJobParams)
    // );

    const startTranscriptionCommand = new StartTranscriptionJobCommand(startTranscriptionParams);
    const { TranscriptionJob } = await transcribeClient.send(startTranscriptionCommand);

    const getTranscriptionParams = {
      TranscriptionJobName: TranscriptionJob.TranscriptionJobName,
    };

    while (true) {
      const getTranscriptionCommand = new GetTranscriptionJobCommand(getTranscriptionParams);
      const { TranscriptionJob: { TranscriptionJobStatus, Transcript } } = await transcribeClient.send(getTranscriptionCommand);

      if (TranscriptionJobStatus === "COMPLETED") {
        const outputFolderPath = `uploads/converted/${fileName}/transcript`;
        DirectoryUtils.createPathRecursively(outputFolderPath);

        await this.s3Service.downloadFromS3(`${transcribeJobName}.json`, outputFolderPath, `${fileName}.json`)

        console.log("Transcription job completed!");
        break;
      } else if (TranscriptionJobStatus === "FAILED") {
        console.log("Transcription job failed!");
        break;
      } else {
        console.log("Transcription job still in progress...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
      }
    }
  }
}
