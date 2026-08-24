/**
 * Component Container Deployment Config Map change mode enum
 * @remarks Maps to the Nomad template change mode.
 * @see https://www.nomadproject.io/docs/job-specification/template
 */
export type TComponentContainerDeploymentConfigMapChangeMode =
  'noop' | 'restart';
