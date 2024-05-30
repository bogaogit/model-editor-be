Install-Module -Name AWS.Tools.Installer
Install-Module -Name AWS.Tools.Common
Install-Module -Name AWS.Tools.ECR
Install-AWSToolsModule AWS.Tools.EC2,AWS.Tools.S3 -CleanUp
Install-AWSToolsModule AWS.Tools.ECR

(Get-ECRLoginCommand).Password | docker login --username AWS --password-stdin public.ecr.aws/i6l4i0l2


use command 'docker build -t (username)/ftr-app .' to build docker image, and upload to docker hub
open AWS ECS, and create new cluster, and then create a task with docker image url '(username)/ftr-app', expose port 3000
run the task, and the application is running on ECS
