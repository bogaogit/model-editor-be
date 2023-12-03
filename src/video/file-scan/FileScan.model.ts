import { Injectable } from "@nestjs/common";
import { DirectoryUtils } from "../../utils/Directory.utils";
import { promises as fsPromises } from "fs";

export const CONVERTED_DIR = `uploads/converted`
export const AUDIO_DIR_NAME = "audio"
export const HLS_DIR_NAME = "hls"
export const SCREENSHOTS_DIR_NAME = "screenshots"
export const TRANSCRIPT_DIR_NAME = "transcript"

export type ProcessType = "allMaterials" | "hls" | "img" | "audio" | "transcript" | "all"

export interface ScanDirDto {
  inputDirectoryPaths: string[],
}

export interface ConvertFileAction {
  processType?: ProcessType,
  override: boolean,
}

export class ConvertedFileInfo {
  fileName: string;
  filePath: string;
  extension: string;
  isEmpty: boolean;
  hasAudio: boolean;
  hasHls: boolean;
  hasScreenshots: boolean;
  hasTranscript: boolean;
  hasAll: boolean;

  constructor() {

  }
}
