import type { TComponentContainerDeploymentArtifactMode } from './component_container_deployment_artifact_mode.js';

/**
 * Component Container Deployment Artifact model
 * @remarks Maps to the Nomad artifact section.
 * @see https://www.nomadproject.io/docs/job-specification/artifact
 */
export interface TComponentContainerDeploymentArtifiact {
  /**
   * Gets the destination path for the artifact
   */
  destination: string;

  /**
   * Gets the mode for the artifact
   */
  mode: TComponentContainerDeploymentArtifactMode;

  /**
   * Gets the options for the artifact
   */
  options?: Map<string, string>;

  /**
   * Gets the headers for the artifact
   */
  headers?: Map<string, string>;

  /**
   * Gets the source for the artifact
   */
  source: string;

  /**
   * Determines whether or not to chown the artifact
   */
  chown?: boolean;
}
