# Migrate Jira Project components to Compass

Use this script to migrate your existing project components along with issues the components are used on to Compass.

**This script is idempotent**. You can run it multiple times.
It will only create components that do not already exist in Compass.
It will update the components field on issues and replace the Jira component on those issues with the corresponding Compass component matching the name. 
By default, it will create Compass components with type SERVICE. 
You can change the type of the components later from Compass UI.

_In case of any failures due to rate limit or error, re-run the script to migrate remaining components._

## Prerequisites

This script will work on projects that meet following criteria:

* It is a company managed project
* Compass Components are turned on for the project

## How to run the script
Install python3 and then install the dependencies by running the following command:

```bash
pip install -r requirements.txt
```

Run the script with 

```bash
python3 migrateJiraComponentsToCompassComponents.py
```

The script is interactive and will ask you for the following information:

* Jira site hostname (e.g. `mycompany.atlassian.net`)
* email address
* API token (you can generate one [here](https://id.atlassian.com/manage-profile/security/api-tokens))
* Project key (e.g. `PROJ`)
