import type { PestModel } from './pest-model.js';

export const enhanceModel = (model: PestModel): PestModel => {
  const { title, cases } = model;
  for (const key of Object.keys(cases)) {
    const caseObject = cases[key];
    if (!caseObject) {
      continue;
    }

    caseObject.name = key;
  }

  return { title, cases };
};
