import { Controller, Get, HttpStatus, Param, Res, Response } from "@nestjs/common";
import { AnalysedVideoService } from "./AnalysedVideo.service";
import fs, { promises as fsPromises } from "fs";
import path from 'path'
const { BardAPI } = require('bard-api-node');

@Controller("analysed-video")
export class AnalysedVideoController {
  constructor(
  ) {
  }



  @Get("bard")
  async bard(@Res() res: Response): Promise<void> {
    try {
      try {
        const assistant = new BardAPI();

        // Set session information for authentication
        await assistant.setSession('__Secure-1PSID', 'g.a000fAh-ltGGwHdguCDWugdDu9DRcF7rDUEMwlIzp033SUp-xCsK_CrPiBtPEoTOAlDDh8pi-AACgYKAbUSAQASFQHGX2Minxk4IFnmNEWnBaN3QIlORRoVAUF8yKrWrjNK_5RdeL87rHWLWW6t0076'); // or '__Secure-3PSID'
        await assistant.setSession('__Secure-1PSIDTS', 'sidts-CjIBPVxjSjFFg_tzlP4jBFK7UQdDeGeO9nsNv3YigCsOrhSbkn0aAL_2nyMgZfZXS8ngSBAA'); // or '__Secure-3PSID'
        // ...

        // Send a query to Bard
        const response = await assistant.getBardResponse('Hello, how are you?');
        console.log('Bard:', response.content);


      } catch (error) {
        console.error('Error:', error);
      }
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
