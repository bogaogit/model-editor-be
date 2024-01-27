import { Controller, Get, HttpStatus, Param, Res, Response } from "@nestjs/common";
import { AnalysedVideoService } from "./AnalysedVideo.service";
import fs, { promises as fsPromises } from "fs";
import path from 'path'
// import Bard from "bard-ai";

@Controller("analysed-video")
export class AnalysedVideoController {
  constructor(
  ) {
  }



  /*@Get("bard")
  async bard(@Res() res: Response): Promise<void> {
    try {
      try {
        const COOKIE = "g.a000fAh-ltGGwHdguCDWugdDu9DRcF7rDUEMwlIzp033SUp-xCsK_CrPiBtPEoTOAlDDh8pi-AACgYKAbUSAQASFQHGX2Minxk4IFnmNEWnBaN3QIlORRoVAUF8yKrWrjNK_5RdeL87rHWLWW6t0076"
        let myBard = new Bard(COOKIE);

        console.log(await myBard.ask("Hello, world!"));
      } catch (error) {
        console.error('Error:', error);
      }
    } catch (error) {
      //@ts-ignore
      res.status(HttpStatus.BAD_REQUEST).json({ error: 'Failed transcribe using whisper' });
    }
  }*/

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
