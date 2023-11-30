import { Controller, Get, Param } from "@nestjs/common";
import { AnalysedVideoService } from "./AnalysedVideo.service";
import { promises as fsPromises } from "fs";

@Controller("analysed-video")
export class AnalysedVideoController {
  constructor(
    private readonly framesdVideoService: AnalysedVideoService
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
}
