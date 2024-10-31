## Bootstrap your Compass Catalog with from a Self-Hosted GitLab Instance

This script
1. Iterates over all your GitLab projects
2. Can create incoming webhooks for each organization
3. Creates Compass Components for each of them
4. Connects your GitLab repo and Readme to that Component


## Install

You'll need node and npm to run this script

```
git clone https://github.com/acunniffe/compass-gitlab
cd compass-gitlab
npm install
```

## Credentials
Create a `.env` file and fill in the blanks. This file should be ignored by git already since it is in the `.gitignore`
```
# Replace these with your GitLab instance URL and access token
GITLAB_URL='<your gitlab>'
ACCESS_TOKEN='<an access token for gitlab scoped to group or individual>'
USER_EMAIL='<atlassian email>'
# https://id.atlassian.com/manage-profile/security/api-tokens
TOKEN='<atlassian token>'
# Add your subdomain here - find it from the url - e.g. https://<southwest>.atlassian.net
TENANT_SUBDOMAIN='<subdomain>'
# The UUID for your cloud site. This can be found in ARIs - look at the first uuid ari:cloud:compass:{cloud-uuid}
CLOUD_ID='<cloud uuid>'
```
## Create incoming webhooks
Create incoming webhooks in order to enable the ingestion of events and metrics from your GitLub instance
```
CREATE_WEBHOOKS=1 node index.js
```
Output:
```
New GitLub webhook for group "myGroup1" created
New GitLub webhook for group "myGroup2" created
New component for https://gitlab.com/hyde.me/test_gb_less3_2 ... added hyde.me/test_gb_less3_2
New component for https://gitlab.com/sachintomar009/reposetup ... added sachintomar009/reposetup
New component for https://gitlab.com/brianwilliamaldous/api-la ... added brianwilliamaldous/api-la
New component for https://gitlab.com/cloud-group3072118/timely ... added cloud-group3072118/timely
```
## Do a dry run
Preview what Repos the script will add to Compass. You don't need to wait until it's done - CTRL-C once you are comfortable.
```
DRY_RUN=1 node index.js
```

Output:
```
New component for https://gitlab.com/hyde.me/test_gb_less3_2 ... would be added hyde.me/test_gb_less3_2 (dry-run)
New component for https://gitlab.com/sachintomar009/reposetup ... would be added sachintomar009/reposetup (dry-run)
New component for https://gitlab.com/brianwilliamaldous/api-la ... would be added brianwilliamaldous/api-la (dry-run)
New component for https://gitlab.com/cloud-group3072118/timely ... would be added cloud-group3072118/timely (dry-run)
....

```


By default, all repos will be added. If you see some repos you don't want to import during the dry-run? Modify `index.js` to add some filters. There is a lot of metadata in the `project` variable. Read the API docs here: https://docs.gitlab.com/ee/api/projects.html

```javascript
for (const project of projects) {

    // need a filter, add one here!
    /*
    Example, skip user's 'home' repos
    if (project.path !== 'home')
     */
    if (true) {
        await putComponent(project.path_with_namespace, project.web_url, project.readme_url)
    }

}

```

## Ready to import?
Remove `DRY_RUN=1` to run the CLI in write mode.
```
node index.js
```

If your connection is interrupted, or you want to re-run after the initial import you can. It checks for duplicates and skips them:

```
Already added https://gitlab.com/VishnuprakashJ/home ... skipping
```