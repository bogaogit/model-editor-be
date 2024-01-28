import whisper
import json
import os
import time

source_dir = "../uploads/audios"
output_dir = "../uploads/transcripts"
transcribing = False

def check_for_file():
    for root, directories, files in os.walk(source_dir):
        for file in files:
            file_path = os.path.join(root, file)
            base_name, extension = os.path.splitext(file)
            transcript_path = os.path.join(output_dir, base_name + '.json')
            print("file_path:", file_path)
            print("base_name:", base_name)
            print("transcript_path:", transcript_path)
            if not os.path.exists(transcript_path):
                print("Transcript not found:", transcript_path)
                print("Transcribing using whisper", transcript_path)
                transcribe(file_path, transcript_path)

def transcribe(file_path, output_path):
    print("Transcribing file:", file_path)
    transcribing = True
    model = whisper.load_model("base")
    audio = whisper.load_audio(file_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    _, probs = model.detect_language(mel)
    print(f"Detected language: {max(probs, key=probs.get)}")

    result = model.transcribe(file_path, task="translate")
    # result = model.transcribe("male.mp3", language="zh", task="translate")

    print(result["segments"])

    json_object = json.dumps(result["segments"], indent=4)

    with open(output_path, "w") as outfile:
        outfile.write(json_object)
    transcribing = False


while True:
    if transcribing == False:
        check_for_file()
    else:
        print("transcribing...")
    time.sleep(10)  # Check every 60 seconds
