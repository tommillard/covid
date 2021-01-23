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
        this.pods.push(pod);
        this.container.appendChild(pod.container);
    };

    podHasUpdated = (pod) => {
        this.app.podHasUpdated(pod);
    };

    removePod = (pod) => {
        let index = this.pods.indexOf(pod);
        if (index >= 0) {
            this.pods.splice(index, 1);
            this.container.removeChild(pod.container);
            this.app.podHasUpdated();
            this.app.updateStorage();
        }
    };
}
