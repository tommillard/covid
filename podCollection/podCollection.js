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
        console.log(pod.areaName + " - " + pod.index);
        let added = false;
        for (var i = 0; i < this.container.children.length; i++) {
            let index = this.container.children[i].getAttribute("data-index");
            if (parseInt(index) > pod.index) {
                this.container.insertBefore(
                    pod.container,
                    this.container.children[i]
                );
                added = true;
                break;
            }
        }

        if (!added) {
            this.container.appendChild(pod.container);
        }

        this.pods.push(pod);
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
            this.app.updateStorage(pod);
        }
    };
}
