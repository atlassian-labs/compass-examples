# Compass Metrics and Events Statuspage Example (Custom UI)

This project demonstrates how the webtrigger, compass:adminPage, and compass:dataProvider modules for Forge can work together to ingest metrics and events from an external source (Statuspage) to Compass.

## Getting Started

Install the dependencies:

```bash
    nvm use
    yarn

    npm install -g @forge/cli # if you don't have it already
```

Set up the Custom UI Frontend

```bash
    yarn ui:install

    # build the frontend
    yarn ui:build

    # watch the frontend
    yarn ui:start
```

Set up the Forge App

```bash
    # login to Forge (will require an API token)
    forge login

    # register the app (this will change the app ID in the manifest)
    forge register

    # deploy the app
    forge deploy [-f]
    # -f, or --no-verify , allows you to include modules in your manifest that aren't officially published in Forge yet

    # install the app on your site
    forge install [--upgrade]
    # pick "Compass" and enter your site. <*.atlassian.net>
    # --upgrade will attempt to upgrade existing installations if the scopes or permissions have changed

    # run the tunnel which will listen for changes
    forge tunnel
```

## Forge setup

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.
### Notes

- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.



