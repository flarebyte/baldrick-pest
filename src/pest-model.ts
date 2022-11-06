import { z } from 'zod';
import { stringy } from './field-validation.js';
import { formatMessage, ValidationError } from './format-message.js';
import { Result, succeed, fail } from './railway.js';

const linkPage = z
  .object({
    title: stringy.title,
    url: stringy.url,
  })
  .describe('Info about a link');

const links = z.array(linkPage).optional().describe('A list of useful links');

const lineShell = z.string().min(1).max(300).describe('A line of shell script');

const stdin = z
  .object({
    step: z.number().int().min(0).max(10),
    exitCode: stringy.exitCode,
    receiving: stringy.capture,
  })
  .optional()
  .describe('Populate from stdout of step');

const expect = z
  .object({
    exitCode: stringy.exitCode,
    capture: stringy.capture,
    snapshot: stringy.basename.optional(),
  })
  .optional()
  .describe('Expectation');

const stepShell = z
  .object({
    title: stringy.title,
    description: stringy.description.optional(),
    motivation: stringy.motivation.optional(),
    links,
    stdin,
    run: lineShell,
    expect,
  })
  .describe('Configuration for the batch shell script');

const useCase = z
  .object({
    name: z.string().max(1).default(''),
    title: stringy.title,
    description: stringy.description.optional(),
    motivation: stringy.motivation.optional(),
    links,
    steps: z.array(stepShell),
  })
  .describe('Configuration for use case');
const schema = z
  .object({
    title: stringy.title,
    cases: z.record(stringy.customKey, useCase),
  })
  .strict()
  .describe('A list of tests for a given function');

export type PestModel = z.infer<typeof schema>;
export type StepModel = z.infer<typeof stepShell>;

export type UseCaseModel = z.infer<typeof useCase>;

export type PestModelValidation = Result<PestModel, ValidationError[]>;

export const safeParseBuild = (content: unknown): PestModelValidation => {
  const result = schema.safeParse(content);
  if (result.success) {
    return succeed(result.data);
  }

  const {
    error: { issues },
  } = result;
  const errors = issues.map(formatMessage);
  return fail(errors);
};

export const getSchema = (_name: 'default') => {
  return schema;
};
