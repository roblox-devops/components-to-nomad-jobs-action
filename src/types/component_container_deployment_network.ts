import type { TComponentContainerDeploymentPortMapping } from './component_container_deployment_port_mapping.js';
import type { TComponentContainerDeploymentNetworkMode } from './component_container_deployment_network_mode.js';

/**
 * Component Container Deployment Network model
 * @remarks Maps to the Nomad network section.
 * @see https://www.nomadproject.io/docs/job-specification/network
 */
export interface TComponentContainerDeploymentNetwork {
  /**
   * Gets the network mode to use.
   * @remarks Maps to job.group.network.mode.
   */
  mode?: TComponentContainerDeploymentNetworkMode;

  /**
   * Gets the port mappings to expose.
   * @remarks Maps to job.group.network.ports.
   */
  ports?: Map<string, TComponentContainerDeploymentPortMapping>;
}
