/**
 * Component Container Deployment Service Check model
 * @remarks Maps to the Nomad service check section.
 * @see https://www.nomadproject.io/docs/job-specification/service
 */
export interface TComponentContainerDeploymentServiceCheck {
  /**
   * Gets the type of check to perform.
   * @remarks Maps to job.group.services.checks.type.
   */
  type: string;

  /**
   * Gets the port to check.
   */
  port?: string;

  /**
   * Gets the path to check.
   */
  path?: string;

  /**
   * Gets the interval to check.
   */
  interval?: string;

  /**
   * Gets the timeout to check.
   */
  timeout?: string;
}
