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

listAllProjects();