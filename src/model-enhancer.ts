import { PestModel } from "./pest-model.js";

export const enhanceModel = (model: PestModel): PestModel => {
    const {title, cases} = model;
    return { title, cases}
}