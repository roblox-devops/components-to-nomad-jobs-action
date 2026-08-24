/**
 * Component Container Deployment Network mode enum
 * @remarks Maps to the Nomad network mode.
 * @see https://www.nomadproject.io/docs/job-specification/network
 */
export type TComponentContainerDeploymentNetworkMode =
  'bridge' | 'host' | 'none';
