import AppState from "./AppState";
import ScorecardStore from "./ScorecardStore";
import SystemProgressStore from "./SystemProgressStore";

export default {
	appState: new AppState(),
    scorecard: new ScorecardStore(),
    systemProgress: new SystemProgressStore(),
};
