import type { TComponentContainerDeploymentServiceCheck } from './component_container_deployment_service_check.js';

/**
 * Component Container Deployment Service model
 * @remarks Maps to the Nomad service section.
 * @see https://www.nomadproject.io/docs/job-specification/service
 */
export interface TComponentContainerDeploymentService {
  /**
   * Gets the name of the service.
   */
  name: string;

  /**
   * Gets the port to map to the service.
   */
  port: string;

  /**
   * Gets the tags to attach to the service.
   */
  tags?: string[];

  /**
   * Gets the checks to perform on the service.
   */
  checks?: TComponentContainerDeploymentServiceCheck[];
}
