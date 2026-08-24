import type { TComponentDeploymentConfiguration } from './component_deployment_configuration.js';

/**
 * ComponentConfiguration model
 */
export interface TComponentConfiguration {
  /**
   * The name of the component.
   */
  component: string;

  /**
   * The deployment configuration.
   * @remarks If not provided, the component will not be deployed.
   * @remarks Maps to the Nomad job section.
   */
  deployment?: TComponentDeploymentConfiguration;
}
