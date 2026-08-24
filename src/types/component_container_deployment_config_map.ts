import type { TComponentContainerDeploymentConfigMapChangeMode } from './component_container_deployment_config_map_change_mode.js';

/**
 * Component Container Deployment Config Map model
 * @remarks Maps to the Nomad template config section.
 * @see https://www.nomadproject.io/docs/job-specification/template
 */
export interface TComponentContainerDeploymentConfigMap {
  /**
   * Gets the destination path for the config map.
   */
  destination: string;

  /**
   * Determines if the config map is an env file.
   */
  env?: boolean;

  /**
   * Gets the permissions for the config map
   */
  perms?: string;

  /**
   * Gets the change mode for the config map.
   */
  on_change?: TComponentContainerDeploymentConfigMapChangeMode;

  /**
   * Gets the template data for the config map.
   */
  data: string;
}
