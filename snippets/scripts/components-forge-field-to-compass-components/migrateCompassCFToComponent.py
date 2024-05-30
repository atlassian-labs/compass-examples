#!/usr/bin/env python3

import getpass
import json
import requests
from requests.auth import HTTPBasicAuth
from requests.exceptions import HTTPError


# Define Issue Custom Field Metadata Object
class IssueCustomFieldMetadata:
    def __init__(self, custom_id, name, key, field_id):
        self.custom_id = custom_id
        self.name = name
        self.key = key
        self.field_id = field_id


# Define Issue Object
class Issue:
    def __init__(self, id, link, key, custom_field_value, components):
        self.id = id
        self.link = link
        self.key = key
        self.custom_field_value = custom_field_value
        self.existing_components = components


# Define Component Object
class Component:
    def __init__(self, link, id, name, ari, type_id, compass_component_version):
        self.link = link
        self.id = id
        self.name = name
        self.ari = ari
        self.type_id = type_id
        self.compass_component_version = compass_component_version


# Global Variable
maxResults = 100


# Utility Functions
# Check whether the input is empty string or not
def check_input(input_string, input_type):
    if not bool(input_string):
        print("Please provide a valid " + input_type + ".")
        quit()


def get_project_issue_type_ids(domain_name, user_name, api_token, project_key):
    url = domain_name + f"/rest/api/3/issue/createmeta/{project_key}/issuetypes"
    auth = HTTPBasicAuth(user_name, api_token)
    headers = {"Accept": "application/json"}

    try:
        response = requests.get(url, auth=auth, headers=headers)
        if response.ok:
            return response.json()
    except HTTPError as http_err:
        print(
            f"Couldn't retrieve projects create issue metadata due to an HTTP error. Please try again."
        )
        quit()
    except Exception as err:
        print(
            f"Couldn't retrieve projects create issue metadata due to an unknown error. Please try again."
        )
        quit()


def get_project_issue_type_metadata(
        domain_name, user_name, api_token, project_key, issue_type_id
):
    url = (
            domain_name
            + f"/rest/api/3/issue/createmeta/{project_key}/issuetypes/{issue_type_id}"
    )
    auth = HTTPBasicAuth(user_name, api_token)
    headers = {"Accept": "application/json"}

    try:
        response = requests.get(url, auth=auth, headers=headers)
        if response.ok:
            return response.json()
    except HTTPError as http_err:
        print(
            f"Couldn't retrieve projects issueType metadata due to an HTTP error. Please try again."
        )
        quit()
    except Exception as err:
        print(
            f"Couldn't retrieve projects issueType metadata due to an unknown error. Please try again."
        )
        quit()


def get_custom_field(fields, custom_field_name):
    compass_jira_forge_field_key_part = "compass-jira-integration-custom-field"
    custom_field = [
        field
        for field in fields
        if (field["name"] == custom_field_name)
           and (compass_jira_forge_field_key_part in field["key"])
    ]
    if len(custom_field) > 0:
        formatted_custom_field = IssueCustomFieldMetadata(
            custom_field[0]["schema"]["customId"],
            custom_field[0]["name"],
            custom_field[0]["key"],
            custom_field[0]["fieldId"],
        )
        return formatted_custom_field
    else:
        print(
            f"Your site doesn't seem to have custom field name as {custom_field_name}. Please check whether you have Compass "
            f"custom field enabled in the issue settings."
        )
        quit()


def get_related_issues(domain_name, user_name, api_token, custom_field_custom_id, start_at, max_results):
    url = (
            domain_name
            + f"/rest/api/3/search?"
              f"&startAt={start_at}&maxResults={max_results}&jql=cf%5B{custom_field_custom_id}%5D%20is%20not%20empty"
    )
    auth = HTTPBasicAuth(user_name, api_token)
    headers = {"Accept": "application/json"}

    try:
        response = requests.get(url, auth=auth, headers=headers)
        if response.ok:
            return response.json()
    except HTTPError as http_err:
        print(
            f"Couldn't retrieve issues with Compass custom field due to an HTTP error. Please try again."
        )
        quit()
    except Exception as err:
        print(
            f"Couldn't retrieve issues with Compass custom field due to an unknown error. Please try again."
        )
        quit()


def get_formatted_issues(issues, custom_field_field_id):
    formatted_issues = {}
    compass_components_prefix = "ari:cloud:compass"
    for issue in issues:
        id = issue["id"]
        link = issue["self"]
        key = issue["key"]
        custom_field_value = issue["fields"][custom_field_field_id]
        components = issue["fields"]["components"]
        # We only save the issues with valid value of customField .
        # If the customField value(ari) got deleted/invalid, we will ignore it
        if bool(custom_field_value) and custom_field_value.startswith(
                compass_components_prefix
        ):
            formatted_issues[id] = Issue(id, link, key, custom_field_value, components)
    return formatted_issues


def get_related_components(fields):
    allow_components = {}
    for field in fields:
        if field["key"] == "components":
            allow_components = field["allowedValues"]
    return allow_components


def get_formatted_components(components):
    formatted_components = {}
    for component in components:
        link = component["self"]
        id = component["id"]
        name = component["name"]
        ari = component["ari"]
        type_id = component["metadata"]["typeId"]
        compass_component_version = component["metadata"]["compassComponentVersion"]
        formatted_components[ari] = Component(
            link, id, name, ari, type_id, compass_component_version
        )
    return formatted_components


