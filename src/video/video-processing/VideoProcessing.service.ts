import { Body, Injectable, Logger } from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";
import { DirectoryUtils } from "../../utils/Directory.utils";
import { ConvertFileAction } from "../file-scan/FileScan.model";
import { ConvertedFileInfo } from "../file-scan/FileScan.entity";
import { S3Service } from "../../aws/s3/S3.service";
import { TranscribeService } from "../../aws/transcribe/Transcribe.service";
import { FileScanService } from "../file-scan/FileScan.service";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);

/*
ffmpeg -f dshow -i video="USB Video Device":audio="Microphone (USB Audio Device)"  -f hls -hls_time 1.00 -hls_list_size 0 -hls_segment_filename "D:\repo\model-editor-be\uploads\hls\output_%03d.ts" D:\repo\model-editor-be\uploads\hls\output.m3u8

 */

const USE_CUDA = true;

@Injectable()
export class VideoProcessingService {
  private command: any;
  private readonly logger = new Logger(VideoProcessingService.name);
  private UPLOAD_AUDIO_S3: string = process.env.UPLOAD_AUDIO_S3

  constructor(
    private readonly s3Service: S3Service,
    private readonly transcribeService: TranscribeService,
    private readonly fileScanService: FileScanService
  ) {
  }

  async startStreaming() {
    this.command = ffmpeg()
      .input("audio=Microphone (USB Audio Device)")
      .inputOptions("-f dshow")
      .input("desktop")
      .inputOptions("-f gdigrab")
      .output("uploads/hls/output.m3u8")
      .outputOptions("-f hls")
      .outputOptions("-hls_time 1.00")
      .outputOptions("-hls_list_size 0")
      .outputOptions("-preset ultrafast")
      .on("start", () => {
        console.log("Screen capture and audio recording started");
      })
      .on("end", () => {
        console.log("Screen capture and audio recording end");
      });

    this.command.run();

  }

  async endStreaming() {
    return this.command.ffmpegProc.stdin.write("q");
  }

  async extractAudio(
    inputFilePath: string,
    fileName: string,
    inputFileType: string,
    callback?: () => void
  ) {
    const outputFolderPath = `uploads/converted/${fileName}/audio`;
    DirectoryUtils.createPathRecursively(outputFolderPath);

    ffmpeg()
      .input(`${inputFilePath}/${fileName}.${inputFileType}`)
      .outputOptions([
        "-vn",
        "-acodec", "copy"
      ])
      .output(`${outputFolderPath}/${fileName}.wav`)
      .on("start", () => {
        console.log("audio generated start.");
      })
      .on("progress", progress => {
        console.log(progress);
      })
      .on("end", () => {
        console.log("extract audio generated successfully.");
        if (callback) {
          callback();
        }
      })
      .on("error", (err) => {
        console.error("Error generating extract audio:", err);
      })
      .run();
  }

  async startScreenshots(
    inputFilePath: string,
    fileName: string,
    inputFileType: string,
    outputFileType: string,
    callback?: () => void
  ) {
    const outputFolderPath = `uploads/converted/${fileName}/screenshots`;
    DirectoryUtils.createPathRecursively(outputFolderPath);

    /**
     * Here,
     *
     * we use the select filter to extract a frame if the expression in single-quotes evaluates to non-zero. If the expression is zero, then select filter discards that frame.
     * mod(A,B) returns the modulus (remainder after division) result after dividing A by B. So, if we divide 0 by 300, we get 0. Then, 1/300 is 1, and so on.
     * not inverts this result. So, if the modulus is zero, then the final result is 1. If the modulus is non-zero, then the result is evaluated to zero.
     * Based on this not operation, the select filter picks up a frame.
     */

    /**
     *
     * Replace "input.mp4" with the name of your input video file. The `-vf "fps=1/5"` option sets the frame rate to 1 frame per 5 seconds, indicating that a screenshot will be taken every 5 seconds. Adjust the value if you want screenshots at a different interval.
     *
     * The `-q:v 2` option sets the quality of the output images. A lower value (e.g., 2) indicates higher quality, while a higher value (e.g., 10) indicates lower quality. You can adjust this value based on your preference.
     */
    let totalTime;
    ffmpeg()
      .input(`${inputFilePath}/${fileName}.${inputFileType}`)
      .outputOptions([
        "-vf", "fps=1/2",
        "-q:v", "0"
      ])
      .output(`${outputFolderPath}/${fileName}-%06d.${outputFileType}`)
      .on("start", () => {
        console.log("Screenshots generated start.");
      })
      .on("progress", progress => {
        // // HERE IS THE CURRENT TIME
        // const time = parseInt(progress.timemark.replace(/:/g, ""));
        //
        // // AND HERE IS THE CALCULATION
        // const percent = (time / totalTime) * 100;

        // console.log(percent);
      })
      .on("end", () => {
        console.log("Screenshots generated successfully.");
        if (callback) {
          callback();
        }
      })
      .on("error", (err) => {
        console.error("Error generating screenshots:", err);
      })
      .run();
  }

