const axios = require('axios');
const chalk = require('chalk')
require('dotenv').config()

const {BITBUCKET_URL, ACCESS_TOKEN, USER_EMAIL, TOKEN, TENANT_SUBDOMAIN, CLOUD_ID} = process.env
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
            const response = await makeGqlRequest({
                query: `
        mutation createComponent {
          compass @optIn(to: "compass-beta") {
            createComponent(cloudId: "${CLOUD_ID}", input: {name: "${componentName}", description: "${description}" typeId: "OTHER", links: [{type: REPOSITORY, name: "Repository", url: "${web_url}"}]}) {
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

async function listAllProjects() {
    let instanceProjects = []
    let page = 1;
    const perPage = 100;
    let isLastPage = false

    while(!isLastPage && page < 4) {
        try {
            const response = await axios.get(`https://${BITBUCKET_URL}/rest/api/latest/projects`, {
                params: {
                    start: page,
                    limit: perPage,
                },
                headers: {
                    'Authorization': `Basic ${ACCESS_TOKEN}`,
                    'Accept': 'application/json',
                },
            });

            const projects = response.data.values;
            instanceProjects = [...projects, ...instanceProjects];

            isLastPage = response.data.isLastPage

            page++;
        } catch (error) {
            console.error(`Error fetching projects on page ${page}:`, error);
            break;
        }
    }

    return instanceProjects;
}

async function listAllRepos() {
    const instanceProjects = await listAllProjects()
    let page = 1;
    const perPage = 100;

    for (const project of instanceProjects) {
        let isLastPage = false;
        while(!isLastPage) {
            try {
                // Fetch repos for the current page
                const response = await axios.get(`https://${BITBUCKET_URL}/rest/api/latest/projects/${project.key}/repos`, {
                    params: {
                        start: page,
                        limit: perPage,
                    },
                    headers: {
                        'Authorization': `Basic ${ACCESS_TOKEN}`,
                        'Accept': 'application/json',
                    },
                });

                const repos = response.data.values;
                // Inner loop: Iterate over repos on the current page
                for (const repo of repos) {
                    // need a filter, add one here!
                    /*
                    Example, skip is repo name is "hello-world"
                    if (repo.name !== 'hello-world')
                     */
                    if (true) {
                        await putComponent(repo.name, repo.description || '', `https://${BITBUCKET_URL}/projects/${project.key}/repos/${repo.slug}`)
                    }
                }

                //Check if we fetched all repos
                isLastPage = response.data.isLastPage;

                page++;//Fetch the next page
            } catch (error) {
                console.error(`Error fetching repositories for project: ${project.name} on page ${page}:`, error);
                break;
            }
        }
    }
}

listAllRepos()