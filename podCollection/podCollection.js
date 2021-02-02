class PodCollection {
    pods = [];
    container;
    constructor(app) {
        this.app = app;

        var styles = document.createElement("link");
        styles.setAttribute("href", "./podCollection/podCollection.css");
        styles.setAttribute("rel", "stylesheet");
        styles.setAttribute("type", "text/css");
        document.head.appendChild(styles);

        this.container = document.createElement("div");
        this.container.classList.add("podCollection");
    }

    registerPod = (pod) => {
        this.container.appendChild(pod.container);
        this.pods.push(pod);
    };

    podHasLoadedData = (pod) => {
        this.app.podHasLoadedData(pod);
    };

    podHasUpdated = (pod) => {
        this.app.podHasUpdated(pod);
    };

    startAdditionProcess = (pod) => {
        this.app.showAddPanel();
    };

    updateMetric = (newMetric) => {
        this.pods.forEach((pod) => {
            pod.metric = newMetric;
            pod.update();
        });
    };

    removePod = (pod) => {
        let index = this.pods.indexOf(pod);
        if (index >= 0) {
            this.pods.splice(index, 1);
            this.container.removeChild(pod.container);
            this.app.podHasUpdated();
            this.app.removePodFromStorage(pod);
            this.app.masterChart.update();
        }
    };
}
