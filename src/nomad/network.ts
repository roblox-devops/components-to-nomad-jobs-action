import type { TComponentContainerDeploymentNetwork } from '../types/component_container_deployment_network.js';

/**
 * Generates a network section for a Nomad job
 * @param {TComponentContainerDeploymentNetwork} network - The network configuration for the container
 * @returns {string} - The constructed HCL network section
 */
export function generateNetworkSection(
  network: TComponentContainerDeploymentNetwork,
): string {
  let networkText = '    network {\n';

  if (network.mode !== 'bridge') {
    networkText += `      mode = "${network.mode}"\n`;
  }

  if (network.ports && network.ports.size > 0) {
    for (const [portName, port] of network.ports) {
      networkText += `\n      port "${portName}" {`;

      if (port.to) {
        networkText += `\n        to = ${port.to}\n`;
      }

      if (port.static) {
        networkText += `\n        static = ${port.static}\n`;
      }

      if (!port.static && !port.to) {
        networkText += '}\n';
      } else {
        networkText += '      }\n';
      }
    }
  }

  networkText += '    }\n';

  return networkText;
}
