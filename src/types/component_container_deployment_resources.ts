/**
 * Component Container Deployment Resources model
 * @remarks Maps to the Nomad resources section.
 * @see https://www.nomadproject.io/docs/job-specification/resources
 */
export interface TComponentContainerDeploymentResources {
  /**
   * Gets the CPU resources to allocate.
   */
  cpu: number;

  /**
   * Gets the memory resources to allocate.
   * @remarks Maps to job.group.resources.memory.
   */
  ram: number;
}
