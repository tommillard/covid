"use strict";

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
            label: "Daily Admissions",
            mainTitle: "Patients admitted to hospital with COVID",
            key: "newAdmissions",
            requestedKey: "newAdmissions",
            active: true,
        },
        {
            label: "Patients in Hospital",
            mainTitle: "Patients in hospital with COVID",
            key: "hospitalCases",
            requestedKey: "hospitalCases",
            active: false,
        },
        {
            label: "MV Beds Occupied",
            mainTitle: "Patients in hospital with COVID in MV Beds",
            key: "covidOccupiedMVBeds",
            requestedKey: "covidOccupiedMVBeds",
            active: false,
        },
    ];

    currentMetric;

    constructor() {
        this.container = document.createElement("main");
        this.container.style.opacity = 0;

        this.currentMetric = this.availableMetrics.find((metric) => {
            return metric.active;
        });

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

        const backupTimer = setTimeout(() => {
            this.container.style.opacity = 1;
        }, 2000);

        new DataPod({
            areaName: "University Hospitals of North Midlands NHS Trust",
            areaType: "nhsTrust",
            metric: this.currentMetric,
            podCollection: this.nationalPods,
            idx: 0,
            colour: "#FFECDB",
            availableMetrics: this.availableMetrics,
        });

        new DataPod({
            areaName: "England",
            areaType: "nation",
            metric: this.currentMetric,
            podCollection: this.nationalPods,
            idx: 0,
            colour: "#FFECDB",
            availableMetrics: this.availableMetrics,
        });

        /* this.convertOldStyleFeedList();

        this.feedList.forEach((feed, idx) => {
            new DataPod({
                areaName: feed.areaName,
                areaType: feed.areaType,
                metric: this.currentMetric,
                podCollection: this.areaPods,
                index: idx,
                colour: feed.colour,
                availableMetrics: this.availableMetrics,
            });
        }); 

        new DataPod({
            areaName: null,
            areaType: null,
            metric: this.currentMetric,
            podCollection: this.areaPods,
            index: this.feedList.length,
            colour: this.chooseNewColour(),
            availableMetrics: this.availableMetrics,
        });*/
    }

    cycleMetric = () => {
        let metricIndex = this.availableMetrics.findIndex((metric) => {
            return metric.active;
        });
        metricIndex++;
        this.currentMetric.active = false;
        this.currentMetric =
            this.availableMetrics[metricIndex % this.availableMetrics.length];
        this.currentMetric.active = true;
        this.header.update();
        this.areaPods.updateMetric(this.currentMetric);
        this.nationalPods.updateMetric(this.currentMetric);
        this.masterChart.update();
    };

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
        let podToUpdate = this.areaPods.pods[this.areaPods.pods.length - 1];

        podToUpdate.areaName = regionString;

        podToUpdate.attemptToLoadDataIntoPlaceholder({
            onComplete: (pod) => {
                this.addPanel.hide();
                this.addPanel.clear();
                this.addPodToStorage(pod);

                new DataPod({
                    areaName: null,
                    areaType: null,
                    metric: this.currentMetric,
                    podCollection: this.areaPods,
                    index: this.feedList.length,
                    colour: this.chooseNewColour(),
                    availableMetrics: this.availableMetrics,
                });

                this.masterChart.update();
            },
            onFailure: (pod) => {
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
        //this.masterChart.update();
    };

    podHasLoadedData = (pod) => {
        if (pod && this.loadedPods.indexOf(pod.id) < 0) {
            this.header.setLastUpdated(pod.lastUpdated);
            this.loadedPods.push(pod.id);
        }
        console.log(this.loadedPods.length, this.feedList.lengt);
        console.log(this.feedList);
        if (this.loadedPods.length === this.feedList.length) {
            this.container.style.opacity = 1;
            setTimeout(() => {
                console.log("hey");
                this.masterChart.update();
            }, 1000);
        }
    };

    addPodToStorage = (pod) => {
        let thisPodIndex = this.areaPods.pods.indexOf(pod);

        if (thisPodIndex < 0) {
            return;
        }

        this.feedList.splice(thisPodIndex, 0, {
            areaName: pod.areaName,
            areaType: pod.areaType,
            colour: pod.colour,
        });
        localStorage.setItem("covidFeeds", JSON.stringify(this.feedList));
    };

    removePodFromStorage = (pod) => {
        let thisPodIndex = this.feedList.findIndex((feed) => {
            return (
                feed.areaType === pod.areaType && feed.areaName === pod.areaName
            );
        });
        if (thisPodIndex < 0) {
            return;
        }
        this.feedList.splice(thisPodIndex, 1);
        localStorage.setItem("covidFeeds", JSON.stringify(this.feedList));
    };
}
