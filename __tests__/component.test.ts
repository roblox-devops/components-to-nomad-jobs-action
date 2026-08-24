/**
 * Component-related unit tests for the configuration loader, validator, and env defaults
 */
import { jest } from '@jest/globals';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';

import * as core from '../__fixtures__/core.js';
import { validComponentConfiguration as sharedValidComponentConfiguration } from '../__fixtures__/nomad.js';

jest.unstable_mockModule('@actions/core', () => ({
  debug: core.debug,
  warning: core.warning,
}));

/* eslint-disable @typescript-eslint/no-explicit-any */

const { validateComponentConfiguration } =
  await import('../src/component/validate.js');
const { parseAndValidateComponent } = await import('../src/component/get.js');
const { applyComponentEnvironmentDefaults } =
  await import('../src/component/env.js');

const validComponentConfiguration = structuredClone(
  sharedValidComponentConfiguration,
) as any;

const invalidServicePortConfiguration = parse(
  readFileSync(
    new URL(
      '../__fixtures__/component_configuration.invalid_service_port.yaml',
      import.meta.url,
    ),
    'utf8',
  ),
) as any;

const invalidVolumeConfiguration = parse(
  readFileSync(
    new URL(
      '../__fixtures__/component_configuration.invalid_volume.yaml',
      import.meta.url,
    ),
    'utf8',
  ),
) as any;

