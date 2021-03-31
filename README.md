# ADP
ADP integration for Bridge

## Prerequisites
1. Ensure you have an account with Bridge by Smartsheet
2. Bridge extensions run on **Node.JS** `v12.15.0` on **Alpine Linux** so ensure your node development environment matches this setup. We recommend installing Node.JS via [Node Version Manager (NVM)](https://github.com/creationix/nvm).
3. Install and Authorize [Converse.AI CLI tool](https://www.npmjs.com/package/converse-cli).
4. Create a file `test/lib/registrationData.js` that contains the code below and set the values for `client_id`, `client_secret`, `cert`, and `key` from the information provided by ADP.

```
module.exports = {
    app: {
        client_id,
        client_secret,
        cert,
        key
    }
}
```

## Install
4. Create a project folder
5. Clone repo into project folder
6. Initialize extension by running `converse-cli plugin init` from your project root.
7. Run `npm test` from your project root to ensure everything was initialized correctly.
8. Run `converse-cli auth` and type in your Bridge provider url and click return.
9. Paste in your Bridge API token from your API Keys section of your account in Bridge.
10. Deploy the plugin to your Converse.AI account by running `converse-cli deploy` from your project root.
11. If there are no errors, the plugin should be available under "Custom Integrations & Utilities" in the left hand menu of the designer.
