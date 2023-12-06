##
# This is a script that will retrieve all component IDs and write them to a file "component_ids.txt".
# Make sure to replace api_token, email, and cloudId with your own values.
##
import base64
import requests
import json

url = "https://api.atlassian.com/graphql"
api_token = "your-api-token"
email = "your-email"
auth_header = f"{email}:{api_token}"
encoded_auth_header = base64.b64encode(auth_header.encode('utf-8')).decode('utf-8')
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": f"Basic {encoded_auth_header}",
}

# Define the query and variables
query = """
query searchCompassComponents($cloudId: String!, $query: CompassSearchComponentQuery) {
  compass {
    searchComponents(cloudId: $cloudId, query: $query) {
      ... on CompassSearchComponentConnection {
        nodes {
            component {
              id
            }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
"""

variables = {
    "cloudId": "your-cloud-id",
}

filename = "component_ids.txt"
with open(filename, 'w') as f:
    while True:
        # Prepare the data
        data = {"query": query, "variables": variables}

        # Send the request
        response = requests.post('https://api.atlassian.com/graphql', headers=headers, data=json.dumps(data))

        # Parse the response
        response_data = response.json()
        if 'data' in response_data:
            ids = [node['component']['id'] for node in response_data['data']['compass']['searchComponents']['nodes']]
            for id in ids:
                f.write(id + '\n')

            # Check if there are more pages
            hasNextPage = response_data['data']['compass']['searchComponents']['pageInfo']['hasNextPage']
            if hasNextPage:
                # Update the cursor
                endCursor = response_data['data']['compass']['searchComponents']['pageInfo']['endCursor']
                variables['query'] = {
                    "after": endCursor,
                }
            else:
                break
        else:
            print("Error:", response_data)
            break

print(f"Component IDs have been written to {filename}.")