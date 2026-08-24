/**
 * Unit tests for the action entrypoint in src/main.ts
 */
import { jest } from '@jest/globals';

import * as core from '../__fixtures__/core.js';

const parseAndValidateComponent = jest.fn();
const generateNomadJob = jest.fn();

jest.unstable_mockModule('@actions/core', () => ({
  getInput: core.getInput,
  setFailed: core.setFailed,
  setOutput: core.setOutput,
}));

jest.unstable_mockModule('../src/component/get.js', () => ({
  parseAndValidateComponent,
}));

jest.unstable_mockModule('../src/nomad/job.js', () => ({
  generateNomadJob,
}));

const { run } = await import('../src/main.js');

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets the nomad-files output for each valid component', async () => {
    const componentConfig = {
      deployment: {
        count: 2,
        job: 'example',
        type: 'service',
      },
    };

    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'components':
          return JSON.stringify({ 'example-api:1.2.3': '/tmp/example.yaml' });
        case 'datacenters':
          return 'dc1, dc2';
        case 'resources':
          return 'example-api,500:256';
        default:
          return '';
      }
    });

    parseAndValidateComponent.mockReturnValue(componentConfig);
    generateNomadJob.mockReturnValue(
      'job "example" {\n  group "example-api" {}\n}',
    );

    await run();

    expect(parseAndValidateComponent).toHaveBeenCalledWith(
      'example-api:1.2.3',
      ['example-api,500:256'],
      '/tmp/example.yaml',
    );
    expect(generateNomadJob).toHaveBeenCalledWith(
      'example-api',
      '1.2.3',
      ['dc1', 'dc2'],
      componentConfig.deployment,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      'nomad-files',
      JSON.stringify({
        'example-api:1.2.3': 'job "example" {\n  group "example-api" {}\n}',
      }),
    );
  });

  it('fails the action when a component entry is invalid', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'components':
          return JSON.stringify({ '': '/tmp/example.yaml' });
        case 'datacenters':
          return 'dc1';
        case 'resources':
          return '';
        default:
          return '';
      }
    });

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(
      'Invalid component configuration',
    );
  });

  it('fails the action when the input parsing throws an error', async () => {
    core.getInput.mockImplementation((name: string) => {
      if (name === 'components') {
        throw new Error('components input is malformed');
      }

      return '';
    });

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(
      'components input is malformed',
    );
  });
});
