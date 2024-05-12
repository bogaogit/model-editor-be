import requests

url = "https://qwo5jkqle3.execute-api.ap-southeast-2.amazonaws.com/items/task/audioProcessing/pending"


  # Send the GET request
response = requests.get(url)

  # Check the response format (JSON, plain text, etc.)
if response.status_code == 200:
  # Get the response data (content depends on the API)
  data = response.json()
  print(data)
else:
  print(f"Error: {response.status_code}")
