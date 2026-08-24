import { readFileSync, existsSync } from 'node:fs';

import { parse as yaml } from 'yaml';
import { warning, debug } from '@actions/core';

import type { TComponentKey } from '../types/components.js';
import type { TComponentConfiguration } from '../types/component_configuration.js';

import { applyComponentEnvironmentDefaults } from './env.js';
import { validateComponentConfiguration } from './validate.js';

/**
 * Reads, parses, and validates the component configuration from the action's inputs.
 * @param {TComponentKey} componentName The name of the component to read.
 * @param {string[]} resources The resources to use for the component.
 * @param {string} componentConfigurationPath The path to the component configuration file.
 * @returns {ComponentConfiguration?} A tuple containing a boolean indicating success and the component configuration.
 */
export function parseAndValidateComponent(
  componentName: TComponentKey,
  resources: string[],
  componentConfigurationPath: string,
): TComponentConfiguration | undefined {
  const [name, version] = componentName.split(':');

  debug(`Reading the component configuration for ${name} @ ${version}`);

  if (!existsSync(componentConfigurationPath)) {
    warning(
      `The component configuration file does not exist: ${componentConfigurationPath}`,
    );

    return undefined;
  }

  const fileContents = readFileSync(componentConfigurationPath, 'utf8');
  const replacedContents = applyComponentEnvironmentDefaults(
    name,
    version,
    fileContents,
    resources,
  );

  let componentConfiguration: TComponentConfiguration;

  try {
    componentConfiguration = yaml(replacedContents);
  } catch (error) {
    warning(`Failed to parse the component configuration file: ${error}`);

    return undefined;
  }

  return validateComponentConfiguration(componentConfiguration)
    ? componentConfiguration
    : undefined;
}
