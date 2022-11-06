import { StepModel, UseCaseModel } from './pest-model.js';
import { Result } from './railway.js';


export interface StepCaseExecutionContext {
  step: StepModel,
  useCase: UseCaseModel,

  expected?: string;
  isNewSnapshot: boolean;

}

export type StepExecuteResult = Result<
  { context: StepCaseExecutionContext; actual: string },
  {
    context: StepCaseExecutionContext;
    message: string;
    stack?: string;
  }
>;
