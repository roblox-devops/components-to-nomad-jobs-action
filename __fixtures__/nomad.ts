import type { TComponentDeploymentConfiguration } from '../src/types/component_deployment_configuration.js';

export const validNomadDeploymentConfiguration: TComponentDeploymentConfiguration =
  {
    count: 3,
    job: 'example',
    type: 'service',
    namespace: 'prod',
    vault_role: 'vault-role',
    constraints: [
      {
        attribute: 'node.class',
        operator: '=',
        value: 'web',
      },
    ],
    meta: new Map([['team', 'platform']]),
    containers: [
      {
        image: 'nginx',
        resources: {
          cpu: 500,
          ram: 1024,
        },
        network: {
          mode: 'bridge',
          ports: new Map([
            ['http', { static: 8080, to: 80 }],
            ['metrics', { static: 9090 }],
          ]),
        },
        services: [
          {
            name: 'web',
            port: 'http',
            tags: ['edge'],
            checks: [
              {
                type: 'http',
                port: 'http',
                path: '/health',
                interval: '10s',
                timeout: '2s',
              },
            ],
          },
        ],
        volumes: ['/tmp/data:/data'],
        driver_opts: new Map([['log-driver', 'json-file']]),
        artifacts: [
          {
            source: 'https://example.com/app.tar.gz',
            destination: '/local/app',
            mode: 'file',
            options: new Map([['strip', 'true']]),
            headers: new Map([['Authorization', 'Bearer token']]),
          },
        ],
        config_maps: [
          {
            destination: '/etc/app.conf',
            data: 'hello=world',
            env: false,
            perms: '644',
            on_change: 'restart',
          },
        ],
      },
    ],
  };

export const validComponentConfiguration = {
  component: 'example-api',
  deployment: validNomadDeploymentConfiguration,
};
