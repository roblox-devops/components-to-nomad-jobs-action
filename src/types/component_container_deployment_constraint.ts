import type { TComponentConstraintDeploymentConfigOperatorType } from './component_container_deployment_config_operator_type.js';

/**
 * Component Container Deployment Constraint model
 * @remarks Maps to the Nomad constraint model.
 * @see https://www.nomadproject.io/docs/job-specification/constraint
 */
export interface TComponentContainerDeploymentConstraint {
  /**
   * Gets the attribute to apply the constraint on.
   * @remarks Maps to job.constraints.attribute.
   */
  attribute: string;

  /**
   * Gets the operator to use for the constraint.
   * @remarks Maps to job.constraints.operator.
   */
  operator: TComponentConstraintDeploymentConfigOperatorType;

  /**
   * Gets the value to compare the attribute against.
   * @remarks Maps to job.constraints.value.
   */
  value?: string;
}
