import { warning } from '@actions/core';
import { TComponentResources } from '../types/component_resources.js';

function replaceEnvironmentExpressions(text: string): string {
  return text.replace(/\${{ env.([A-Z_]+) }}/g, (_, envVar) => {
    const value = process.env[envVar];

    if (!value) {
      warning(`Environment variable ${envVar} is not set`);

      return '';
    }

    return value;
  });
}

export function applyComponentEnvironmentDefaults(
  componentName: string,
  componentVersion: string,
  componentFileContents: string,
  resources: string[],
): string {
  // Before parsing yaml, we need to replace environment expressions
  // e.g:
  // meta:
  //   version: ${{ env.VERSION }}
  // becomes
  // meta:
  //   version: 1.0.0

  process.env.VERSION = componentVersion;
  process.env.NOMAD_VERSION = process.env.VERSION;

  // Manage NOMAD_CPU and NOMAD_RAM
  // If the component has resources defined, use them
  // Otherwise, set them to 500MHz and 256MB

  const resourcesForComponent = resources
    .map<TComponentResources>((resource) => {
      return {
        component: resource.split(',')[0],
        cpu: resource.split(',')[1].split(':')[0],
        ram: resource.split(',')[1].split(':')[1],
      };
    })
    .find((resource) => resource.component === componentName);

  if (resourcesForComponent) {
    process.env.NOMAD_CPU = resourcesForComponent.cpu;
    process.env.NOMAD_RAM = resourcesForComponent.ram;
  } else {
    process.env.NOMAD_CPU = '500';
    process.env.NOMAD_RAM = '256';
  }

  return replaceEnvironmentExpressions(componentFileContents);
}
