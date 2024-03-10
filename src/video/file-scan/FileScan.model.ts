import { Injectable } from "@nestjs/common";
import { DirectoryUtils } from "../../utils/Directory.utils";
import { promises as fsPromises } from "fs";
import { FfprobeData } from "fluent-ffmpeg";

export const CONVERTED_DIR = `uploads/converted`
export const AUDIO_DIR_NAME = "audio"
export const HLS_DIR_NAME = "hls"
export const SCREENSHOTS_DIR_NAME = "screenshots"
export const TRANSCRIPT_DIR_NAME = "transcript"

export type ProcessType = "allMaterials" | "hls" | "screenshots" | "audio" | "transcript" | "all"

export interface ScanDirDto {
  inputDirectoryPaths: string[],
}

export interface ConvertFileAction {
  processType: ProcessType,
  override?: boolean,
}

export interface VideoInfo {
  durationS: number,
}

export interface VideoIndexInfo {
  screenshots: string[],
  videoInfo?: FfprobeData,
}
