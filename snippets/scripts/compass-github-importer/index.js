const axios = require('axios');
const chalk = require('chalk')
require('dotenv').config()

const {GITHUB_URL, ACCESS_TOKEN, USER_EMAIL, TOKEN, TENANT_SUBDOMAIN, CLOUD_ID} = process.env
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

async function listAllRepos() {
    const instanceOrganizations = await listAllOrgs()
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