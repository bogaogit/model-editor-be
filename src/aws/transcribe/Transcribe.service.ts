import { Injectable } from "@nestjs/common";
import fs from "fs";
import { S3 } from "@aws-sdk/client-s3";
import {LanguageCode, StartTranscriptionJobCommand, TranscribeClient} from "@aws-sdk/client-transcribe";

@Injectable()
export class TranscribeService {
  constructor() {
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

    const transJobParams = {
      TranscriptionJobName: `${fileName}-transcript`,
      Media: {
        "MediaFileUri": `s3://${S3_BUCKET}/${fileName}`
      },

      OutputBucketName: S3_BUCKET,
      LanguageCode: LanguageCode.EN_AU
    };

    // await transcribeClient.send(
    //   new StartTranscriptionJobCommand(transJobParams)
    // );

    const transcriptionResponse = await transcribeClient.send(new StartTranscriptionJobCommand(transJobParams));

    // Wait for the transcription job to complete
    await transcribeClient.("transcriptionJobCompleted", { TranscriptionJobName: transcriptionResponse.TranscriptionJob.TranscriptionJobName }).promise();

    // Get the transcript from AWS Transcribe
    const getTranscriptParams = {
      TranscriptionJobName: transcriptionResponse.TranscriptionJob.TranscriptionJobName
    };
    const transcriptResponse = await transcribeClient.getTranscriptionJob(getTranscriptParams).promise();
    const transcript = transcriptResponse.TranscriptionJob.Transcript.TranscriptFileUri;

    // Download the transcript file from AWS S3
    const transcriptFile = await s3.getObject({ Bucket: "your-bucket-name", Key: transcript });

    // Store the transcript in a local directory
    fs.writeFileSync(saveToFile, transcriptFile.Body.toString());
  }
}
