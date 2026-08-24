import type { TComponentContainerDeploymentConfigurationType } from './component_container_deployment_configuration_type.js';
import type { TComponentContainerDeploymentConfiguration } from './component_container_deployment_configuration.js';
import type { TComponentContainerDeploymentConstraint } from './component_container_deployment_constraint.js';

/**
 * Component Deployment Configuration model
 */
export interface TComponentDeploymentConfiguration {
  /**
   * The count of instances to deploy.
   */
  count?: number;

  /**
   * The namespace to deploy the component into.
   * @remarks If not provided, the default namespace will be used.
   */
  namespace?: string;

  /**
   * Gets the constraints to apply.
   * @remarks Maps to job.constraints.
   */
  constraints?: TComponentContainerDeploymentConstraint[];

  /**
   * The type of Nomad job.
   */
  type?: TComponentContainerDeploymentConfigurationType;

  /**
   * The name of the Nomad job.
   * @remarks If not provided, the component name will be used.
   */
  job?: string;

  /**
   * Optional Vault role to attach to the Nomad job.
   * @remarks If not provided, no role will be attached.
   */
  vault_role?: string;

  /**
   * Any metadata to attach to the Nomad job.
   */
  meta?: Map<string, string>;

  /**
   * The container deployment configuration.
   */
  containers: TComponentContainerDeploymentConfiguration[];
}
