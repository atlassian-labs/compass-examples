const axios = require('axios');
const chalk = require('chalk')
require('dotenv').config()


const {GITLAB_URL, ACCESS_TOKEN, USER_EMAIL, TOKEN, TENANT_SUBDOMAIN, CLOUD_ID} = process.env
const dryRun = process.env.DRY_RUN === "1"

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
async function putComponent(componentName, description, web_url, readme) {
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
        console.error(`error fetching component: `, JSON.stringify(response));
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


            const readmeLink = readme ? `, {type: DOCUMENT, name: "ReadMe", url: "${readme}"}` : ''
            const response = await makeGqlRequest({
                query: `
        mutation createComponent {
          compass @optIn(to: "compass-beta") {
            createComponent(cloudId: "${CLOUD_ID}", input: {name: "${componentName}", description: "${description}" typeId: "OTHER", links: [{type: REPOSITORY, name: "Repository", url: "${web_url}"}${readmeLink}]}) {
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

async function listAllGroups() {
    let instanceGroups = []
    let page = 1;
    const perPage = 100; // Maximum items per page as allowed by GitLab API

    while (true) {
        try {
            // Fetch groups for the current page
            const response = await axios.get(`${GITLAB_URL}/api/v4/groups`, {
                params: {
                    per_page: perPage,
                    page: page,
                    simple: true,
                    top_level_only: true,
                    // order_by: 'name',
                    // sort: 'asc'
                },
                headers: {
                    'Private-Token': ACCESS_TOKEN,
                },
            });

            const groups = response.data;
            instanceGroups = [...groups, ...instanceGroups];

            // Check if we've reached the last page
            if (groups.length < perPage) {
                break; // Exit the pagination loop
            }

            page++; // Move to the next page
        } catch (error) {
            console.error(`Error fetching groups on page ${page}:`, error);
            break;
        }
    }

    if (!dryRun) {
        for (const group of instanceGroups) {
            const webhookName = `${group.name} webhook`
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

            console.log(chalk.green(`New compass incoming webhook for organization "${group.name}" created`))

            const webhookId = maybeId.substring(maybeId.lastIndexOf('/') + 1)
            const webhookUrl = `https://${TENANT_SUBDOMAIN}.atlassian.net/gateway/api/compass/v1/webhooks/${webhookId}`

            const gitlabResponse = await axios.post(
                `${GITLAB_URL}/api/v4/groups/${group.id}/hooks`,
                {
                    url: webhookUrl,
                    name: 'web',
                    push_events: true,
                    deployment_events: true,
                    pipeline_events: true,
                },
                {
                    headers: {
                        'Private-Token': ACCESS_TOKEN,
                        'Accept': 'application/json',
                    },
                }
            );

            if (gitlabResponse.status !== 201) {
                console.error(`error creating gitlab webhook: `, JSON.stringify(response));
                throw new Error('Could not create gitlab webhook');
            }

            console.log(chalk.green(`New GitLab webhook for organization "${group.name}" created`))
        }
    } else {
        for ( const group of instanceGroups){
            console.log(chalk.yellow(`New incoming webhook for organization "${group.name}" ... would be added (dry-run)`));
        }
        return;
    }
}


async function listAllProjects() {
    let instanceProjects = 0
    let page = 1;
    const perPage = 100; // Maximum items per page as allowed by GitLab API
    while (true) {
        try {
            // Fetch projects for the current page
            const response = await axios.get(`${GITLAB_URL}/api/v4/projects`, {
                params: {
                    per_page: perPage,
                    page: page,
                    simple: true,
                    // order_by: 'name',
                    // sort: 'asc'
                },
                headers: {
                    'Private-Token': ACCESS_TOKEN,
                },
            });

            const projects = response.data;
            console.log(`Pulled projects ${instanceProjects} - ${instanceProjects+projects.length}`)
            // Inner loop: Iterate over projects on the current page
            for (const project of projects) {

                // need a filter, add one here!
                /*
                Example, skip user's 'home' repos
                if (project.path !== 'home')
                 */
                if (true) {
                    await putComponent(project.path_with_namespace, project.description || '', project.web_url, project.readme_url)
                }

            }

            // Check if we've reached the last page
            if (projects.length < perPage) {
                break; // Exit the pagination loop
            }

            page++; // Move to the next page
        } catch (error) {
            console.error(`Error fetching projects on page ${page}:`, error);
            break;
        }
    }
}

listAllGroups();
// listAllProjects();