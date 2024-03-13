import requests

url = "https://qwo5jkqle3.execute-api.ap-southeast-2.amazonaws.com/items/task"

try:
  # Send the GET request
  response = requests.get(url)
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
