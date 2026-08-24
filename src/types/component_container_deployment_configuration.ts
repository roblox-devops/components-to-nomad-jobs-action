import type { TComponentContainerDeploymentArtifiact } from './component_container_deployment_artifact.js';
import type { TComponentContainerDeploymentConfigMap } from './component_container_deployment_config_map.js';
import type { TComponentContainerDeploymentNetwork } from './component_container_deployment_network.js';
import type { TComponentContainerDeploymentResources } from './component_container_deployment_resources.js';
import type { TComponentContainerDeploymentService } from './component_container_deployment_service.js';

/**
 * Component Container Deployment Configuration model
 * @remarks This is essentially the same as the Nomad groups section.
 */
export interface TComponentContainerDeploymentConfiguration {
  /**
   * Gets the name of the image to deploy.
   */
  image: string;

  /**
   * Gets the resources to allocate.
   * @remarks Maps to job.group.resources.
   */
  resources?: TComponentContainerDeploymentResources;

  /**
   * Gets the network configuration.
   */
  network?: TComponentContainerDeploymentNetwork;

  /**
   * Gets the services to expose.
   * @remarks Maps to job.group.services.
   */
  services?: TComponentContainerDeploymentService[];

  /**
   * Gets the host volume mounts to expose.
   * @remarks Maps to job.group.volumes.
   * @remarks The format is 'host_path:container_path'.
   */
  volumes?: string[];

  /**
   * Gets a map of optional driver options.
   */
  driver_opts?: Map<string, string>;

  /**
   * Gets the artifacts to expose.
   * @remarks Maps to job.group.task.artifacts.
   */
  artifacts?: TComponentContainerDeploymentArtifiact[];

  /**
   * Gets the config maps to expose.
   * @remarks Maps to job.group.task.templates.
   */
  config_maps?: TComponentContainerDeploymentConfigMap[];
}
