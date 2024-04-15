Use this script to copy values in your issues' Jira components to another existing custom field.
This is useful if your in the process of migrating Jira components to Compass components and what to have a backup.

## Before you begin
You'll need to prepare an API token for your Atlassian account. Learn how:  https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/

Other things you'll need:
* Your site URL.
* The exact project name you'd like to run this script for, like `Acme Software`.
* The ID of the custom field you'd like to copy your data into. [Learn how](https://support.atlassian.com/jira-cloud-administration/docs/create-a-custom-field/)
* * The ID should have a format like: `customfield_12345`
* * Make sure the custom field is the right type. The custom field should be a **Labels** custom field.

## Local environment setup
Install Python3: 
```shell
brew install python3
```

Install PIP3: 
```shell
python3 -m pip install --upgrade pip
```

Ensure you have a working python and pip:
```shell
python3 --version
python3 -m pip --version
```

Install script requirements: 
```shell
pip3 install -r requirements.txt
````

## How to run locally
```shell
python3 ./jira_components_to_jira_custom_field.py
```
