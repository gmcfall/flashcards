import { getClientState, TypedClientStateGetter } from "../fbase/functions";
import { LerniApp } from "./types";


export const appGetState: TypedClientStateGetter<LerniApp> = getClientState;