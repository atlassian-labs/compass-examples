#!/usr/bin/env python3

import getpass
import json
import time

import requests
from requests.auth import HTTPBasicAuth
from requests.exceptions import HTTPError


class Issue:
    """
    Issue represents a Jira issue and the fields we need to copy data.
    """

    def __init__(self, id, components):
        """
        :param id: Issue ID.
        :param components: Raw list of issues from Jira.
        """
        self.id = id
        self.existing_components = [component["name"] for component in components]


def check_input(input_string, input_type):
    """
    Quick way to validate our input as strings.
    :param input_string: the raw input string.
    :param input_type: the type of input, e.g domainName.
    :return: None
    """
    if not bool(input_string):
        print("Please provide a valid " + input_type + ".")
        quit()


def get_issues_with_components_for_project(
    domain_name, user_name, api_token, start_at=0, max_results=100
):
    """
    Calls Jira REST APIs to fetch a list of issues in a specific project whose component field is not empty.
    :param domain_name: Site URL.
    :param user_name: Usually your Atlassian email.
    :param api_token: API token generated for your site.
    :param start_at: Where we start pagination.
    :param max_results: The maximum number of issues to fetch in this call.
    :return: List
    """
    url = (
        domain_name + f"/rest/api/3/search?"
        f"jql=component%20is%20not%20EMPTY%20and%20project%20%3D%20{PROJECT_NAME}"
        f"&startAt={start_at}"
        f"&maxResults={max_results}"
    )
    auth = HTTPBasicAuth(user_name, api_token)
    headers = {"Accept": "application/json"}

    try:
        response = requests.get(url, auth=auth, headers=headers)
        if response.ok:
            return response.json()
        else:
            response.raise_for_status()
    except HTTPError as e:
        print(
            f"Couldn't retrieve issues due to an HTTP error. Please try again."
            f"\nError: {e}"
        )
        quit()
    except Exception as e:
        print(
            f"Couldn't retrieve issues due to an unknown error. Please try again."
            f"\nError: {e}"
        )
        quit()


def update_issue(domain_name, user_name, api_token, issue_id, cf_value):
    """
    Sets a custom field for an issue_id.
    :param domain_name: Site URL.
    :param user_name: Usually your Atlassian email.
    :param api_token: API token generated for your site.
    :param issue_id: The issue to update.
    :param cf_value: The value to set on the custom field.
    :return: None
    """
    url = (
        domain_name
        + f"/rest/api/3/issue/{issue_id}?notifyUsers=false&overrideScreenSecurity=false&overrideEditableFlag=false&returnIssue=true"
    )
    auth = HTTPBasicAuth(user_name, api_token)
    headers = {"Accept": "application/json", "Content-Type": "application/json"}

    data = {
        "fields": {
            NEW_CUSTOM_FIELD_ID: cf_value,
        }
    }

    try:
        response = requests.put(url, auth=auth, headers=headers, data=json.dumps(data))
        if not response.ok:
            print(
                f"Couldn't copy issueId: {issue_id} issue's Jira component value to custom field."
                f"\nPlease try again."
                f"\nError: {response.text}"
            )
    except Exception as e:
        print(
            f"Couldn't copy issueId: {issue_id} issue's Jira component value to new custom field due to an error."
            f"\nPlease try again."
            f"\nError: {e}"
        )


def main():
    issues_with_components: list[Issue] = []
    has_more = True
    start_at = 0
    page_size = 100

    while has_more is True:
        result = get_issues_with_components_for_project(
            DOMAIN_NAME, USER_NAME, API_TOKEN, start_at, page_size
        )
        issues_with_components += [
            Issue(issue["id"], issue["fields"]["components"])
            for issue in result["issues"]
        ]
        start_at += page_size

        if result["total"] < start_at:
            has_more = False
        else:
            # Give API time to rest.
            time.sleep(0.5)

    # If there are no issues with components, we're done.
    if len(issues_with_components) == 0:
        print(
            f"The project: {PROJECT_NAME} doesn't have issues with Jira components set."
        )
        quit()

    print(
        f"Successfully retrieved {len(issues_with_components)} issues in {PROJECT_NAME} project that have Jira "
        f"components set"
    )

    # Update issues.
    for issue in issues_with_components:
        update_issue(
            DOMAIN_NAME,
            USER_NAME,
            API_TOKEN,
            issue.id,
            issue.existing_components,
        )
        # Give time for API to rest.
        time.sleep(0.1)

    print(f"Successfully copied issues’ Jira component values to new custom field.\n")


if __name__ == "__main__":
    DOMAIN_NAME = input("Enter your domain : ").strip()
    check_input(DOMAIN_NAME, "domain")
    USER_NAME = input("Enter your email address : ").strip()
    check_input(USER_NAME, "userName")
    API_TOKEN = getpass.getpass("Enter your API token: ").strip()
    check_input(API_TOKEN, "apiToken")
    PROJECT_NAME = input("Enter your project name (exact) : ").strip()
    check_input(PROJECT_NAME, "projectName")
    NEW_CUSTOM_FIELD_ID = input(
        "Enter the ID of the custom field you'd like data moved to : "
    ).strip()
    check_input(NEW_CUSTOM_FIELD_ID, "newCustomFieldId")
    print("\n")

    main()
