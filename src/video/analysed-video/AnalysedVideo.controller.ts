import { Controller, Get, HttpStatus, Param, Res, Response } from "@nestjs/common";
import { AnalysedVideoService } from "./AnalysedVideo.service";
import fs, { promises as fsPromises } from "fs";

@Controller("analysed-video")
export class AnalysedVideoController {
  constructor(
  ) {
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
