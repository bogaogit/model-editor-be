TODO:

read a video file input and output screenshot in time intervals to help to list the content of video without open them

localize all files with following steps:
screen capture log
1. capture screen as video hls, start to end.
2. when finished, generate audio
3. use aws to upload audio to s3 and create transcribe job
4. when transcribe job done, download scripts from s3

make a screen capture component to start and stop screen cap.
make a video player with aws transcript in control, also can display transcript as subtitle

make a video convert component, called framed video. use ffmpeg to generate video snapshots, and convert video to hls for streaming
display img as matrix, can zoom in and out,
once click on img, it will jump to the video 
if video has transcript. create new view with imgs and transcribe part grouped.
