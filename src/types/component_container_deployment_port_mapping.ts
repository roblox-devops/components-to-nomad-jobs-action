/**
 * Component Container Deployment Port Mapping model
 * @remarks Maps to the Nomad network ports section.
 * @see https://www.nomadproject.io/docs/job-specification/network
 */
export interface TComponentContainerDeploymentPortMapping {
  /**
   * Gets the static port to expose.
   */
  static?: number;

  /**
   * Gets a port inside the container to expose, only applicable when NetworkMode is 'bridge'.
   */
  to?: number;
}
