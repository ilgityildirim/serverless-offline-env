# Serverless Offline Env
This is a serverless offline plugin extension. 

It gives the ability to make local development environment easier & cleaner by reducing 
the potentially extra configuration required for local environments within `serverless.yml`.

Imagine you have environment variables defined for dev, staging and prod environments. You might need "local"
environments in order to make your local development easy.

This plugin can add / override environment variables configured in `serverless.yml` regardless of current 
environment / stage only when `serverless offline` starts.

**Why?**
* Serverless Offline plugin wasn't copying my AWS profile.
* I wanted ability to have different environment variables when I run `sls offline` (or `serverless offline`) without
adding yet another set of environment / stage variables for local.

**WARNING:** This plugin changes environment variables only for `serverless offline` when you start it. It will not
affect other `sls` commands like `deploy`.

### Documentation
* [Installation](#installation)
* [Usage](#usage)

### Installation

Install the plugin:

via yarn;
```bash
yarn add --dev serverless-offline-env
```
or using npm;
```bash
npm install --save-dev serverless-offline-env
```

Add the plugin to your `serverless.yml` file:

```yaml
plugins:
    - serverless-offline-env
    - serverless-offline
```

**Warning:** `serverless-offline-env` must be added before `serverless-offline`. Order is important.

See [usage](#usage) for options.

### Usage
#### Options
| Option       | Type   | Description                                                                              |
| -------------|--------|------------------------------------------------------------------------------------------|
| path         | string | Relative path (to the project root) of a `.env` file                                     |
| environment  | object | key - value environment variables and their values                                       |
| include      | array  | list of environment variables to include, rest of the environment variables will excluded|
| exclude      | array  | list of environment variables to be excluded                                             |
| replace      | object | replace environment variable key to given value                                          |

No option is mandatory.

* If you don't have a `path` or `environment` defined, and you use `include`, `exclude` it will attempt to load `.env`
file under the project root.
#### YAML Configuration
```yaml
custom:
  serverless-offline-env:
    # Global configuration (available for all functions)
    functions:
      myFunc:
        # Function specific configuration
```

#### CLI
When running `sls offline` command you can define path variable globally by;
```bash
sls offline --env-path .env
```

### Examples
Before we dive further in, first `.env` files can include very sensitive information. These kinds of files should never
be committed. Read [Important Topic About Env Files](#important-topic-about-env-files) for more information. 

Let's imagine we have following `.env` file;
```
ENV=dev
DATABASE_URL='http://127.0.0.1'
DATABASE_PORT=3306
DATABASE_USER=my-user
DATABASE_PASS=123456
THIS_IS_CLI_ONLY=some-cli-only-value
```

#### Example 1: Loading `.env` Globally
```yaml
custom:
  serverless-offline-env:
    path: .env
```

#### Example 2: Globally Specifying Variables
```yaml
custom:
  serverless-offline-env:
    # path / include / exclude not defined thus no file will be loaded
    environment:
      ENV: local
      DATABASE_URL: ${env:LOCAL_DATABASE_URL}
```

#### Example 3: Include Only Selected Variables
```yaml
custom:
  serverless-offline-env:
    # path is not defined, by default will attempt to load `.env` under project root
    include:
      - ENV
      - DATABASE_URL
```

#### Example 4: Exclude Selected Variables, Include Rest
```yaml
custom:
  serverless-offline-env:
    path: .env.local # instead of .env, we are specifying another file
    exclude:
      - THIS_IS_CLI_ONLY
```

#### Example 5: Replace Selected Variable Names
```yaml
custom:
  serverless-offline-env:
    path: /envs/.env.local # remember, it is relative to the project root
    replace:
      DATABASE_URL: DYNAMODB_URL
```
Now we can access in our lambda functions **DYNAMODB_URL** as environment variable instead of **DATABASE_URL**.

#### Example 6: Overwriting Variable From `.env`
```yaml
custom:
  serverless-offline-env:
    path: .env # load the file
    environment:
      ENV: local # overwrite ENV variable's value
```

#### Example 7: Function Specific
All options are available to functions as well;
```yaml
custom:
  serverless-offline-env:
    functions:
      myFunc: # function name must be the same as your functions definition.
        environment:
          BUCKET_NAME: test
```

#### Example 8: Overwrite Global Environment Variable's Value
```yaml
custom:
  serverless-offline-env:
    environment:
      BUCKET_NAME: read-only-bucket
    functions:
      myFunc: # function name must be the same as your functions definition.
        environment:
          BUCKET_NAME: write-only-bucket
```

## Important Topic About `.env` Files
This file under local development environments usually contains developer specific, sensitive information.
You should never commit this file to a repository as you would be exposing these sensetive information to the world / 
other people to see.

Remember to add your `.env` file to your `.gitignore` file.

Let's say we have `.env` under project root (don't worry, I generated these texts similar to what you would get from AWS)
```
AWS_ACCESS_KEY_ID=4T2RREEDW5EO3INFGY87
AWS_SECRET_ACCESS_KEY=VkzMCqNS/5mgQYEZavt3U8tWz8vb3tqQugAD4ttR
```

Now, we can create `.env.dist` (or something similar like `.env.example`) to clean up the sensitive information
and commit that sample file for other developers to reference it and create their own using it.

`.env.dist` file example;
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

#### Inspiration
This plugin inspired by [serverless-offline-dotenv](https://www.npmjs.com/package/serverless-offline-dotenv). I just
needed a little different approach.