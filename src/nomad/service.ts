import type { TComponentContainerDeploymentService } from '../types/component_container_deployment_service.js';

/**
 * Generates a service section for a Nomad job
 * @param {TComponentContainerDeploymentService} service
 * @returns {string} - The constructed HCL service section
 */
export function generateServiceSection(
  service: TComponentContainerDeploymentService,
): string {
  let serviceText = '      service {\n';

  serviceText += `        name = "${service.name}"\n`;

  if (service.port) {
    serviceText += `        port = "${service.port}"\n`;
  }

  if (service.tags && service.tags.length > 0) {
    serviceText += `\n        tags = ${JSON.stringify(service.tags)}\n`;
  }

  if (service.checks && service.checks.length > 0) {
    for (const check of service.checks) {
      serviceText += '\n        check {\n';
      serviceText += `          type = "${check.type}"\n`;

      if (check.port) {
        serviceText += `          port = "${check.port}"\n`;
      }

      if (check.path) {
        serviceText += `          path = "${check.path}"\n`;
      }

      if (check.interval) {
        serviceText += `          interval = "${check.interval}"\n`;
      }

      if (check.timeout) {
        serviceText += `          timeout = "${check.timeout}"\n`;
      }

      serviceText += '        }\n';
    }
  }

  serviceText += '      }\n';

  return serviceText;
}
