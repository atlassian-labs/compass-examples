# compass-examples

[![Atlassian license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square)](LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

> This repo is used for sharing example [Atlassian Forge apps](https://developer.atlassian.com/platform/forge/) and code snippets for [Atlassian Compass](https://www.atlassian.com/software/compass). Compass was built from the ground up with extensibility in mind so you can build the ultimate developer experience platform. Learn more about [building apps for Compass](https://developer.atlassian.com/cloud/compass/integrations/get-started-integrating-with-Compass/) using Forge the Atlassian serverless app development platform, our open-by-default [Compass APIs](https://developer.atlassian.com/cloud/compass/graphql/), and our [Compass Forge modules](https://developer.atlassian.com/platform/forge/manifest-reference/modules/index-compass/) that provide boilerplate to help you get started building faster.

## Examples

> Details about each example found in this repo are below. Each directory contains a README with additional information/instructions about using each example.

| Example | Description | 
| ------- | ----------- |
| [dataProvider + events + metrics sample app]() | A sample application that demonstrates how to use the [dataProvider module](https://developer.atlassian.com/platform/forge/manifest-reference/modules/compass-data-provider/), emit [component events](https://developer.atlassian.com/cloud/compass/components/send-events-using-rest-api/) to Compass, and create/update [component metrics](https://developer.atlassian.com/cloud/compass/components/create-connect-and-view-component-metrics/). [Tutorial on using this sample app](https://developer.atlassian.com/cloud/compass/integrations/create-a-data-provider-app/).|
| [UI extension points sample app](https://bitbucket.org/atlassian/forge-compass-component-details/src/main/) | This app demonstrates how to extend the Compass web UI by rendering "Hello, World!" in all available UI extension points within the product. Each UI extension points is a Forge module you can [learn more about here](https://developer.atlassian.com/platform/forge/manifest-reference/modules/index-compass/).|
| [Web trigger example app](https://bitbucket.org/atlassian/forge-compass-webtrigger/) | A sample app that demonstrates how to use [Forge webtriggers](https://developer.atlassian.com/platform/forge/manifest-reference/modules/web-trigger/) and [the Compass admin page UI extension point module](https://developer.atlassian.com/platform/forge/manifest-reference/modules/compass-admin-page/). It contains a Forge app written in Javascript that creates a "Message of the day" web trigger and a sample `curl` command to post a message to it. After the command is run, the [web trigger event](http://developer.atlassian.com/platform/forge/events-reference/web-trigger/) is invoked. Then the posted message is stored using the [Storage API](https://developer.atlassian.com/platform/forge/runtime-reference/storage-api/). Finally, the message is displayed to the user on the Compass admin page using [UI Kit](https://developer.atlassian.com/platform/forge/ui-kit/).|
| [GitLab app for Compass](https://github.com/atlassian-labs/gitlab-for-compass) | Not hosted in this repo but [the GitLab app for Compass is fully open source](https://github.com/atlassian-labs/gitlab-for-compass) and is a great "production ready" app to use as a reference.|

## Handy links

- [Compass Forge modules](https://developer.atlassian.com/platform/forge/manifest-reference/modules/index-compass/)
- [GraphQL API](https://developer.atlassian.com/cloud/compass/graphql/#queries_component)

## Contributions

Contributions are welcome! We're open to improving upon any existing examples and accepting new examples from the community that may help other Compass users. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

Copyright (c) 2023 Atlassian US., Inc.
Apache 2.0 licensed, see [LICENSE](LICENSE) file.

<br/>

[![With ❤️ from Atlassian](https://raw.githubusercontent.com/atlassian-internal/oss-assets/master/banner-cheers-light.png)](https://www.atlassian.com)