describe('component configuration', () => {
  describe('validateComponentConfiguration', () => {
    beforeEach(() => {
      core.warning.mockClear();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns false when the configuration is empty', () => {
      expect(validateComponentConfiguration(undefined)).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        'The component configuration file is empty',
      );
    });

    it('returns false when the component name is missing', () => {
      const configuration = {
        ...validComponentConfiguration,
        component: '   ',
      };

      expect(validateComponentConfiguration(configuration)).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        'The component name is missing from the component configuration file',
      );
    });

    it('accepts a valid configuration and applies defaults', () => {
      const configuration = {
        ...validComponentConfiguration,
        deployment: {
          ...validComponentConfiguration.deployment,
          count: undefined,
          job: undefined,
          type: undefined,
          containers: [
            {
              ...validComponentConfiguration.deployment.containers[0],
              network: {
                ...validComponentConfiguration.deployment.containers[0].network,
                mode: undefined,
                ports: new Map(
                  validComponentConfiguration.deployment.containers[0].network
                    .ports,
                ),
              },
              services: [
                {
                  ...validComponentConfiguration.deployment.containers[0]
                    .services[0],
                  checks: [
                    {
                      ...validComponentConfiguration.deployment.containers[0]
                        .services[0].checks[0],
                      interval: undefined,
                      timeout: undefined,
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const deployment = configuration.deployment;

      expect(validateComponentConfiguration(configuration)).toBe(true);
      expect(deployment.count).toBe(1);
      expect(deployment.job).toBe('example-api');
      expect(deployment.type).toBe('service');
      expect(deployment.meta instanceof Map).toBe(true);
      expect(deployment.containers[0].network.mode).toBe('bridge');
      expect(deployment.containers[0].services[0].checks[0].interval).toBe(
        '5s',
      );
      expect(deployment.containers[0].services[0].checks[0].timeout).toBe('2s');
      expect(deployment.containers[0].network.ports instanceof Map).toBe(true);
    });

    it('rejects invalid deployment types', () => {
      const configuration = {
        ...validComponentConfiguration,
        deployment: {
          ...validComponentConfiguration.deployment,
          type: 'cron',
        },
      };

      expect(validateComponentConfiguration(configuration)).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        `The deployment type for the component 'example-api' is invalid`,
      );
    });

    it('rejects missing deployments and normalizes falsy counts to one', () => {
      expect(
        validateComponentConfiguration({
          ...validComponentConfiguration,
          deployment: undefined,
        }),
      ).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        "The component 'example-api' can not be deployed",
      );

      const normalized = {
        ...validComponentConfiguration,
        deployment: {
          ...validComponentConfiguration.deployment,
          count: 0,
          containers: [
            {
              ...validComponentConfiguration.deployment.containers[0],
              network: {
                ...validComponentConfiguration.deployment.containers[0].network,
                ports: new Map(
                  validComponentConfiguration.deployment.containers[0].network
                    .ports,
                ),
              },
              services: [
                {
                  ...validComponentConfiguration.deployment.containers[0]
                    .services[0],
                  port: 'http',
                },
              ],
            },
          ],
        },
      };

      expect(validateComponentConfiguration(normalized)).toBe(true);
      expect(normalized.deployment.count).toBe(1);
    });

    it('applies default values for network, service, artifact, and config map fields', () => {
      const configuration = {
        ...validComponentConfiguration,
        deployment: {
          ...validComponentConfiguration.deployment,
          containers: [
            {
              image: 'example/image:latest',
              network: {
                ports: {
                  http: {
                    static: 8080,
                  },
                },
              },
              services: [
                {
                  name: 'api',
                  port: 'http',
                  checks: [{ type: 'http', port: 'http' }],
                },
              ],
              volumes: ['/var/run:/tmp/run'],
              driver_opts: {
                log_driver: 'json-file',
              },
              artifacts: [
                {
                  source: 'https://example.com/archive.tar.gz',
                  options: {
                    strip: 'true',
                  },
                  headers: {
                    Authorization: 'Bearer token',
                  },
                },
              ],
              config_maps: [
                {
                  destination: '/etc/app.conf',
                  data: 'hello=world',
                },
              ],
            },
          ],
        },
      };

      expect(validateComponentConfiguration(configuration)).toBe(true);
      expect(configuration.deployment.containers[0].network.mode).toBe(
        'bridge',
      );
      expect(
        configuration.deployment.containers[0].services[0].checks[0].interval,
      ).toBe('5s');
      expect(
        configuration.deployment.containers[0].services[0].checks[0].timeout,
      ).toBe('2s');
      expect(
        configuration.deployment.containers[0].driver_opts instanceof Map,
      ).toBe(true);
      expect(
        configuration.deployment.containers[0].artifacts[0].destination,
      ).toBe('/local');
      expect(configuration.deployment.containers[0].artifacts[0].mode).toBe(
        'any',
      );
      expect(configuration.deployment.containers[0].config_maps[0].env).toBe(
        true,
      );
      expect(
        configuration.deployment.containers[0].config_maps[0].on_change,
      ).toBe('restart');
      expect(configuration.deployment.containers[0].config_maps[0].perms).toBe(
        '644',
      );
    });

    it('rejects invalid network modes, check definitions, and config map content', () => {
      const invalidNetworkMode = {
        ...validComponentConfiguration,
        deployment: {
          ...validComponentConfiguration.deployment,
          containers: [
            {
              ...validComponentConfiguration.deployment.containers[0],
              network: {
                ...validComponentConfiguration.deployment.containers[0].network,
                mode: 'bad-mode',
              },
            },
          ],
        },
      };

      expect(validateComponentConfiguration(invalidNetworkMode)).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        'The network mode for container 1 is invalid',
      );

      core.warning.mockClear();

      const invalidCheck = {
        ...validComponentConfiguration,
        deployment: {
          ...validComponentConfiguration.deployment,
          containers: [
            {
              ...validComponentConfiguration.deployment.containers[0],
              network: {
                ...validComponentConfiguration.deployment.containers[0].network,
                mode: 'bridge',
                ports: new Map([['http', { to: 80 }]]),
              },
              services: [
                {
                  ...validComponentConfiguration.deployment.containers[0]
                    .services[0],
                  port: 'http',
                  checks: [{ type: 'invalid', port: 'http' }],
                },
              ],
            },
          ],
        },
      };

      expect(validateComponentConfiguration(invalidCheck)).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        'The check type for service web is invalid',
      );

      core.warning.mockClear();

      const invalidConfigMap = {
        ...validComponentConfiguration,
        deployment: {
          ...validComponentConfiguration.deployment,
          containers: [
            {
              ...validComponentConfiguration.deployment.containers[0],
              network: {
                ...validComponentConfiguration.deployment.containers[0].network,
                ports: new Map(
                  validComponentConfiguration.deployment.containers[0].network
                    .ports,
                ),
              },
              services: [
                {
                  ...validComponentConfiguration.deployment.containers[0]
                    .services[0],
                  port: 'http',
                },
              ],
              config_maps: [
                {
                  destination: '/etc/app.conf',
                  data: '',
                  env: true,
                  on_change: 'restart',
                },
              ],
            },
          ],
        },
      };

      expect(validateComponentConfiguration(invalidConfigMap)).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        'The config map data for container 1 is missing',
      );
    });

    it('rejects invalid service ports and volume definitions', () => {
      expect(
        validateComponentConfiguration(invalidServicePortConfiguration),
      ).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        'The service port for container 1 is undefined',
      );

      expect(validateComponentConfiguration(invalidVolumeConfiguration)).toBe(
        false,
      );
      expect(core.warning).toHaveBeenCalledWith(
        'The volume bad-volume for container 1 is invalid',
      );
    });
  });

  describe('parseAndValidateComponent', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'component-config-'));

    afterEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('reads a valid YAML configuration and validates it', () => {
      const fixturePath = new URL(
        '../__fixtures__/component_configuration.valid.yaml',
        import.meta.url,
      ).pathname;

      const result = parseAndValidateComponent(
        'example-api:1.0.0',
        [],
        fixturePath,
      );

      expect(result).toBeDefined();
      expect(result?.component).toBe('example-api');
      expect(result?.deployment?.count).toBe(3);
      expect(result?.deployment?.job).toBe('example');
      expect(result?.deployment?.type).toBe('service');
      expect(result?.deployment?.meta instanceof Map).toBe(true);
      expect(
        result?.deployment?.containers[0].network?.ports instanceof Map,
      ).toBe(true);
    });

    it('returns undefined when the configuration file does not exist', () => {
      const missingPath = join(tempDir, 'missing.yaml');

      const result = parseAndValidateComponent(
        'example-api:1.0.0',
        [],
        missingPath,
      );

      expect(result).toBeUndefined();
      expect(core.warning).toHaveBeenCalledWith(
        `The component configuration file does not exist: ${missingPath}`,
      );
    });

    it('returns undefined when the YAML file cannot be parsed', () => {
      const invalidYamlPath = join(tempDir, 'invalid.yaml');
      writeFileSync(invalidYamlPath, 'component: [oops\ndeployment: \n');

      const result = parseAndValidateComponent(
        'example-api:1.0.0',
        [],
        invalidYamlPath,
      );

      expect(result).toBeUndefined();
      expect(core.warning).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to parse the component configuration file:',
        ),
      );
    });

    it('returns undefined when validation rejects the file contents', () => {
      const fixturePath = new URL(
        '../__fixtures__/component_configuration.invalid_service_port.yaml',
        import.meta.url,
      ).pathname;

      const result = parseAndValidateComponent(
        'example-api:1.0.0',
        [],
        fixturePath,
      );

      expect(result).toBeUndefined();
      expect(core.warning).toHaveBeenCalledWith(
        'The service port for container 1 is undefined',
      );
    });
  });

  describe('applyComponentEnvironmentDefaults', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      process.env = { ...originalEnv };
      core.warning.mockClear();
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('replaces env expressions and applies matching resource values', () => {
      process.env.VERSION = 'unset';
      process.env.TEST_CPU = '900';
      process.env.TEST_RAM = '2048';

      const result = applyComponentEnvironmentDefaults(
        'component-a',
        '1.2.3',
        'meta:\n  version: ${{ env.VERSION }}\n  cpu: ${{ env.TEST_CPU }}\n  ram: ${{ env.TEST_RAM }}\n',
        ['component-a,900:2048'],
      );

      expect(result).toBe('meta:\n  version: 1.2.3\n  cpu: 900\n  ram: 2048\n');
      expect(process.env.VERSION).toBe('1.2.3');
      expect(process.env.NOMAD_VERSION).toBe('1.2.3');
      expect(process.env.NOMAD_CPU).toBe('900');
      expect(process.env.NOMAD_RAM).toBe('2048');
      expect(core.warning).not.toHaveBeenCalled();
    });

    it('falls back to the default CPU and RAM values when no matching resource exists', () => {
      const result = applyComponentEnvironmentDefaults(
        'component-b',
        '9.9.9',
        'meta:\n  version: ${{ env.VERSION }}\n',
        ['component-a,1200:4096'],
      );

      expect(result).toBe('meta:\n  version: 9.9.9\n');
      expect(process.env.NOMAD_CPU).toBe('500');
      expect(process.env.NOMAD_RAM).toBe('256');
      expect(process.env.VERSION).toBe('9.9.9');
    });

    it('warns and removes missing environment variables from the YAML content', () => {
      const result = applyComponentEnvironmentDefaults(
        'component-c',
        '3.0.0',
        'meta:\n  version: ${{ env.MISSING_VERSION }}\n  ok: value\n',
        [],
      );

      expect(result).toBe('meta:\n  version: \n  ok: value\n');
      expect(core.warning).toHaveBeenCalledWith(
        'Environment variable MISSING_VERSION is not set',
      );
      expect(process.env.NOMAD_CPU).toBe('500');
      expect(process.env.NOMAD_RAM).toBe('256');
    });
  });
});