  async convertToHls(
    inputFilePath: string,
    fileName: string,
    inputFileType: string,
    callback?: () => void
  ) {
    const outputFolderPath = `uploads/converted/${fileName}/hls`;
    DirectoryUtils.createPathRecursively(outputFolderPath);

    const inputOptions = USE_CUDA ? [
        "-hwaccel", "cuda",
      ] :
      [];

    const outputOptions = USE_CUDA ? [
        "-c:v", "h264_nvenc",
        "-b:v", "6000k",
        "-maxrate:v", "9000k",
        "-c:a", "aac",
        "-hls_time", "10",
        "-hls_list_size", "0"
      ] :
      [
        "-c:v", "libx264",
        "-crf", "21",
        "-preset", "veryfast",
        "-c:a", "aac",
        "-b:a", "128k",
        "-hls_time", "10",
        "-hls_list_size", "0"
      ];

    let totalTime;
    ffmpeg()
      .input(`${inputFilePath}/${fileName}.${inputFileType}`)
      .inputOptions(inputOptions)
      .outputOptions(outputOptions)
      .output(`${outputFolderPath}/${fileName}.m3u8`)
      .on("start", () => {
        console.log("hls generated start.");
      })
      .on("progress", progress => {
        console.log(progress);
      })
      .on("end", () => {
        console.log("hls generated successfully.");
        if (callback) {
          callback();
        }
      })
      .on("error", (err) => {
        console.error("Error generating hls:", err);
      })
      .run();
  }

  async beingProcess(convertedFileInfo: ConvertedFileInfo, value: boolean) {
    await this.fileScanService.setFieldValue(convertedFileInfo, "processing", value);
  }

  async findNextFileAndProcess() {
    const isProcessingFile = await this.fileScanService.serviceIsProcessingFile();
    if (isProcessingFile) return;

    const fileToProcess = await this.fileScanService.findNextFileToProcess();
    if (!fileToProcess) return;

    this.logger.log("Picked next job:");
    this.logger.log(fileToProcess);

    await this.processVideo({
      convertFileAction: {
        processType: fileToProcess.processType
      },
      convertedFileInfo: fileToProcess.convertedFileInfo
    });
  }

  async processVideo(
    processVideoRequest: {
      convertFileAction: ConvertFileAction,
      convertedFileInfo: ConvertedFileInfo
    }
  ): Promise<ConvertedFileInfo> {
    const convertedFileInfo = processVideoRequest.convertedFileInfo;
    const inputFilePath: string = convertedFileInfo.filePath;
    const fileName: string = convertedFileInfo.fileName;
    const inputFileType: string = convertedFileInfo.extension.replace(".", "");
    const outputFileType: string = "jpg";

    if (processVideoRequest.convertFileAction.processType === "allMaterials") {
      await this.startScreenshots(
        inputFilePath,
        fileName,
        inputFileType,
        outputFileType,
        () => {
          this.convertToHls(
            inputFilePath,
            fileName,
            inputFileType,
            () => {
              const convertedInputFilePath: string = `uploads/converted/${fileName}/hls`;
              this.extractAudio(
                convertedInputFilePath,
                fileName,
                "m3u8",
                () => {
                  convertedFileInfo.hasScreenshots = true;
                  convertedFileInfo.hasHls = true;
                  convertedFileInfo.hasAudio = true;
                  return convertedFileInfo;
                }
              );
            }
          );
        }
      );
    } else if (processVideoRequest.convertFileAction.processType === "screenshots") {
      await this.beingProcess(convertedFileInfo, true);
      await this.startScreenshots(
        inputFilePath,
        fileName,
        inputFileType,
        outputFileType,
        () => {
          convertedFileInfo.hasScreenshots = true;
          this.fileScanService.setFieldValue(convertedFileInfo, "img", true);
          this.beingProcess(convertedFileInfo, false);
          return convertedFileInfo;
        }
      );
    } else if (processVideoRequest.convertFileAction.processType === "hls") {
      await this.beingProcess(convertedFileInfo, true);
      await this.convertToHls(
        inputFilePath,
        fileName,
        inputFileType,
        () => {
          convertedFileInfo.hasHls = true;
          this.fileScanService.setFieldValue(convertedFileInfo, "hls", true);
          this.beingProcess(convertedFileInfo, false);
          return convertedFileInfo;
        }
      );
    } else if (processVideoRequest.convertFileAction.processType === "audio") {
      await this.beingProcess(convertedFileInfo, true);
      const convertedInputFilePath: string = `uploads/converted/${fileName}/hls`;
      await this.extractAudio(
        convertedInputFilePath,
        fileName,
        "m3u8",
        () => {
          if (this.UPLOAD_AUDIO_S3 === "true") {
            this.s3Service.uploadToS3(`uploads/converted/${fileName}/audio`, `${fileName}.wav`)
          }
          convertedFileInfo.hasAudio = true;
          this.fileScanService.setFieldValue(convertedFileInfo, "audio", true);
          this.beingProcess(convertedFileInfo, false);
          return convertedFileInfo;
        }
      );
    } else if (processVideoRequest.convertFileAction.processType === "transcript") {
      const convertedInputFilePath: string = `uploads/converted/${fileName}/transcript`;
      await this.transcribeService.createTranscribeJob(
        fileName,
        `${convertedInputFilePath}/${fileName}.json`
      );
      await this.fileScanService.setFieldValue(convertedFileInfo, "transcript", true);
    }

    return null;
  }
}
