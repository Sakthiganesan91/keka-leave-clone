import { init, RematchDispatch, RematchRootState } from "@rematch/core";
import { models, RootModel } from "../models";

const store = init({
  models,
});

export type RootState = RematchRootState<RootModel>;
export type Dispatch = RematchDispatch<RootModel>;

export default store;
