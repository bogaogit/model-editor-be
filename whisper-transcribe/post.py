import requests

url = "https://qwo5jkqle3.execute-api.ap-southeast-2.amazonaws.com/items"
# Define the data to send in the body (can be dictionary, JSON string, etc.)
data = {'transcribeProcessing': 'done', 'dataType': 'task', 'audioProcessing': 'pending', 'id': 'e36e1e8a-8410-424d-ad13-140a5e0c34e7', 'name': 'screen-capture-5825b400-7cda-427b-91dd-3009b366e24e.mp4'}

# Optional headers (e.g., Content-Type for JSON data)
headers = {
  "Content-Type": "application/json"
}

try:
  # Send the GET request
  response = requests.put(url, json=data, headers=headers)
  response.raise_for_status()  # Raise an exception for unsuccessful responses (optional)

  # Check the response format (JSON, plain text, etc.)
  if response.headers['Content-Type'] == 'application/json':
    # Assuming JSON format, parse the response
    data_list = response.json()
    # Access the list of strings: data_list["your_key_name"] (replace with actual key)
    print(f"List of strings: {data_list}")
  else:
    # Handle other response formats (plain text, etc.)
    print(f"Response content: {response.text}")

except requests.exceptions.RequestException as e:
  print(f"Error: {e}")
