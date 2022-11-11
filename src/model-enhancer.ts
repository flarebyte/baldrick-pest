import { PestModel } from './pest-model.js';

export const enhanceModel = (model: PestModel): PestModel => {
  const { title, cases } = model;
  for (const key of Object.keys(cases)) {
    let caseObj = cases[key];
    if (!caseObj) {
      continue;
    }
    caseObj.name = key;
  }
  return { title, cases };
};
