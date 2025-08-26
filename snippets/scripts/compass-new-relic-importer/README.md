## Bootstrap your Compass Catalog from a New Relic Account

This script

1. Gets all the apps within your New Relic account
2. Creates Compass Components for each of them

## Install

You'll need node and npm to run this script

```
git clone https://github.com/atlassian-labs/compass-examples
cd snippets/scripts/compass-new-relic-importer
npm install
```

## Credentials

Create a `.env` file and fill in the blanks. This file should be ignored by git already since it is in the `.gitignore`

```
# Replace these with your NewRelic instance URL and API token
NEW_RELIC_URL='<new relic GraphQL url: https://api.newrelic.com/graphql or https://api.eu.newrelic.com/graphql>'
NEW_RELIC_API_TOKEN='<an API token for NewRelic>'
USER_EMAIL='<atlassian email>'
# https://id.atlassian.com/manage-profile/security/api-tokens
TOKEN='<atlassian token>'
# Add your subdomain here - find it from the url - e.g. https://<southwest>.atlassian.net
TENANT_SUBDOMAIN='<subdomain>'
# The UUID for your cloud site. This can be found in ARIs - look at the first uuid ari:cloud:compass:{cloud-uuid}
CLOUD_ID='<cloud uuid>'
```

## Do a dry run

Preview what App the script will add to Compass. You don't need to wait until it's done - CTRL-C once you are comfortable.

```
DRY_RUN=1 node index.js
```

Output:

```
New component with external alias for https://one.newrelic.com/redirect/entity/<entity-id> ... added test-app(dry-run)
New component with external alias for https://one.newrelic.com/redirect/entity/<entity-id> ... added test-app-1(dry-run)
....

```

By default, all apps will be added. If you notice any repositories that you don't want to import during the dry run, you can modify `index.js` to add filters accordingly.

```javascript
for (const app of apps) {
  const { entityType, guid, name, permalink, tags } = app;

  const convertedLabels = newRelicTagsToCompassLabels(tags);
  const labelNames = [
    "source:newrelic",
    `${formatTag("entitytype", entityType)}`,
    ...convertedLabels,
  ];

  await putComponent(
    name,
    app.description || "",
    permalink,
    "new-relic",
    guid,
    JSON.stringify(labelNames)
  );
}
```

## Ready to import?

Remove `DRY_RUN=1` to run the CLI in write mode.

```
node index.js
```

If your connection is interrupted, or you want to re-run after the initial import you can. It checks for duplicates and skips them:

```
Already added https://one.newrelic.com/redirect/entity/<entity-id> ... skipping
```
