import { getInput, setFailed, setOutput } from '@actions/core';

import { generateNomadJob } from './nomad/job.js';
import { parseAndValidateComponent } from './component/get.js';

import type { TComponentKey } from './types/components.js';
import type { TComponentDeploymentConfiguration } from './types/component_deployment_configuration.js';

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const components = JSON.parse(
      getInput('components', { required: true }),
    ) as Record<TComponentKey, string>;

    const datacenters = (
      getInput('datacenters', { required: false })?.split(',') || ['*']
    )
      .map((dc) => dc.trim())
      .filter((dc) => dc.length > 0);

    const resources = getInput('resources', { required: false })
      .split(';')
      .map((resource) => resource.trim())
      .filter((resource) => resource.length > 0);

    const ouputJobs: Record<string, string> = {};

    for (const entry of Object.entries(components)) {
      const [component, componentConfigurationPath] = entry as [
        TComponentKey,
        string,
      ];

      if (!component || !componentConfigurationPath) {
        setFailed('Invalid component configuration');

        return;
      }

      const componentConfiguration = parseAndValidateComponent(
        component,
        resources,
        componentConfigurationPath,
      );

      if (!componentConfiguration) {
        continue;
      }

      const [componentName, componentVersion] = component.split(':');

      const job = generateNomadJob(
        componentName,
        componentVersion,
        datacenters,
        componentConfiguration.deployment as TComponentDeploymentConfiguration,
      );

      ouputJobs[component] = job;
    }

    setOutput('nomad-files', JSON.stringify(ouputJobs));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) setFailed(error.message);
  }
}
