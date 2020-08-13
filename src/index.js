'use strict';

const fs = require('fs');
const path = require('path');
const isEmpty = require('lodash/isEmpty');
const defaultEncoding = 'utf-8';
const configKey = 'serverless-offline-env';

class ServerlessOfflineEnv {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.config = this.generateConfig(options);
    this.maybeSetGlobalPath();

    // noinspection JSUnusedGlobalSymbols
    this.hooks = {
      'before:offline:start:init': this.run.bind(this),
    };
  }

  generateConfig(options = {}) {
    // Only env- prefixed values are accepted and are available without `env-` prefix, will expand this later
    const config = {};
    for (const [key, value] of Object.entries(options)) {
      if (!key.startsWith('env-')) {
        continue;
      }
      config[key.slice(4)] = value;
    }

    const hasYmlConfig = _ => {
      return typeof this.serverless.service !== 'undefined'
        && typeof this.serverless.service.custom !== 'undefined'
        && typeof this.serverless.service.custom[configKey] !== 'undefined'
      ;
    };

    if (!hasYmlConfig()) {
      return config;
    }

    for (const [key, value] of Object.entries(this.serverless.service.custom[configKey])) {
      config[key] = value;
    }
    return config;
  }

  maybeSetGlobalPath() {
    const { config = {} } = this;
    const hasEnvironment = () => {
      return typeof config.environment === 'object'
        && config.environment !== null
        && !isEmpty(config.environment)
      ;
    };

    if (typeof config.path !== 'undefined' || hasEnvironment()) {
      return;
    }

    const shouldHavePath = obj => {
      return (Array.isArray(obj.include) && obj.include.length > 0)
        || (Array.isArray(obj.exclude) && obj.exclude.length > 0)
      ;
    };

    if (shouldHavePath(this.config)) {
      this.config.path = '.env';
    }
  }

  run() {
    this.serverless.service = this.serverless.service || {};
    this.serverless.service.provider = this.serverless.service.provider || {};
    this.serverless.service.provider.environment = this.serverless.service.provider.environment || {};

    // Global
    this.append(this.config, this.serverless.service.provider, 'Global');

    // Functions
    Object.keys(this.serverless.service.functions || {}).forEach(name => {
      if (typeof this.config.functions ==='undefined' || typeof this.config.functions[name] === 'undefined') {
        return;
      }
      this.serverless.service.functions[name].environment = this.serverless.service.functions[name].environment || {};
      this.append(this.config.functions[name], this.serverless.service.functions[name], `Function ${name}`);
    });
  }

  envByPath({ context ='', filePath = '', environment = {}, encoding = defaultEncoding }) {
    this.serverless.cli.log(`Env: ${context}: reading env variables from ${filePath} (${encoding})`);
    filePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(filePath)) {
      this.serverless.cli.warn(`Env: ${context}: env file was not was not found at ${filePath}`);
      return {};
    }

    this.serverless.cli.log(`Env: ${context}: reading env variables from ${filePath} (${encoding})`);
    return fs.readFileSync(filePath, { encoding }).split('\n').reduce((accumulator, line) => {
      const match = line.trim().match(/^([\w.-]+)\s*=\s*(.*)$/)
      if (!match) {
        return accumulator;
      }

      const [ , key, value ] = match;
      // Filter comments
      if (key.startsWith('#')) {
        return accumulator;
      }

      return {
        ...accumulator,
        [key]: value.replace(/(^['"]|['"]$)/g, '').trim(), // Remove quotes and whitespace
      };
    }, environment);
  }

  filterEnv({ environment = {}, exclude = [], include = [] }) {
    const isIncludeMode = Array.isArray(include) && include.length > 0;
    const isExcludeMode = Array.isArray(exclude) && exclude.length > 0;

    if (!isIncludeMode && !isExcludeMode) {
      return environment;
    }

    const shouldDelete = key => {
      return (isIncludeMode && !include.includes(key)) || (isExcludeMode && exclude.includes(key));
    };

    Object.keys(environment).forEach(key => {
      if (shouldDelete(key)) {
        delete environment[key];
      }
    });
    return environment;
  }

  append(from = {}, to = {}, context = '') {
    let environment = {};
    if (typeof from.path !== 'undefined' && from.path.length > 0) {
      environment = this.envByPath({
        context,
        filePath: from.path,
        environment,
      });
    }

    environment = this.filterEnv({
      environment,
      exclude: from.exclude || [],
      include: from.include || [],
    });

    Object.entries({ ...environment, ...from.environment || {} }).forEach(([ key, value ]) => {
      let replaceMsg = '';
      if (typeof from.replace !== 'undefined' && typeof from.replace[key] !== 'undefined') {
        replaceMsg = ` using ${key} as ${from.replace[key]},`
        key = from.replace[key];
      }
      this.serverless.cli.log(`Env:${context !== ''? ` ${context}:` : ``}${replaceMsg} setting "${key}":"${value}"`);
      to.environment[key] = value;
    });
  }
}

module.exports = ServerlessOfflineEnv;
