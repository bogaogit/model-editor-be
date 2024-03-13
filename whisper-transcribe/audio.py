import boto3
import os
import subprocess


def extract_audio(input_file, output_file):
  """
  Extracts audio from an mp4 file to a wav file using ffmpeg.

  Args:
      input_file (str): Path to the mp4 file.
      output_file (str): Path to the output wav file.
  """
  # ffmpeg command to extract audio
  command = ["ffmpeg", "-i", input_file, "-vn", "-codec:a", "pcm_s16le", "-ac", "1", output_file]

  # Run ffmpeg command using subprocess
  try:
    subprocess.run(command, check=True)
    print(f"Audio successfully extracted to: {output_file}")
  except subprocess.CalledProcessError as e:
    print(f"Error extracting audio: {e}")




AWS_ACCESS_KEY_ID = 'AKIAW3MEEZNLD5AIXLNP'
AWS_SECRET_ACCESS_KEY = '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'
bucket_name = "model-editor-data-bucket"
object_key = "screen-capture-bbdf63fd-29a9-4005-86c2-08984dda72b1.mp4"

s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

s3.download_file(bucket_name, object_key, './' + object_key)

print(f"Successfully downloaded file: {object_key}")
# extract audio
output_file = "extracted_audio.wav"
extract_audio('./' + object_key, './' + output_file)

s3.upload_file(Filename='./' + output_file, Bucket=bucket_name, Key=output_file)
