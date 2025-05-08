import { Models } from "@rematch/core";
import { userAuth } from "./userAuth";

export interface RootModel extends Models<RootModel> {
  userAuth: typeof userAuth;
}

export const models: RootModel = { userAuth };
