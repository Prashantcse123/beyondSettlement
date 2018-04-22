import { store } from "rfx-core";

import AppState from "./AppState";
import ScorecardStore from "./ScorecardStore";

export default store.setup({
	appState: AppState,
    scorecard: ScorecardStore,
});
