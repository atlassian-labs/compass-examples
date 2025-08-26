const chalk = require("chalk");
require("dotenv").config();

const {
  NEW_RELIC_URL,
  NEW_RELIC_API_TOKEN,
  USER_EMAIL,
  TOKEN,
  TENANT_SUBDOMAIN,
  CLOUD_ID,
} = process.env;
const dryRun = process.env.DRY_RUN === "1";

const ATLASSIAN_GRAPHQL_URL = `https://${TENANT_SUBDOMAIN}.atlassian.net/gateway/api/graphql`;

function makeGqlRequest(query) {
  const header = btoa(`${USER_EMAIL}:${TOKEN}`);
  return fetch(ATLASSIAN_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${header}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  }).then((res) => res.json());
}

function makeNewRelicGqlRequest(query) {
  return fetch(NEW_RELIC_URL, {
    method: "POST",
    headers: {
      "Api-Key": NEW_RELIC_API_TOKEN,
      "Content-type": "application/json",
    },
    body: JSON.stringify(query),
  }).then((res) => res.json());
}

const formatTag = (key, value) => {
  const k = key.toLowerCase().trim().replace(/\s+/, "-");
  const v = value.toLowerCase().trim().replace(/\s+/, "-");
  return `${k}:${v}`;
};

const newRelicTagsToCompassLabels = (tags) => {
  const results = [];
  if (!tags || tags.length === 0) {
    return results;
  }
  // Tags need to be lowercase, contain no spaces, for API.
  tags
    .filter((tag) => tag.key && tag.values && tag.key.trim().length > 0)
    .filter((tag) => !tag.key.toLowerCase().includes("account"))
    .filter((tag) => !(tag.key.toLowerCase() === "guid"))
    .forEach((tag) => {
      tag.values.forEach((v) => {
        if (v && v.trim().length > 0) {
          results.push(formatTag(tag.key, v));
        }
      });
    });

  // API requires labels to be shorter than 40 characters.
  return results.filter((t) => t.length < 40);
};

// This function looks for a component with a certain name, but if it can't find it, it will create a component.
async function putComponent(
  componentName,
  description,
  url,
  externalSource,
  externalId,
  labels
) {
  const response = await makeGqlRequest({
    query: `
      query componentByExternalAlias {
        compass {
          componentByExternalAlias(cloudId: "${CLOUD_ID}", externalSource: "${externalSource}", externalID: "${externalId}") {
            ... on CompassComponent {
                id
                name
            }
            ... on QueryError {
                message
                extensions {
                    statusCode
                    errorType
                }
            }
          }
        }
      }
      `,
  });

  const maybeResults = response?.data?.compass?.componentByExternalAlias;

  if (
    maybeResults?.message &&
    maybeResults?.message !== "Component not found"
  ) {
    console.error(
      `error fetching component for app ${url} : `,
      JSON.stringify(response)
    );
    throw new Error("Error fetching component");
  }

  const maybeComponentAri = maybeResults?.id;

  if (maybeComponentAri) {
    console.log(chalk.gray(`Already added ${url} ... skipping`));
    return maybeComponentAri;
  } else {
    if (!dryRun) {
      const response = await makeGqlRequest({
        query: `
        mutation createComponent {
          compass @optIn(to: "compass-beta") {
            createComponent(cloudId: "${CLOUD_ID}", input: {name: "${componentName}", description: "${description}" typeId: "SERVICE", labels: ${labels}, links: [{type: DASHBOARD, name: "New Relic", url: "${url}"}]}) {
              success
              componentDetails {
                id
              }
            }
          }
        }`,
      });

      const maybeAri =
        response?.data.compass?.createComponent?.componentDetails?.id;
      const isSuccess = !!response?.data.compass?.createComponent?.success;
      if (!isSuccess || !maybeAri) {
        console.error(`error creating component: `, JSON.stringify(response));
        throw new Error("Could not create component");
      }

      const componentDetails =
        response?.data.compass?.createComponent.componentDetails;

      const createExternalAliasResponse = await makeGqlRequest({
        query: `
        mutation createCompassComponentExternalAlias {
            compass @optIn(to: "compass-beta") {
                createComponentExternalAlias(input: {componentId: "${componentDetails.id}", externalAlias: {externalSource:"${externalSource}", externalId:"${externalId}"}}) {
                    success
                    errors {
                        message
                    }
                }
            }
        }`,
      });

      const isCreateExternalAliasSuccess =
        createExternalAliasResponse?.data.compass?.createComponentExternalAlias
          ?.success;
      if (!isCreateExternalAliasSuccess) {
        console.error(
          `error creating component's external alias: `,
          JSON.stringify(createExternalAliasResponse)
        );
        throw new Error("Could not create component's external alias");
      }

      console.log(
        chalk.green(
          `New component with external alias for ${url} ... added ${componentName}`
        )
      );

      return maybeAri;
    } else {
      console.log(
        chalk.yellow(
          `New component for ${url} ... would be added ${componentName} (dry-run)`
        )
      );
      return;
    }
  }
}

async function listAllApps() {
  const apps = [];

  const response = await makeNewRelicGqlRequest({
    query: `
    {
        actor {
          entitySearch(queryBuilder: {type: APPLICATION}) {
          count
          results {
              nextCursor
              entities {
              name
              entityType
              guid
              permalink
              ... on ApmApplicationEntityOutline {
                  language
              }
              tags {
                  key
                  values
                }
              }
            }
          }
        }
    }`,
  });

  let cursor = response?.data?.actor?.entitySearch?.results?.nextCursor;
  const entities = response?.data?.actor?.entitySearch?.results?.entities;
  apps.push(...entities);

  while (cursor) {
    const response = await makeNewRelicGqlRequest({
      query: `
    {
        actor {
            entitySearch(queryBuilder: {type: APPLICATION}) {
                count
                results (cursor: "${cursor}) {
                    nextCursor
                    entities {
                    name
                    entityType
                    guid
                    permalink
                    ... on ApmApplicationEntityOutline {
                        language
                    }
                    tags {
                        key
                        values
                    }
                    }
                }
            }
        }
    }`,
    });

    const entites = response?.data?.actor?.entitySearch?.results?.entities;
    apps.push(...entites);
    cursor = response?.data?.actor?.entitySearch?.results?.nextCursor;
  }

  return apps;
}

async function importAllApps() {
  const apps = await listAllApps();

  try {
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
  } catch (e) {
    console.error(`Error importing apps`, e);
  }
}

importAllApps();
