import type { TComponentContainerDeploymentResources } from '../types/component_container_deployment_resources.js';

/**
 * Generates a resources section for a Nomad job
 * @param {TComponentContainerDeploymentResources} resources - The resources configuration for the container
 * @returns {string} - The constructed HCL resources section
 */
export function generateResourcesSection(
  resources: TComponentContainerDeploymentResources,
): string {
  let resourcesText = '      resources {\n';

  if (resources.cpu) {
    resourcesText += `        cpu = ${resources.cpu}\n`;
  }

  if (resources.ram) {
    resourcesText += `        memory = ${resources.ram}\n`;
  }

  resourcesText += '      }\n';

  return resourcesText;
}
