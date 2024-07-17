#!/usr/bin/env python3

import getpass
import time

import requests
from requests.auth import HTTPBasicAuth
from requests.exceptions import HTTPError
import urllib.parse

DEFAULT_COMPASS_COMPONENT_TYPE = "SERVICE"

COMPASS_CREATE_COMPONENT_MUTATION = """
mutation createComponent(,$cloudId:ID!, $input: CreateCompassComponentInput!) {
  compass {
    createComponent(cloudId: $cloudId, input:$input) {
      success
      componentDetails {
        id
      }
    }
  }
}
"""

TENANT_INFO_QUERY = """
query tenantInfo($hostNames: [String!]) {
  tenantContexts(hostNames:$hostNames) {
    cloudId
  }
}
"""


def make_api_call(path, method, data=None, headers=None, no_response=False):
    # print(f"Making a {method} request to {url}")
    try:
        response = requests.request(
            method,
            f"https://{DOMAIN_NAME}{path}",
            auth=HTTPBasicAuth(USER_NAME, API_TOKEN),
            json=data,
            headers=headers
        )
        response.raise_for_status()
        if no_response:
            return
        return response.json()
    except HTTPError as http_err:
        if http_err.response.status_code == 404:
            return None
        print(f"HTTP error occurred: {http_err} - {http_err.response.text}")
        # rethrow the exception
        raise http_err
    except Exception as err:
        print(f"An error occurred: {err}")


def make_gql_api_call(query, variables):
    url = f"/gateway/api/graphql"
    headers = {
        'Content-Type': 'application/json'
    }
    data = {
        "query": query,
        "variables": variables
    }
    return make_api_call(url, "POST", data, headers)


def get_jira_component_list(project_key):
    url = f"/rest/api/3/project/{project_key}/components"
    response = make_api_call(url, "GET")
    return response


def get_related_issues_for_component(project_key, component):
    component_id = component['id']
    component_name = component['name']
    params = {'jql': f"project = {project_key} AND component = '{component_name}'"}

    start_at = 0
    url = f"/rest/api/3/search?{urllib.parse.urlencode(params)}&startAt={start_at}"
    all_issues = []
    while True:
        response = make_api_call(url, "GET")
        issues = response['issues']
        total = response['total']
        start_at += len(issues)
        all_issues.extend(issues)
        if start_at >= total:
            break
        url = f"/rest/api/3/search?{urllib.parse.urlencode(params)}&startAt={start_at}"

    # the jql api will return issues by component name
    # which can include compass components with same name as well
    # we need to filter out the ones that has the current Jira component in them
    all_issues = [issue for issue in all_issues if any(component_id in component['id'] for component in issue['fields']['components'])]

    return all_issues


def get_tenant_info():
    response = make_gql_api_call(TENANT_INFO_QUERY, {"hostNames": [DOMAIN_NAME]})
    return response['data']['tenantContexts'][0]['cloudId']


def create_compass_component(cloud_id,component):
    url = f"/gateway/api/graphql"
    headers = {
        'Content-Type': 'application/json'
    }
    variables = {
        "cloudId": cloud_id,
        "input": {
            "name": component['name'],
            "typeId": DEFAULT_COMPASS_COMPONENT_TYPE,
            "labels": ["migrated-from-jira-component"]
        }
    }

    response = make_gql_api_call(COMPASS_CREATE_COMPONENT_MUTATION, variables)
    return response['data']['compass']['createComponent']


# at least one project must have compass ON
def find_compass_component_in_jira(component_name):
    url = f"/rest/api/3/component?query={component_name}"
    response = make_api_call(url, "GET")

    filtered_response = [component for component in response['values'] if component['name'] == component_name]
    if len(filtered_response) > 0 and 'ari' in filtered_response[0]['ari']:
        return filtered_response[0]
    return None


def update_issue_components(issue, jira_component_id_to_remove, compass_component_id_to_add):
    url = f"/rest/api/3/issue/{issue['key']}"
    # remove the Jira component and add the compass component
    existing_components = issue['fields']['components']
    components_after = [{'id': component['id']} for component in existing_components if component['id'] != jira_component_id_to_remove]
    components_after.append({'id': compass_component_id_to_add})

    data = {
        "update": {
            "components": [
                {'set': components_after},
            ]
        }
    }

    make_api_call(url, "PUT", data, no_response=True)


def is_valid_project(project_key):
    url = f"/rest/api/3/project/{project_key}"
    response = make_api_call(url, "GET")
    if response is None:
        return False
    if response['projectTypeKey'] == "software" and response['style'] == "classic":
        return True
    return False


def does_project_have_compass_toggle_on():
    try:
        url = f"/rest/api/3/project/{PROJECT_KEY}/properties/jira.global.components"
        response = make_api_call(url, "GET")
        if response is None:
            return False
        return response['value']
    except Exception as e:
        return False


def component_url(component_ari):
    # split the ari by / and get the last one
    component_id = component_ari.split("/")[-1]
    return f"https://{DOMAIN_NAME}/compass/component/{component_id}"


def is_valid_credentials():
    url = f"/rest/api/3/myself"
    try:
        response = make_api_call(url, "GET")
        if response is None:
            return False
        return True
    except HTTPError as e:
        if e.response.status_code == 401:
            return False
        raise e

