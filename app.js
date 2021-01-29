class App {
    delay = 500;

    feedList;

    container;

    header;
    masterChart;
    areaPods;
    nationalPods;

    loadedPods = [];

    availableMetrics = [
        {
            label: "Cases/100k",
            key: "newCasesBySpecimenDateRollingRate",
            active: true,
        },
    ];

    currentMetric;

    constructor() {
        this.container = document.createElement("main");
        this.container.style.opacity = 0;

        this.header = new Header(this);
        this.container.appendChild(this.header.container);

        this.masterChart = new MasterChart(this);
        this.container.appendChild(this.masterChart.container);

        this.areaPods = new PodCollection(this);
        this.container.appendChild(this.areaPods.container);

        let divider = document.createElement("div");
        divider.classList.add("divider");
        this.container.appendChild(divider);

        this.nationalPods = new PodCollection(this);
        this.container.appendChild(this.nationalPods.container);

        this.addPanel = new AddPanel(this);
        this.container.appendChild(this.addPanel.container);

        this.feedList = this.loadFeedList();

        this.currentMetric = this.availableMetrics.find((metric) => {
            return metric.active;
        });

        const backupTimer = setTimeout(() => {
            this.container.style.opacity = 1;
        }, 2000);

        new DataPod({
            feed: "England|nation",
            metric: this.currentMetric,
            podCollection: this.nationalPods,
            idx: 0,
            colour: "#FFECDB",
        });

        this.convertOldStyleFeedList();

        this.feedList.forEach((feed, idx) => {
            new DataPod({
                feed: `${feed.areaName}|${feed.areaType}`,
                metric: this.currentMetric,
                podCollection: this.areaPods,
                index: idx,
                colour: feed.colour,
            });
        });

        return;
        let newAddition = new DataPod({
            feed: null,
            metric: this.currentMetric,
            podCollection: this.areaPods,
            index: this.feedList.length,
            colour: null,
        });
    }

    convertOldStyleFeedList = () => {
        if (!this.feedList.length || this.feedList[0].colour) {
            return;
        }
        this.feedList = this.feedList.map((feed, idx) => {
            return {
                areaName: feed.split("|")[0],
                areaType: feed.split("|")[1],
                colour: Presets.colours[idx % Presets.colours.length],
            };
        });

        if (localStorage.getItem("covidFeeds")) {
            localStorage.setItem("covidFeeds", JSON.stringify(this.feedList));
        }
    };

    loadFeedList = () => {
        let feedList;

        if (localStorage.getItem("covidFeeds")) {
            feedList = JSON.parse(localStorage.getItem("covidFeeds"));
        } else {
            feedList = Presets.initialFeed;
        }

        if (!Array.isArray(feedList)) {
            feedList = [];
        }

        return feedList;
    };

    showAddPanel = () => {
        this.addPanel.show();
    };

    addRegion = (regionString) => {
        new DataPod({
            feed: regionString,
            metric: this.currentMetric,
            podCollection: this.areaPods,
            index: this.areaPods.length,
            colour: this.chooseNewColour(),
            onComplete: (pod) => {
                this.addPanel.hide();
                this.addPanel.clear();
                this.updateStorage();
            },
            onFailure: (pod) => {
                this.areaPods.removePod(pod);
                this.addPanel.showError();
            },
        });
    };

    chooseNewColour = (idx) => {
        let chosenColour;

        Presets.colours.forEach((colour, idx) => {
            if (idx === 0 || chosenColour) {
                return;
            }
            let podUsingThisColour = this.areaPods.pods.find((pod) => {
                return pod.colour === colour;
            });

            if (!podUsingThisColour) {
                chosenColour = colour;
            }
        });

        if (!chosenColour) {
            return Presets.colours[idx % Presets.colours.length];
        } else {
            return chosenColour;
        }
    };

    podHasUpdated = (pod) => {
        this.masterChart.update();
        if (pod && this.loadedPods.indexOf(pod.id) < 0) {
            this.header.setLastUpdated(pod.lastUpdated);
            this.loadedPods.push(pod.id);
        }
        localS;
        if (this.loadedPods.length === this.feedList.length + 1) {
            this.container.style.opacity = 1;
        }
    };

    updateStorage = () => {
        // need this to be a bit more targetted, so it doesn't nuke regions when there's a loading problem.
        // we should use ids to remove/add regions more specifically.
        this.feedList = this.areaPods.pods.map((pod) => {
            return {
                areaName: pod.areaName,
                areaType: pod.areaType,
                colour: pod.colour,
            };
        });

        localStorage.setItem("covidFeeds", JSON.stringify(this.feedList));
    };
}
