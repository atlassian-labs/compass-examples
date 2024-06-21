#!/usr/bin/env python3

import getpass
import requests
from requests.auth import HTTPBasicAuth
from requests.exceptions import HTTPError

# Author: Huimin Pang

DEFAULT_PAGE_SIZE = 50

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


def get_software_projects_with_pagination(domain_name, user_name, api_token, start_at, max_results):
    auth = HTTPBasicAuth(user_name, api_token)
    headers = {
        "Accept": "application/json"
    }
    isLast = False
    projects_raw = []
    offset = start_at

    print('Loading projects . . .')

    while not isLast:
        try:
            url = domain_name + f"/rest/api/3/project/search?type=software&startAt={offset}&maxResults={max_results}&orderBy=key&action=view"
            response = requests.get(url, auth=auth, headers=headers, timeout=1)

            if response.ok:
                response_json = response.json()
                isLast = response_json['isLast']
                projects_raw += response_json['values']
                offset += max_results
                projects_loaded = len(projects_raw)
                projects_total = response_json['total']

                print(F"Loaded {projects_loaded} projects of {projects_total}")
            else:
                print(f"Unexpected HTTP response code {response.status_code} while retrieving projects for {domain_name}. Please try again.")
                quit()
            
        except HTTPError as http_err:
            print(f"Couldn't retrieve projects for {domain_name} due to an HTTP error: {http_err}. Please try again.")
            quit()
        except Exception as err:
            print(f"Couldn't retrieve projects for {domain_name} due to an error: {err}. Please try again.")
            quit()

    return projects_raw

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
    # Get the list of software projects
    projects_raw = get_software_projects_with_pagination(DOMAIN_NAME, USER_NAME, API_TOKEN, 0, DEFAULT_PAGE_SIZE)

    project_count = len(projects_raw)
    print(f"Successfully retrieved {project_count} projects for {DOMAIN_NAME}.\n")

    if project_count > 0:
        projects_dict = parse_project_raw_result(projects_raw)
        print_projects(projects_dict)
    else:
        print(f"Your site doesn't have any project with software-type project.\n")
        quit()

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
