import boto3
import os
import subprocess

AWS_ACCESS_KEY_ID = 'AKIAW3MEEZNLD5AIXLNP'
AWS_SECRET_ACCESS_KEY = '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'
bucket_name = "model-editor-data-bucket"
file_name = "screen-capture-bbdf63fd-29a9-4005-86c2-08984dda72b1"
file_ext = ".mp4"
file_full_name = file_name + file_ext
file_dir = './files/'

s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

def extract_audio(input_file, output_file):
  command = ["ffmpeg", "-i", input_file, "-vn", "-codec:a", "pcm_s16le", "-ac", "1", output_file]
  try:
    subprocess.run(command, check=True)
    print(f"Audio successfully extracted to: {output_file}")
  except subprocess.CalledProcessError as e:
    print(f"Error extracting audio: {e}")

def download_file_from_s3():
  s3.download_file(bucket_name, file_full_name, file_dir + file_full_name)
  print(f"Successfully downloaded file: {file_name}")

def main():
  download_file_from_s3()

  output_file = file_name + ".wav"
  extract_audio(file_dir + file_full_name, file_dir + output_file)

  # s3.upload_file(Filename=file_dir + output_file, Bucket=bucket_name, Key=output_file)

main()