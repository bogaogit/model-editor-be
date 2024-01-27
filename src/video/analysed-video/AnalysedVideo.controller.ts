import { Controller, Get, HttpStatus, Param, Res, Response } from "@nestjs/common";
import { AnalysedVideoService } from "./AnalysedVideo.service";
import fs, { promises as fsPromises } from "fs";
import path from 'path'
import { nodewhisper } from 'nodejs-whisper'

@Controller("analysed-video")
export class AnalysedVideoController {
  constructor(
  ) {
  }

  @Get("whisper")
  async whisper(@Res() res: Response): Promise<void> {
    // const transcriptPath = `uploads/converted/${name}/transcript/${name}.json`;
    try {
      // Need to provide exact path to your audio file.
      const filePath = path.resolve(__dirname, '../../../male.wav')

      await nodewhisper(filePath, {
        modelName: 'tiny.en', //Downloaded models name
        autoDownloadModelName: 'tiny.en', // (optional) autodownload a model if model is not present
        whisperOptions: {
          outputInText: false, // get output result in txt file
          outputInVtt: false, // get output result in vtt file
          outputInSrt: true, // get output result in srt file
          outputInCsv: false, // get output result in csv file
          translateToEnglish: false, //translate from source language to english
          wordTimestamps: false, // Word-level timestamps
          timestamps_length: 20, // amount of dialogue per timestamp pair
          splitOnWord: true, //split on word rather than on token
        },
      })

      // console.log(transcript); // output: [ {start,end,speech} ]
    } catch (error) {
      //@ts-ignore
      res.status(HttpStatus.BAD_REQUEST).json({ error: 'Failed transcribe using whisper' });
    }
  }

  @Get("images-info/:name")
  async getImagesInfo(@Param("name") name: string): Promise<string[]> {
    const directoryPath = `uploads/converted/${name}/screenshots`;
    try {
      return await fsPromises.readdir(directoryPath);
    } catch (error) {
      throw new Error('Failed to read directory');
    }
  }

  @Get("transcript/:name")
  getJson(@Res() res: Response, @Param("name") name: string): void {
    const transcriptPath = `uploads/converted/${name}/transcript/${name}.json`;
    try {
      const jsonData = fs.readFileSync(transcriptPath, 'utf8');
      const parsedData = JSON.parse(jsonData);
      //@ts-ignore
      res.status(HttpStatus.OK).json(parsedData);
    } catch (error) {
      //@ts-ignore
      res.status(HttpStatus.BAD_REQUEST).json({ error: 'Failed to fetch JSON file' });
    }
  }
}
