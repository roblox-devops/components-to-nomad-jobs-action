/**
 * Unit tests for Nomad job generation in src/nomad/*.ts
 */
import { generateGroupSection } from '../src/nomad/group.js';
import { generateNomadJob } from '../src/nomad/job.js';
import { generateNetworkSection } from '../src/nomad/network.js';

import { validNomadDeploymentConfiguration } from '../__fixtures__/nomad.js';

describe('Nomad generation', () => {
  it('generateNomadJob includes the job header, metadata, vault, constraints, and task blocks', () => {
    const result = generateNomadJob(
      'example-api',
      '1.2.3',
      ['dc1', 'dc2'],
      validNomadDeploymentConfiguration,
    );

    expect(result).toContain('job "example" {');
    expect(result).toContain('datacenters = ["dc1","dc2"]');
    expect(result).toContain('type = "service"');
    expect(result).toContain('namespace = "prod"');
    expect(result).toContain('role = "vault-role"');
    expect(result).toContain('max_parallel = 3');
    expect(result).toContain('attribute = "node.class"');
    expect(result).toContain('operator  = "="');
    expect(result).toContain('team = "platform"');
    expect(result).toContain('image = "nginx:1.2.3"');
    expect(result).toContain('ports = ["http","metrics"]');
    expect(result).toContain('service {');
    expect(result).toContain('template {');
    expect(result).toContain('artifact {');
  });

  it('generateNetworkSection renders bridge-free port mappings with static and to values', () => {
    const result = generateNetworkSection({
      mode: 'host',
      ports: new Map([
        ['http', { static: 8080, to: 80 }],
        ['metrics', { to: 9090 }],
      ]),
    });

    expect(result).toContain('mode = "host"');
    expect(result).toContain('port "http"');
    expect(result).toContain('to = 80');
    expect(result).toContain('static = 8080');
    expect(result).toContain('port "metrics"');
    expect(result).toContain('to = 9090');
    expect(result).not.toContain('mode = "bridge"');
  });

  it('generateGroupSection writes the group/task shell including optional resources and config maps', () => {
    const result = generateGroupSection('example-api', '1.2.3', 2, {
      image: 'busybox',
      resources: { cpu: 250, ram: 512 },
      network: {
        mode: 'bridge',
        ports: new Map([['http', { static: 8080, to: 80 }]]),
      },
      services: [
        {
          name: 'api',
          port: 'http',
          checks: [
            { type: 'tcp', port: 'http', interval: '15s', timeout: '5s' },
          ],
        },
      ],
      config_maps: [
        {
          destination: '/etc/test.conf',
          data: 'key=value',
          env: true,
          perms: '600',
          on_change: 'restart',
        },
      ],
    });

    expect(result).toContain('group "example-api"');
    expect(result).toContain('count = 2');
    expect(result).toContain('image = "busybox:1.2.3"');
    expect(result).toContain('cpu = 250');
    expect(result).toContain('memory = 512');
    expect(result).toContain('port "http"');
    expect(result).toContain('service {');
    expect(result).toContain('template {');
    expect(result).toContain('destination = "/etc/test.conf"');
  });
});
