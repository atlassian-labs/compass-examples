# compass-examples

[![Atlassian license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square)](LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

> This repo is used for sharing example [Atlassian Forge apps](https://developer.atlassian.com/platform/forge/) & SDK code snippets, as well as code snippets for interacting with the [Atlassian Compass](https://www.atlassian.com/software/compass) API (GraphQL & REST). Compass was built from the ground up with extensibility in mind so you can build [the ultimate developer experience platform](https://www.youtube.com/watch?v=F92QM_3u0gw). Learn more about [building apps for Compass](https://developer.atlassian.com/cloud/compass/integrations/get-started-integrating-with-Compass/) using the Atlassian serverless app development platform Forge, our open-by-default [Compass APIs](https://developer.atlassian.com/cloud/compass/graphql/), and our [Compass Forge modules](https://developer.atlassian.com/platform/forge/manifest-reference/modules/index-compass/) that provide boilerplate to help you get started building faster.

## Examples

> Details about each example found in this repo are below. Each directory contains a README with additional information/instructions about using each example.

| Example | Description | 
| ------- | ----------- |
| [dataProvider + events + metrics sample app](apps/sample-dataprovider-app-statuspage/) | A sample application that demonstrates how to use the [dataProvider module](https://developer.atlassian.com/platform/forge/manifest-reference/modules/compass-data-provider/) to create [event](https://developer.atlassian.com/cloud/compass/components/send-events-using-rest-api/) and [metric](https://developer.atlassian.com/cloud/compass/components/create-connect-and-view-component-metrics/) sources, then update events and metrics with a [webhook](https://developer.atlassian.com/platform/forge/manifest-reference/modules/web-trigger/). [Tutorial on creating a data provider app](https://developer.atlassian.com/cloud/compass/integrations/create-a-data-provider-app/).|
| [GraphQL Snippets](snippets/graphql/) | A collection of various GraphQL queries and mutations that have been helpful for customers. |
| [Forge GraphQL SDK Snippets](snippets/forge-graphql-sdk/) | A collection of various Forge GraphQL SDK usage examples. |
| [GitLab app for Compass](https://github.com/atlassian-labs/gitlab-for-compass) | Not hosted in this repo but [the GitLab app for Compass is fully open source](https://github.com/atlassian-labs/gitlab-for-compass) and is a great "production ready" app to use as a reference.|

## Handy links

- [Get started integrating with Compass](https://developer.atlassian.com/cloud/compass/integrations/get-started-integrating-with-Compass/)
- [Get a Compass site](https://www.atlassian.com/try/cloud/signup?bundle=compass) for development and testing
- [Compass Forge modules](https://developer.atlassian.com/platform/forge/manifest-reference/modules/index-compass/)
- [GraphQL API](https://developer.atlassian.com/cloud/compass/graphql/#overview)
- [Compass Forge SDK](https://www.npmjs.com/package/@atlassian/forge-graphql)


## Contributions

Contributions are welcome! We're open to improving upon any existing examples and accepting new examples from the community that may help other Compass users. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

Copyright (c) 2023 Atlassian US., Inc.
Apache 2.0 licensed, see [LICENSE](LICENSE) file.

<br/>

[![With ❤️ from Atlassian](https://raw.githubusercontent.com/atlassian-internal/oss-assets/master/banner-cheers-light.png)](https://www.atlassian.com)
