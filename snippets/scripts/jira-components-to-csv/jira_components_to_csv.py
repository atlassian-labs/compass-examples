# Prereqs: pip/pip3 install -r requirements.txt

import requests
import datetime
import pandas as pd

Replace with your email, API token, site URL, and Jira project keys
email = "your-email"
api_token = "your-api-token"
site_url = "your-site-url" # desired format: my-cool-site.atlassian.net
project_keys = ['your-project-key', 'another-project-key'] # List of Jira project keys or IDs to extract from

auth = (email, api_token)

all_data = []

# Iterate over the project keys
for project_key in project_keys:
    # Construct the URL for the current project key
    url = f"https://{site_url}/rest/api/3/project/{project_key}/components"

    # Make the API request
    # API reference: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-project-components/#api-rest-api-3-project-projectidorkey-components-get
    response = requests.get(url, auth=auth)

    print()

    # If the request was successful, parse the JSON data to grab the project's Jira components
    if response.status_code == 200:
        data = response.json()
        for component in data:
            all_data.append({
                'project_key': project_key,
                'component_name': component['name']
            })
            if len(all_data) == 1000:
                break
    else:
        print(f"Failed to get data for project: {project_key}")

# Convert the data to a pandas DataFrame
df = pd.DataFrame(all_data)

# Write the DataFrame to an CSV file
current_datetime = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
df.to_csv('output_component_{}.csv'.format(current_datetime), index=False)
print('Written to output_component_{}.csv'.format(current_datetime))