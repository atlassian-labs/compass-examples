const axios = require('axios');
const chalk = require('chalk')
require('dotenv').config()

const {GITHUB_URL, ACCESS_TOKEN, USER_EMAIL, TOKEN, TENANT_SUBDOMAIN, CLOUD_ID} = process.env
const dryRun = process.env.DRY_RUN === "1"
const createWebhooks = process.env.CREATE_WEBHOOKS === "1"

const ATLASSIAN_GRAPHQL_URL = `https://${TENANT_SUBDOMAIN}.atlassian.net/gateway/api/graphql`;

function makeGqlRequest(query) {
    const header = btoa(`${USER_EMAIL}:${TOKEN}`);
    return fetch(ATLASSIAN_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${header}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
    }).then((res) => res.json());
}

// This function looks for a component with a certain name, but if it can't find it, it will create a component.
async function putComponent(componentName, description, web_url) {
    const response = await makeGqlRequest({
        query: `
      query getComponent {
        compass @optIn(to: "compass-beta") {
          searchComponents(cloudId: "${CLOUD_ID}", query: {
            query: "${componentName}",
            first: 1
          }) {
            ... on CompassSearchComponentConnection {
              nodes {
                component {
                  id
                  name
                }
              }
            }
          }
        }
      }
      `,
    });
    const maybeResults = response?.data?.compass?.searchComponents?.nodes;

    if (!Array.isArray(maybeResults)) {
        console.error(`error fetching component for repo ${web_url} : `, JSON.stringify(response));
        throw new Error('Error fetching component');
    }

    const maybeComponentAri = maybeResults.find(
        (r) => r.component?.name === componentName
    )?.component?.id;
    if (maybeComponentAri) {
        console.log(chalk.gray(`Already added ${web_url} ... skipping`))
        return maybeComponentAri;
    } else {
        if (!dryRun) {
            const response = await makeGqlRequest({
                query: `
        mutation createComponent {
          compass @optIn(to: "compass-beta") {
            createComponent(cloudId: "${CLOUD_ID}", input: {name: "${componentName}", description: "${description}" typeId: "SERVICE", links: [{type: REPOSITORY, name: "Repository", url: "${web_url}"}]}) {
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
                throw new Error('Could not create component');
            }
            console.log(chalk.green(`New component for ${web_url} ... added ${componentName}`))
            return maybeAri;
        } else {
            console.log(chalk.yellow(`New component for ${web_url} ... would be added ${componentName} (dry-run)`))
            return;
        }
    }
}

async function listAllOrgs() {
    let instanceOrganizations = []
    let page = 1;
    const perPage = 100; // Maximum items per page as allowed by GitHub Enterprise Server API

    while(true) {
        try {
            const response = await axios.get(`${GITHUB_URL}/api/v3/organizations`, {
                params: {
                    per_page: perPage,
                    page: page,
                },
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Accept': 'application/vnd.github+json',
                },
            });

            const orgs = response.data;
            instanceOrganizations = [...orgs, ...instanceOrganizations];

            if(orgs.length < perPage) {
                break;
            }

            page++;
        } catch (error) {
            console.error(`Error fetching organizations on page ${page}:`, error);
            break;
        }
    }

    return instanceOrganizations;
}

async function createOrgWebhooks(orgs) {
    if(!dryRun) {
        for (const org of orgs) {
            const webhookName = `${org.login} webhook`
            const response = await makeGqlRequest({
                query: `
        mutation MyMutation {
          compass @optIn(to: "compass-beta"){
            createIncomingWebhook(input: {cloudId: "${CLOUD_ID}", name: "${webhookName}", source: "github_enterprise_server"}) {
              success
              errors {
                message
                extensions {
                  statusCode
                  errorType
                }
              }
              webhookDetails {
                id
              }
            }
          }
        }`,
            });

            const maybeId = response?.data.compass?.createIncomingWebhook?.webhookDetails?.id
            const isSuccess = response?.data.compass?.createIncomingWebhook?.success

            if (!isSuccess || !maybeId) {
                console.error(`error creating incoming webhook: `, JSON.stringify(response));
                throw new Error('Could not create incoming webhook');
            }

            console.log(chalk.green(`New compass incoming webhook for organization "${org.login}" created`))

            const webhookId = maybeId.substring(maybeId.lastIndexOf('/') + 1)
            const webhookUrl = `https://${TENANT_SUBDOMAIN}.atlassian.net/gateway/api/compass/v1/webhooks/${webhookId}`


            const githubResponse = await axios.post(
                `${GITHUB_URL}/api/v3/orgs/${org.login}/hooks`,
                {
                    name: 'web',
                    config: {
                        url: `${webhookUrl}`,
                        content_type: 'json',
                    },
                    events: ['deployment_status', 'workflow_run', 'push']
                },
                {
                    headers: {
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                        'Accept': 'application/vnd.github+json',
                    },
                }
            );

            if (githubResponse.status !== 201) {
                console.error(`error creating github webhook: `, JSON.stringify(response));
                throw new Error('Could not create github webhook');
            }

            console.log(chalk.green(`New GitHub webhook for organization "${org.login}" created`))
        }
    } else {
        for ( const org of orgs){
            console.log(chalk.yellow(`New incoming webhook for organization "${org.login}" ... would be added (dry-run)`));
        }
        return;
    }
}

async function listAllRepos() {
    const instanceOrganizations = await listAllOrgs()

    if(createWebhooks) {
        try {
            await createOrgWebhooks(instanceOrganizations)
        } catch (error) {
            console.error(`Error establishing webhooks for GitHub Organizations: `, error);
        }
    }

    let page = 1;
    const perPage = 100; // Maximum items per page as allowed by GitHub Enterprise Server API

    for (const org of instanceOrganizations) {
        while(true) {
            try {
                // Fetch repos for the current page
                const response = await axios.get(`${GITHUB_URL}/api/v3/orgs/${org.login}/repos`, {
                    params: {
                        per_page: perPage,
                        page: page,
                    },
                    headers: {
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                        'Accept': 'application/vnd.github+json',
                    },
                });

                const repos = response.data;

                // Inner loop: Iterate over repos on the current page
                for (const repo of repos) {
                    // need a filter, add one here!
                    /*
                    Example, skip is repo name is "hello-world"
                    if (repo.name !== 'hello-world')
                     */
                    if (true) {
                        await putComponent(repo.name, repo.description || '', repo.html_url)
                    }
                }

                //Check if we fetched all repos
                if(repos.length < perPage) {
                    break; //Break out of pagination loop
                }

                page++;//Fetch the next page
            } catch (error) {
                console.error(`Error fetching repositories for org: ${org.login} on page ${page}:`, error);
                break;
            }
        }
    }
}

listAllRepos()