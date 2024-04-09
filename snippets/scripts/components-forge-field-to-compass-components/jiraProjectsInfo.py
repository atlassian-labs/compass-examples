#!/usr/bin/env python3

import getpass
import requests
from requests.auth import HTTPBasicAuth
from requests.exceptions import HTTPError

# Author: Huimin Pang

# Define Project Object
class Project:
    def __init__(self, key, name, project_type_key, url):
        self.key = key
        self.name = name
        self.project_type_key = project_type_key
        self.url = url

    def print_project_info(self):
        print("Key: {}".format(self.key))
        print("Name: {}".format(self.name))
        print("Link: {}".format(self.url))
        print("**********")


# Utility Functions
# Check whether the input is empty string or not
def check_input(input_string, input_type):
    if not bool(input_string):
        print("Please provide a valid " + input_type + ".")
        quit()


def get_projects_with_pagination(domain_name, user_name, api_token, start_at, max_results):
    url = domain_name + f"/rest/api/3/project/search?startAt={start_at}&maxResults={max_results}&orderBy=key&action=view"
    auth = HTTPBasicAuth(user_name, api_token)
    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, auth=auth, headers=headers)
        if response.ok:
            return response.json()
    except HTTPError as http_err:
        print(f"Couldn't retrieve projects for {domain_name} due to an HTTP error. Please try again.")
        quit()
    except Exception as err:
        print(f"Couldn't retrieve projects for {domain_name} due to an error: {err}. Please try again.")
        quit()


def parse_project_raw_result(projects_raw_json):
    projects_info = {}
    for project in projects_raw_json:
        key = project.get('key')
        name = project.get('name')
        project_type_key = project.get('projectTypeKey')
        url = project.get('self')
        projects_info[key] = Project(key, name, project_type_key, url)
    return projects_info


def print_projects(projects):
    for key in projects:
        project = projects[key]
        project.print_project_info()


def get_projects_by_type(projects, type):
    filtered_projects_raw_json = [project for project in projects if project["projectTypeKey"] == type]
    projects_info = parse_project_raw_result(filtered_projects_raw_json)
    return projects_info


# Main Function
def main():
    # Get the list of projects start with 0 and first 50 projects ordered by project key (can adjust startNum and
    # maxResult),
    project_raw_result = get_projects_with_pagination(DOMAIN_NAME, USER_NAME, API_TOKEN, 0, 50)

    project_count = project_raw_result['total']
    print(f"Successfully retrieved {project_count} projects for {DOMAIN_NAME}.\n")
    is_last = project_raw_result['isLast']
    if not is_last:
        print("Your site has more than 50 projects, please modify the variables(startAt & maxResults) in function get_Projects.")
    if project_count > 0:
        projects_dict = parse_project_raw_result(project_raw_result['values'])
    else:
        print("Your site doesn't have any projects.\n")
        quit()

    # Get the list of software type of projects
    TYPE = "software"
    project_with_type_dict = get_projects_by_type(project_raw_result['values'], TYPE)
    project_with_type_count = len(project_with_type_dict)
    if project_with_type_count > 0:
        print(f"There are {project_with_type_count} {TYPE}-type projects for {DOMAIN_NAME}.\n")
        print("Note down the project keys. You’ll need these to migrate the Compass custom field value to the native "
              "Components field.\n")
        print_projects(project_with_type_dict)
    else:
        print(f"Your site doesn't have any project with {TYPE}-type project.\n")


if __name__ == '__main__':
    # Ask user for the input
    DOMAIN_NAME = input("Enter your domain (example: https://acme.atlassian.net/):").strip()
    check_input(DOMAIN_NAME, "domain")
    USER_NAME = input("Enter your email address : ").strip()
    check_input(USER_NAME, "userName")
    API_TOKEN = getpass.getpass("Enter your API token: ").strip()
    check_input(API_TOKEN, "apiToken")
    print("\n")

    main()
