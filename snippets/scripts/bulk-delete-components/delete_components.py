##
# This is a script that will delete all components from a file "component_ids.txt" or a list of component IDs specified in the script.
# Make sure to replace api_token and email with your own values.
##

import base64
import requests

dry_run = True

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

# List of component IDs
# component_ids = [
#     "id1",
#     "id2",
#     # Add more component IDs as needed
# ]
filename = "component_ids.txt"
with open(filename, 'r') as f:
    component_ids = [line.strip() for line in f.readlines()]

# GraphQL mutation template
mutation_template = """
mutation DeleteComponent {{
  compass {{
    deleteComponent(
      input: {{id: "{component_id}"}}
    ) {{
      deletedComponentId
    }}
  }}
}}
"""

components_deleted = 0
# Perform bulk deletion
for component_id in component_ids:
    # Construct the GraphQL mutation
    mutation = mutation_template.format(component_id=component_id)

    if dry_run:
        # If dry run, just increment the counter
        components_deleted += 1
    else:
        # Send the GraphQL request
        response = requests.post(url, headers=headers, json={"query": mutation})

        # Handle the response as needed
        data = response.json()
        deleted_component_id = data.get("data", {}).get("compass", {}).get("deleteComponent", {}).get("deletedComponentId")
        errors = data.get("data", {}).get("compass", {}).get("deleteComponent", {}).get("errors")

        if deleted_component_id:
            print(f"Component with ID {deleted_component_id} deleted successfully")
            components_deleted += 1
        else:
            print(f"Failed to delete component with ID {component_id}")
            if errors:
              for error in errors:
                print(f"Error message: {error.get('message')} Status code: {error.get('extensions', {}).get('statusCode')}")

print(f"Number of components { 'to be deleted' if dry_run else 'deleted' }: {components_deleted}, dry_run: {dry_run}")