def main():
    if not is_valid_credentials():
        print("Invalid credentials provided. Exiting...")
        return

    if not is_valid_project(PROJECT_KEY):
        print("This script only supports Company Managed Jira Software projects. "
              "This project either does not exist or its type is not supported. Exiting...")
        return

    if not does_project_have_compass_toggle_on():
        print("Compass Components must be turned on for this project before running this script. Exiting...")
        return

    print("Starting the migration process...")
    # find all the Jira components in the project
    cloud_id = get_tenant_info()
    # compass_component = create_compass_component(tenant, {'name': 'test-in-script'})
    # print(f"Compass component created {compass_component}")
    jira_components = get_jira_component_list(PROJECT_KEY)
    print(f"Found {len(jira_components)} Jira components in the project {PROJECT_KEY}")

    # for each component, find the related issues and create a map of component id to list of issues
    jira_component_to_issues_map = {}
    for component in jira_components:
        # for each component, find the related issues by querying via JQL
        issues = get_related_issues_for_component(PROJECT_KEY, component)
        component_id = component['id']

        # filter out issues with 0 components
        issues = [issue for issue in issues if len(issue['fields']['components']) > 0]

        if len(issues) > 0:
            jira_component_to_issues_map[component_id] = {
                'component': component,
                'issues': issues
            }

    # print for each component how many issues are found
    for component_id, component in jira_component_to_issues_map.items():
        if len(component['issues']) > 0:
            print(f"Jira Component {component['component']['name']} has {len(component['issues'])} issues")

    print("\n")

    # create a map of jira component id to None
    jira_components_to_compass_components_map = {}

    # for each jira component, see if there is a compass component that matches the name
    # create a map of jira component id to compass component
    for jira_component in jira_components:
        compass_component = find_compass_component_in_jira(jira_component['name'])
        if compass_component is not None:
            jira_components_to_compass_components_map[jira_component['id']] = compass_component

    if len(jira_components_to_compass_components_map) > 0:
        print("We found following Compass components with same name as the Jira components:")
    for jira_component in jira_components:
        if jira_component['id'] in jira_components_to_compass_components_map:
            print(f"{jira_component['name']}")

    print("\n")
    # find out components that needs to be created in Compass
    jira_components_to_create_in_compass = [jira_component for jira_component in jira_components
                                            if jira_component['id'] not in
                                            jira_components_to_compass_components_map]

    if len(jira_components_to_create_in_compass) > 0:
        print(f"Corresponding Compass components for following Jira components will be created:")
        for jira_component in jira_components_to_create_in_compass:
            print(f"{jira_component['name']}")
        print(f"To view newly created Compass components, visit: "
              f"https://{DOMAIN_NAME}/compass/components?label=migrated-from-jira-component")

    print("\n")

    for jira_component in jira_components_to_create_in_compass:
        compass_component = create_compass_component(cloud_id, jira_component)
        if compass_component['success'] is False:
            print(f"Failed to create compass component for Jira Component"
                  f" with id {jira_component['id']} and name {jira_component['name']}")
            print(f"Error: {compass_component['error']}")

    # sleep a bit for the components to sync in Jira and retrieve them as Jira Components again
    time.sleep(len(jira_components_to_create_in_compass) // 10 + 1)

    for comp in jira_components_to_create_in_compass:
        compass_component_in_jira = find_compass_component_in_jira(comp['name'])
        if compass_component_in_jira is not None:
            jira_components_to_compass_components_map[comp['id']] = compass_component_in_jira

    # for each issue, remove the existing component and add the compass component
    if len(jira_component_to_issues_map) > 0:
        print("Replacing Jira components with compass components in Issues...")
    else:
        print("No issues found for any of these Jira components. Nothing to migrate. Exiting...")

    for component_id, component in jira_component_to_issues_map.items():
        issues = component['issues']
        if component_id not in jira_components_to_compass_components_map:
            print(f"Compass component not found for Jira component {component['component']['name']}. "
                  f"Skipping following issues."
                  f" {', '.join([issue['key'] for issue in issues])}")
            continue
        compass_component = jira_components_to_compass_components_map[component_id]
        if compass_component is not None:
            for issue in issues:
                issue_key = issue['key']
                # remove the Jira component and add the compass component
                update_issue_components(issue, component_id, compass_component['id'])
                print(f"Updated issue {issue_key} by replacing Jira component {component['component']['name']} with "
                      f"compass component {component_url(compass_component['ari'])}")
        else:
            print(f"Issue not migrated for Jira component {component['name']}")


if __name__ == "__main__":
    # Ask user for the input
    print(f"This script is used to migrate Jira components of a given project to Compass components.\n"
          f"Once run, this script will create a component in Compass for each Jira component in the project unless"
          f" there is a Compass component with the same name.\n"
          f"Then it will go through issues in the project "
          f"and replace those Jira components with the Compass components on the issues.")
    DOMAIN_NAME = input("Enter your domain name (e.g. example.atlassian.net): ").strip()
    USER_NAME = input("Enter your email address: ").strip()
    print(
        "Learn how to create an API token: "
        "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/ "
    )

    API_TOKEN = getpass.getpass("Enter your API token: ").strip()
    PROJECT_KEY = input("Enter your project key : ").strip()

    print("\n")

    main()
