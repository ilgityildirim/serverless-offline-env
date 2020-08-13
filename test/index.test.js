'use strict';

const get = require('lodash/get');
const isEmpty = require('lodash/isEmpty');
const ServerlessOfflineEnv = require('../src/');

const providerEnv = {
  provider: {
    environment: {
      ENV: 'local',
    },
  },
};

const functionEnv = {
  functions: {
    myFunc: {
      environment: {
        FOO: 'not-bar',
      },
    },
  },
};

// noinspection JSUnresolvedVariable
const serverless = {
  cli: {
    log: jest.fn(),
  },
};

const defaultEnv = {
  ENV: 'default',
  FOO: 'bar',
  AWS_KEY: 'test-123',
};

const providerConfig = {
  custom: {
    'serverless-offline-env': {
      environment: clone(defaultEnv),
    },
  },
};

const functionConfig = {
  custom: {
    'serverless-offline-env': {
      functions: {
        myFunc: {
          environment: clone(defaultEnv),
        },
      },
    },
  },
};

const providerFunctionConfig = {
  custom: {
    'serverless-offline-env': {
      environment: providerConfig.custom['serverless-offline-env'].environment,
      functions: {
        myFunc: {
          environment: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
        },
      },
    },
  },
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const cases = [
  {
    name: 'No Environment with Options',
    data: { ...serverless },
    options: {
      'env-path': `${__dirname}/.env`,
    },
    tests: {
      receive: 'service.provider.environment',
      expected: defaultEnv,
    },
  },
  {
    name: 'Provider Only with Options',
    data: {
      ...serverless,
      service: clone(providerEnv),
    },
    options: {
      'env-path': `${__dirname}/.env`,
    },
    tests: {
      receive: 'service.provider.environment',
      expected: defaultEnv,
    },
  },
  {
    name: 'Function Only with Options',
    data: {
      ...serverless,
      service: clone(functionEnv),
    },
    options: {
      'env-path': `${__dirname}/.env`,
    },
    tests: [
      {
        receive: 'service.provider.environment',
        expected: defaultEnv,
      },
      {
        receive: 'service.functions.myFunc.environment',
        expected: functionEnv.functions.myFunc.environment,
      },
    ],
  },
  {
    name: 'Provider & Function with Options',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        ...clone(functionEnv),
      },
    },
    options: {
      'env-path': `${__dirname}/.env`,
    },
    tests: [
      {
        receive: 'service.provider.environment',
        expected: defaultEnv,
      },
      {
        receive: 'service.functions.myFunc.environment',
        expected: functionEnv.functions.myFunc.environment,
      },
    ],
  },
  {
    name: 'Provider with Config',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        ...clone(providerConfig),
      },
    },
    tests: {
      receive: 'service.provider.environment',
      expected: providerConfig.custom['serverless-offline-env'].environment,
    },
  },
  {
    name: 'Provider with Config - Include',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        custom: {
          'serverless-offline-env': {
            environment: providerConfig.custom['serverless-offline-env'].environment,
            include: [
              'ENV',
            ],
          },
        },
      },
    },
    tests: {
      receive: 'service.provider.environment',
      expected: {
        ENV: providerConfig.custom['serverless-offline-env'].environment.ENV,
      },
    },
  },
  {
    name: 'Provider with Config - Exclude',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        custom: {
          'serverless-offline-env': {
            environment: providerConfig.custom['serverless-offline-env'].environment,
            exclude: [
              'FOO',
              'AWS_KEY',
            ],
          },
        },
      },
    },
    tests: {
      receive: 'service.provider.environment',
      expected: {
        ENV: providerConfig.custom['serverless-offline-env'].environment.ENV,
      },
    },
  },
  {
    name: 'Provider with Config - Replace',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        custom: {
          'serverless-offline-env': {
            environment: clone(providerConfig.custom['serverless-offline-env'].environment),
            replace: {
              FOO: 'BAR',
            },
          },
        },
      },
    },
    tests: {
      receive: 'service.provider.environment',
      expected: {
        ENV: providerConfig.custom['serverless-offline-env'].environment.ENV,
        BAR: providerConfig.custom['serverless-offline-env'].environment.FOO,
        AWS_KEY: providerConfig.custom['serverless-offline-env'].environment.AWS_KEY,
      },
    },
  },
  {
    name: 'Function with Config',
    data: {
      ...serverless,
      service: {
        ...clone(functionEnv),
        ...clone(functionConfig),
      },
    },
    tests: {
      receive: 'service.functions.myFunc.environment',
      expected: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
    },
  },
  {
    name: 'Function with Config - Include',
    data: {
      ...serverless,
      service: {
        ...clone(functionEnv),
        custom: {
          'serverless-offline-env': {
            functions: {
              myFunc: {
                environment: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
                include: [
                  'ENV',
                ],
              },
            },
          },
        },
      },
    },
    tests: {
      receive: 'service.functions.myFunc.environment',
      expected: {
        ...functionEnv.functions.myFunc.environment,
        ENV: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment.ENV,
      },
    },
  },
  {
    name: 'Function with Config - Exclude',
    data: {
      ...serverless,
      service: {
        ...clone(functionEnv),
        custom: {
          'serverless-offline-env': {
            functions: {
              myFunc: {
                environment: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
                exclude: [
                  'FOO',
                  'AWS_KEY',
                ],
              },
            },
          },
        },
      },
    },
    tests: {
      receive: 'service.functions.myFunc.environment',
      expected: {
        ...functionEnv.functions.myFunc.environment,
        ENV: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment.ENV,
      },
    },
  },
  {
    name: 'Function with Config - Replace',
    data: {
      ...serverless,
      service: {
        ...clone(functionEnv),
        custom: {
          'serverless-offline-env': {
            functions: {
              myFunc: {
                environment: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
                replace: {
                  FOO: 'BAR',
                },
              },
            },
          },
        },
      },
    },
    tests: {
      receive: 'service.functions.myFunc.environment',
      expected: {
        // Shouldn't replace this as env is read and replaced before touching the sls service vars
        FOO: functionEnv.functions.myFunc.environment.FOO,
        AWS_KEY: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment.AWS_KEY,
        ENV: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment.ENV,
        BAR: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment.FOO,
      },
    },
  },
  {
    name: 'Provider & Function with Config',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        ...clone(functionEnv),
        ...clone(providerFunctionConfig),
      },
    },
    tests: [
      {
        receive: 'service.provider.environment',
        expected: providerFunctionConfig.custom['serverless-offline-env'].environment,
      },
      {
        receive: 'service.functions.myFunc.environment',
        expected: providerFunctionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
      },
    ],
  },
  {
    name: 'Provider & Function with Config - Include',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        ...clone(functionEnv),
        custom: {
          'serverless-offline-env': {
            environment: providerFunctionConfig.custom['serverless-offline-env'].environment,
            include: [
              'ENV',
            ],
            functions: {
              myFunc: {
                environment: providerFunctionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
                include: [
                  'ENV',
                ],
              },
            },
          },
        },
      },
    },
    tests: [
      {
        receive: 'service.provider.environment',
        expected: {
          ENV: providerFunctionConfig.custom['serverless-offline-env'].environment.ENV,
        },
      },
      {
        receive: 'service.functions.myFunc.environment',
        expected: {
          // Should be here as "FOO" wasn't included & overwritten from passed env
          FOO: functionEnv.functions.myFunc.environment.FOO,
          ENV: providerFunctionConfig.custom['serverless-offline-env'].functions.myFunc.environment.ENV,
        },
      },
    ],
  },
  {
    name: 'Provider & Function with Config - Exclude',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        ...clone(functionEnv),
        custom: {
          'serverless-offline-env': {
            environment: providerFunctionConfig.custom['serverless-offline-env'].environment,
            exclude: [
              'FOO',
              'AWS_KEY',
            ],
            functions: {
              myFunc: {
                environment: providerFunctionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
                exclude: [
                  'FOO',
                  'AWS_KEY',
                ],
              },
            },
          },
        },
      },
    },
    tests: [
      {
        receive: 'service.provider.environment',
        expected: {
          ENV: providerFunctionConfig.custom['serverless-offline-env'].environment.ENV,
        },
      },
      {
        receive: 'service.functions.myFunc.environment',
        expected: {
          // Should be here as "FOO" was excluded from passed env
          FOO: functionEnv.functions.myFunc.environment.FOO,
          ENV: providerFunctionConfig.custom['serverless-offline-env'].functions.myFunc.environment.ENV,
        },
      },
    ],
  },
  {
    name: 'Provider & Function with Config - Replace',
    data: {
      ...serverless,
      service: {
        ...clone(providerEnv),
        ...clone(functionEnv),
        custom: {
          'serverless-offline-env': {
            environment: providerFunctionConfig.custom['serverless-offline-env'].environment,
            replace: {
              FOO: 'BAR',
            },
            functions: {
              myFunc: {
                environment: providerFunctionConfig.custom['serverless-offline-env'].functions.myFunc.environment,
                replace: {
                  FOO: 'BAR',
                },
              },
            },
          },
        },
      },
    },
    tests: [
      {
        receive: 'service.provider.environment',
        expected: {
          // FOO doesn't exists at this level
          AWS_KEY: providerFunctionConfig.custom['serverless-offline-env'].environment.AWS_KEY,
          ENV: providerFunctionConfig.custom['serverless-offline-env'].environment.ENV,
          BAR: providerFunctionConfig.custom['serverless-offline-env'].environment.FOO,
        },
      },
      {
        receive: 'service.functions.myFunc.environment',
        expected: {
          // Shouldn't replace this as env is read and replaced before touching the sls service vars
          FOO: functionEnv.functions.myFunc.environment.FOO,
          AWS_KEY: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment.AWS_KEY,
          ENV: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment.ENV,
          BAR: functionConfig.custom['serverless-offline-env'].functions.myFunc.environment.FOO,
        },
      },
    ],
  },
];

const shouldRunTest = item => {
  const type = typeof item.tests;
  return type !== 'undefined' &&
    ((type === 'object' && item.tests !== null && !isEmpty(item.tests)) || Array.isArray(item.tests))
  ;
};

const test = ({ data = {}, receive = '', expected = {}}) => {
  const got = get(data, `${receive}`, {});
  if (expected === undefined) {
    expect(Object.is(got, expected)).toBeUndefined();
    return;
  }
  expect(got).toStrictEqual(expected);
}

for (const item of cases) {
  // noinspection JSUnresolvedFunction
  it(item.name, async () => {
    await new ServerlessOfflineEnv(item.data || {}, item.options || {}).run();
    if (!shouldRunTest(item)) {
      return;
    }

    if (!Array.isArray(item.tests)) {
      test({ data: item.data, ...item.tests });
      return;
    }

    for (const _test of item.tests) {
      test({data: item.data, ..._test});
    }
  });
}
