import boto3
import json
import subprocess
import os
import requests
from whisper_mic import WhisperMic

api_gateway_url = "https://qwo5jkqle3.execute-api.ap-southeast-2.amazonaws.com/items"
AWS_ACCESS_KEY_ID = 'AKIAW3MEEZNLD5AIXLNP'
AWS_SECRET_ACCESS_KEY = '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'
bucket_name = "model-editor-data-bucket"
file_dir = './files/'

s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
mic = WhisperMic()


def get_tasks():
  response = requests.get(api_gateway_url + "/task/transcribeProcessing/pending")

  if response.status_code == 200:
    taskList = response.json()
    print(taskList)
  else:
    print(f"Error: {response.status_code}")

  return taskList

def extract_audio(input_file, output_file):
  command = ["ffmpeg", "-y", "-i", input_file, "-ar", "16000", "-c:a", "pcm_s16le", "-ac", "1", output_file]
  try:
    subprocess.run(command, check=True)
    print(f"Audio successfully extracted to: {output_file}")
  except subprocess.CalledProcessError as e:
    print(f"Error extracting audio: {e}")

def download_file_from_s3(file_full_name):
  if not os.path.exists(file_dir + file_full_name):
    s3.download_file(bucket_name, file_full_name, file_dir + file_full_name)
    print(f"Successfully downloaded file: {file_full_name}")
  else:
     print(f"File already exists: {file_full_name}")
     
def transcribe(input_file, output_path):
    print("Transcribing file:", input_file)

    result = mic.transcribe_file(input_file)
    print(result["segments"])

    json_object = json.dumps(result["segments"], indent=4)

    with open(output_path, "w") as outfile:
        outfile.write(json_object)

def upload_file_to_s3(file_name):
    s3.upload_file(Filename=file_dir + file_name, Bucket=bucket_name, Key=file_name)
    print(f"Successfully uploaded file: {file_name}")

def update_task_data(task_data): 
  task_data["transcribeProcessing"] = "done"

  headers = {
    "Content-Type": "application/json"
  }

  print(task_data)

  try:
    response = requests.put(api_gateway_url, json=task_data, headers=headers)
    print(f"Updated task data: {response.text}")

  except requests.exceptions.RequestException as e:
    print(f"Error: {e}")


def main():
  taskList = get_tasks()
  print(f"List: {taskList}")

  for task in taskList:
    task_file_name = task['name']

    print(f"Start transcribe process for file: {task_file_name}")
    
    download_file_from_s3(task_file_name)
    file_name, file_ext = os.path.splitext(task_file_name)

    wav_file = file_name + ".wav"
    extract_audio(file_dir + task_file_name, file_dir + wav_file)
    
    transcribe_file = file_name + ".json"
    transcribe(file_dir + wav_file, file_dir + transcribe_file)

    upload_file_to_s3(transcribe_file)

    update_task_data(task)
  
main()