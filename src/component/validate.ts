import { warning } from '@actions/core';

import { VALID_COMPONENT_REGEX } from '../constants.js';
import type { TComponentConfiguration } from '../types/component_configuration.js';

function normalizeMap<K extends string, V>(
  value: Record<string, V> | Map<K, V> | undefined,
): Map<K, V> | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof Map
    ? value
    : new Map(Object.entries(value) as [K, V][]);
}

/**
 * Validates the component configuration file and returns a boolean indicating whether it is valid or not.
 *
 * @param {TComponentConfiguration?} componentConfiguration The component configuration to validate.
 * @returns {boolean} True if the component configuration is valid, false otherwise.
 */
export function validateComponentConfiguration(
  componentConfiguration?: TComponentConfiguration,
): boolean {
  if (!componentConfiguration) {
    warning('The component configuration file is empty');

    return false;
  }

  if (
    !componentConfiguration.component ||
    !componentConfiguration.component.trim() ||
    !VALID_COMPONENT_REGEX.test(componentConfiguration.component.trim())
  ) {
    warning(
      'The component name is missing from the component configuration file',
    );

    return false;
  }

  const componentName = componentConfiguration.component.trim();

  if (!componentConfiguration.deployment) {
    warning(`The component '${componentName}' can not be deployed`);

    return false;
  }

  if (
    !componentConfiguration.deployment.count ||
    isNaN(componentConfiguration.deployment.count)
  ) {
    componentConfiguration.deployment.count = 1;
  }

  if (
    !componentConfiguration.deployment.job ||
    !componentConfiguration.deployment.job.trim()
  ) {
    componentConfiguration.deployment.job = componentName.split(':')[0];
  }

  if (
    !componentConfiguration.deployment.type ||
    !componentConfiguration.deployment.type.trim()
  ) {
    componentConfiguration.deployment.type = 'service';
  }

  if (!['service', 'system'].includes(componentConfiguration.deployment.type)) {
    warning(
      `The deployment type for the component '${componentName}' is invalid`,
    );

    return false;
  }

  if (componentConfiguration.deployment.meta) {
    componentConfiguration.deployment.meta = normalizeMap(
      componentConfiguration.deployment.meta,
    ) as Map<string, string>;
  }

  if (componentConfiguration.deployment.count < 1) {
    warning(
      `The deployment count for the component '${componentName}' must be greater than 0`,
    );

    return false;
  }

  if (
    !componentConfiguration.deployment.containers ||
    componentConfiguration.deployment.containers.length === 0
  ) {
    warning(
      `The component '${componentName}' must have at least one container`,
    );

    return false;
  }

  for (
    let i = 0;
    i < componentConfiguration.deployment.containers.length;
    i++
  ) {
    const container = componentConfiguration.deployment.containers[i];

    if (!container.image || !container.image.trim()) {
      warning(`The image for container ${i + 1} is missing`);

      return false;
    }

    if (container.resources) {
      if (
        (!container.resources.cpu || isNaN(container.resources.cpu)) &&
        (!container.resources.ram || isNaN(container.resources.ram))
      ) {
        container.resources = undefined;
      }
    }

    if (container.network) {
      if (!container.network.mode || !container.network.mode.trim()) {
        container.network.mode = 'bridge';
      }

      if (
        container.network.mode !== 'bridge' &&
        container.network.mode !== 'host' &&
        container.network.mode !== 'none'
      ) {
        warning(`The network mode for container ${i + 1} is invalid`);

        return false;
      }

      if (container.network.ports) {
        container.network.ports = normalizeMap(container.network.ports) as Map<
          string,
          typeof container.network.ports extends Map<string, infer T>
            ? T
            : never
        >;

        for (const [, port] of container.network.ports) {
          // Range check on static and to
          if (port.static && (port.static < 0 || port.static > 65535)) {
            warning(`The static port for container ${i + 1} is invalid`);

            return false;
          }

          if (port.to && (port.to < 0 || port.to > 65535)) {
            warning(`The to port for container ${i + 1} is invalid`);

            return false;
          }
        }
      }
    }

    if (container.services) {
      for (const service of container.services) {
        if (!service.name || !service.name.trim()) {
          warning(`The service name for container ${i + 1} is missing`);

          return false;
        }

        if (service.port) {
          if (!container.network?.ports?.has(service.port)) {
            warning(`The service port for container ${i + 1} is undefined`);

            return false;
          }
        }

        if (service.checks) {
          for (const check of service.checks) {
            if (!check.type || !check.type.trim()) {
              warning(`The check type for service ${service.name} is missing`);

              return false;
            }

            if (!['http', 'tcp', 'grpc'].includes(check.type)) {
              warning(`The check type for service ${service.name} is invalid`);

              return false;
            }

            if (!check.interval) {
              check.interval = '5s';
            }

            if (!check.timeout) {
              check.timeout = '2s';
            }

            if (check.port && !container.network?.ports?.has(check.port)) {
              warning(
                `The check port for service ${service.name} is undefined`,
              );

              return false;
            }
          }
        }
      }
    }

    if (container.volumes) {
      for (const volume of container.volumes) {
        // In format: hostPath:containerPath
        if (!/^.+?:.+?$/.test(volume)) {
          warning(`The volume ${volume} for container ${i + 1} is invalid`);

          return false;
        }
      }
    }

    if (container.driver_opts) {
      container.driver_opts = normalizeMap(container.driver_opts) as Map<
        string,
        string
      >;
    }

    if (container.artifacts) {
      for (const artifact of container.artifacts) {
        if (!artifact.source || !artifact.source.trim()) {
          warning(`The artifact source for container ${i + 1} is missing`);

          return false;
        }

        if (!artifact.destination || !artifact.destination.trim()) {
          artifact.destination = '/local';
        }

        if (!artifact.mode || !artifact.mode.trim()) {
          artifact.mode = 'any';
        }

        if (!['any', 'file', 'dir'].includes(artifact.mode)) {
          warning(`The artifact mode for container ${i + 1} is invalid`);

          return false;
        }

        if (artifact.options) {
          artifact.options = normalizeMap(artifact.options) as Map<
            string,
            string
          >;
        }

        if (artifact.headers) {
          artifact.headers = normalizeMap(artifact.headers) as Map<
            string,
            string
          >;
        }
      }
    }

    if (container.config_maps) {
      for (const configMap of container.config_maps) {
        // In format: configMapName:containerPath
        if (!configMap.destination || !configMap.destination.trim()) {
          warning(
            `The config map destination for container ${i + 1} is missing`,
          );

          return false;
        }

        if (configMap.env === undefined) {
          configMap.env = true;
        }

        if (configMap.env !== true && configMap.env !== false) {
          warning(`The config map env for container ${i + 1} is invalid`);

          return false;
        }

        if (!configMap.on_change) {
          configMap.on_change = 'restart';
        }

        if (!['restart', 'noop'].includes(configMap.on_change)) {
          warning(`The config map on change for container ${i + 1} is invalid`);

          return false;
        }

        if (!configMap.perms || !configMap.perms.trim()) {
          configMap.perms = '644';
        }

        if (!configMap.data || !configMap.data.trim()) {
          warning(`The config map data for container ${i + 1} is missing`);

          return false;
        }
      }
    }
  }

  return true;
}
