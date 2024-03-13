import boto3
import json
import subprocess
import os
from whisper_mic import WhisperMic



AWS_ACCESS_KEY_ID = 'AKIAW3MEEZNLD5AIXLNP'
AWS_SECRET_ACCESS_KEY = '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'
bucket_name = "model-editor-data-bucket"
file_name = "screen-capture-90e14711-4f9a-4987-ba80-de65f32cd196"
file_ext = ".mp4"
file_full_name = file_name + file_ext
file_dir = './files/'

s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
mic = WhisperMic()

def extract_audio(input_file, output_file):
  command = ["ffmpeg", "-y", "-i", input_file, "-ar", "16000", "-c:a", "pcm_s16le", "-ac", "1", output_file]
  try:
    subprocess.run(command, check=True)
    print(f"Audio successfully extracted to: {output_file}")
  except subprocess.CalledProcessError as e:
    print(f"Error extracting audio: {e}")

def download_file_from_s3():
  if not os.path.exists(file_dir + file_full_name):
    s3.download_file(bucket_name, file_full_name, file_dir + file_full_name)
    print(f"Successfully downloaded file: {file_name}")
  else:
     print(f"File already exists: {file_name}")
     
def transcribe(input_file, output_path):
    print("Transcribing file:", input_file)

    result = mic.transcribe_file(input_file)
    print(result["segments"])

    json_object = json.dumps(result["segments"], indent=4)

    with open(output_path, "w") as outfile:
        outfile.write(json_object)

def main():
  download_file_from_s3()

  output_file = file_name + ".wav"
  extract_audio(file_dir + file_full_name, file_dir + output_file)

  transcribe(file_dir + file_name + ".wav", file_name + ".json")

  # s3.upload_file(Filename=file_dir + output_file, Bucket=bucket_name, Key=output_file)

main()