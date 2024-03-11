import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { FfprobeData } from "fluent-ffmpeg";

@Entity("converted_file_info")
export class ConvertedFileInfo {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ name: "file_name" })
  fileName: string;
  @Column({ name: "file_path" })
  filePath: string;
  @Column({ name: "extension" })
  extension: string;
  @Column({ name: "is_empty" })
  isEmpty: boolean = false;
  @Column({ name: "has_audio" })
  hasAudio: boolean = false;
  @Column({ name: "has_hls" })
  hasHls: boolean = false;
  @Column({ name: "has_screenshots" })
  hasScreenshots: boolean = false;
  @Column({ name: "has_transcript" })
  hasTranscript: boolean = false;
  @Column({ name: "has_all" })
  hasAll: boolean = false;
  @Column({ name: "processing" })
  processing: boolean = false;
  @Column({ name: "videoInfo", type: "json", nullable: true })
  videoInfo: FfprobeData;
}
