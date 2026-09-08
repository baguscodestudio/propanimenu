import { isEnvBrowser } from "$lib/misc";

export class AppState {
    visible = $state(isEnvBrowser());

    setVisible(show: boolean) {
        this.visible = show;
    }
}

export const appState = new AppState();