def update_issue(domain_name, user_name, api_token, issue_id, ari, existing_components, allowed_components_dict):
    component_details = allowed_components_dict[ari]

    url = (
            domain_name
            + f"/rest/api/3/issue/{issue_id}?notifyUsers=false&overrideScreenSecurity=false&overrideEditableFlag=false&returnIssue=true"
    )
    auth = HTTPBasicAuth(user_name, api_token)
    headers = {"Accept": "application/json", "Content-Type": "application/json"}

    data = {
        "fields": {
            "components": [
                {
                    "self": component_details.link,
                    "id": component_details.id,
                    "name": component_details.name,
                    "ari": component_details.ari,
                    "metadata": {
                        "typeId": component_details.type_id,
                        "compassComponentVersion": component_details.compass_component_version,
                    },
                }
            ]
        }
    }
    if existing_components:
        data["fields"]["components"].extend(existing_components)

    try:
        response = requests.put(url, auth=auth, headers=headers, data=json.dumps(data))
        if not response.ok:
            print(
                f"Couldn't copy issueId: {issue_id} issue's Compass custom field value to its Components field. "
                f"Please try again."
            )
    except HTTPError as http_err:
        print(
            f"Couldn't copy issueId: {issue_id} issue's Compass custom field value to its Components field due to an "
            f"HTTP error. Please try again."
        )
    except Exception as err:
        print(
            f"Couldn't copy issueId: {issue_id} issue's Compass custom field value to its Components field due to an "
            f"unknown error. Please try again."
        )


# Main Function
def main():
    # Get the list of project's issue_type_ids
    issue_type_results = get_project_issue_type_ids(
        DOMAIN_NAME, USER_NAME, API_TOKEN, PROJECT_KEY
    )
    issue_type_ids = [issue["id"] for issue in issue_type_results["issueTypes"]]
    if len(issue_type_ids) <= 0:
        print(f"The project: {PROJECT_KEY} doesn't have issues.")
        quit()

    # Get issueType Metadata raw data by given both projectId and one of the issue_type_ids
    issue_type_metadata_raw_result = get_project_issue_type_metadata(
        DOMAIN_NAME, USER_NAME, API_TOKEN, PROJECT_KEY, issue_type_ids[0]
    )

    # Step1: GET the result of the compass component has custom field of Compass
    compass_formatted_custom_field = get_custom_field(
        issue_type_metadata_raw_result["fields"], "Compass"
    )
    compass_custom_field_customid = compass_formatted_custom_field.custom_id
    compass_custom_field_fieldid = compass_formatted_custom_field.field_id

    # Step2: Get the list of related issues that contains the custom field values
    issues = get_related_issues(
        DOMAIN_NAME, USER_NAME, API_TOKEN, compass_custom_field_customid, 0, maxResults
    )
    issue_count = issues["total"]

    if issue_count > 0:
        print(
            f"Successfully retrieved {issue_count} issues in {PROJECT_KEY} project that have a Compass custom field "
            f"value.\n"
        )
        formatted_issues_dict = get_formatted_issues(
            issues["issues"], compass_custom_field_fieldid
        )
        # Loop through pagination requests to get all issues
        number_loop = issue_count // maxResults
        for i in range(0, number_loop):
            start_at = (i + 1) * maxResults
            cur_issues = get_related_issues(
                DOMAIN_NAME, USER_NAME, API_TOKEN, compass_custom_field_customid, start_at, maxResults
            )
            cur_formatted_issues_dict = get_formatted_issues(
                cur_issues["issues"], compass_custom_field_fieldid
            )
            formatted_issues_dict.update(cur_formatted_issues_dict)
    else:
        print(
            f"The project: {PROJECT_KEY} doesn't have issues related to Compass custom fields."
        )
        quit()

    # Step3: Get the list of related components' details
    components = get_related_components(issue_type_metadata_raw_result["fields"])
    if len(components) == 0:
        print(
            f"The project: {PROJECT_KEY} doesn't have allowed compass components related to Compass custom fields."
        )
        quit()
    formatted_components_dict = get_formatted_components(components)

    # Step4: Execute migration on the related issues
    # Loop through Issues and update each issue with component value
    for issue in formatted_issues_dict:
        update_issue(
            DOMAIN_NAME,
            USER_NAME,
            API_TOKEN,
            issue,
            formatted_issues_dict[issue].custom_field_value,
            formatted_issues_dict[issue].existing_components,
            formatted_components_dict,
        )

    print(
        f"Successfully copied issues’ Compass custom field values to their Components field.\n"
    )


if __name__ == "__main__":
    # Ask user for the input
    DOMAIN_NAME = input("Enter your domain : ").strip()
    check_input(DOMAIN_NAME, "domain")
    USER_NAME = input("Enter your email address : ").strip()
    check_input(USER_NAME, "userName")
    print(
        "Learn how to create an API token: "
        "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/ "
    )
    API_TOKEN = getpass.getpass("Enter your API token: ").strip()
    check_input(API_TOKEN, "apiToken")
    PROJECT_KEY = input("Enter your project key : ").strip()
    check_input(PROJECT_KEY, "projectKey")
    print("\n")

    main()
