/**
 * Component Constraint Deployment Config Operator Type
 * @remarks Maps to the Nomad constraint operators.
 * @see https://www.nomadproject.io/docs/job-specification/constraint
 */
export type TComponentConstraintDeploymentConfigOperatorType =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'distinct_hosts'
  | 'distinct_property'
  | 'regexp'
  | 'set_contains'
  | 'set_contains_any'
  | 'version'
  | 'semver'
  | 'is_set'
  | 'is_not_set';
