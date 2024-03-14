import requests

url = "https://qwo5jkqle3.execute-api.ap-southeast-2.amazonaws.com/items"
# Define the data to send in the body (can be dictionary, JSON string, etc.)
data = {
    "id": "9a39be7a-4f8c-434a-8d45-c57196f1867f",
    "name": "test111",
    "dataType": "task",
    "audioProcessing": "pending",
    "transcribeProcessing": "pending"
}

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
