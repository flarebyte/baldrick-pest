import { z } from 'zod';
import { stringy } from './field-validation.js';
import { formatMessage, type ValidationError } from './format-message.js';
import type { Result } from './railway.js';
import { fail, succeed } from './railway.js';

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
  .describe('Populate from stdout of step');

const expect = z
  .object({
    exitCode: stringy.exitCode.default('exit 0'),
    capture: stringy.capture,
    snapshot: stringy.basename.optional(),
    ignoreTrailingBlankLines: z.boolean().optional(),
  })
  .describe('Expectation');

const stepShell = z
  .object({
    title: stringy.title,
    description: stringy.description.optional(),
    motivation: stringy.motivation.optional(),
    links,
    stdin: stdin.optional(),
    run: lineShell,
    expect: expect.optional(),
  })
  .describe('Configuration for the batch shell script');

const useCase = z
  .object({
    name: z.string().max(1).default(''),
    title: stringy.title,
    description: stringy.description.optional(),
    motivation: stringy.motivation.optional(),
    todo: stringy.todo.optional(),
    links,
    steps: z.array(stepShell),
  })
  .describe('Configuration for the use case');
const schema = z
  .object({
    title: stringy.title,
    description: stringy.description.optional(),
    motivation: stringy.motivation.optional(),
    links,
    cases: z.record(stringy.customKey, useCase),
  })
  .strict()
  .describe('A list of tests that run shells commands');

export type PestModel = z.infer<typeof schema>;
export type StepModel = z.infer<typeof stepShell>;

export type UseCaseModel = z.infer<typeof useCase>;

export type StdinModel = z.infer<typeof stdin>;

export type ExpectModel = z.infer<typeof expect>;

export type ExitCodeModel = z.infer<typeof stringy.exitCode>;

export type PestModelValidation = Result<PestModel, ValidationError[]>;

export const safeParseBuild = (content: unknown): PestModelValidation => {
  const result = schema.safeParse(content);
  if (result.success) {
    return succeed(result.data);
  }

  const {
    error: { issues },
  } = result;
  const errors = issues.map((issue) => formatMessage(issue));
  return fail(errors);
};

export const getSchema = (_name: 'default') => schema;
