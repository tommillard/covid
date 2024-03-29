"use strict";

class DataPod {
    areaType;
    areaName;
    id;
    url;
    colour;
    data;
    rawData;
    metric;
    index;
    container;
    podCollection;
    dom = {};
    loaded = false;

    // data points
    lastUpdated;
    population;
    availableMetrics;

    constructor(options) {
        if (
            !document.head.querySelector(`link[href="./dataPod/dataPod.css"]`)
        ) {
            var styles = document.createElement("link");
            styles.setAttribute("href", "./dataPod/dataPod.css");
            styles.setAttribute("rel", "stylesheet");
            styles.setAttribute("type", "text/css");
            document.head.appendChild(styles);
        }

        this.colour = options.colour;
        this.metric = options.metric;
        this.areaName = options.areaName;
        this.availableMetrics = options.availableMetrics;
        this.index = options.index || 0;
        this.id =
            Math.round(Math.random() * 1000).toString() +
            Date.now().toString() +
            Math.round(Math.random() * 1000).toString();

        this.podCollection = options.podCollection;
        this.podCollection.startAdditionProcess =
            this.podCollection.startAdditionProcess.bind(this);

        this.container = document.createElement("div");
        this.container.classList.add("dataPod");
        this.container.style.color = this.colour || "transparent";
        this.podCollection.registerPod(this);

        this.buildStructure();

        if (!this.areaName) {
            this.placeholderMode();
            return;
        }

        this.areaType = options.areaType || this.guessAreaType(this.areaName);

        this.formRequestAndFetch()
            .then((data) => {
                this.successMode(data);
                if (options.onComplete) {
                    options.onComplete(this);
                }
            })
            .catch(() => {
                this.errorMode();
                if (options.onFailure) {
                    options.onFailure(this);
                }
            });
    }

    attemptToLoadDataIntoPlaceholder = (options) => {
        this.areaType = this.areaType || this.guessAreaType(this.areaName);

        this.formRequestAndFetch()
            .then((data) => {
                this.successMode(data);
                if (options.onComplete) {
                    options.onComplete(this);
                }
            })
            .catch(() => {
                if (options.onFailure) {
                    options.onFailure(this);
                }
            });
    };

    errorMode = () => {
        this.container.setAttribute("data-error", "");
    };

    successMode = (data) => {
        this.container.removeAttribute("data-error");
        this.container.removeAttribute("data-placeholder");
        this.extractMetrics(data);
        this.podCollection.podHasLoadedData(this);
        this.update(data);
        this.container.removeEventListener(
            "pointerup",
            this.podCollection.startAdditionProcess
        );
    };

    placeholderMode = () => {
        this.dom.title.textContent = "Add New Region";
        this.container.setAttribute("data-placeholder", "");
        this.container.addEventListener(
            "pointerup",
            this.podCollection.startAdditionProcess
        );
    };

    buildStructure = () => {
        this.dom.title = document.createElement("h2");
        this.dom.title.classList.add("dataPod_Title");
        this.container.appendChild(this.dom.title);

        this.dom.remove = document.createElement("a");
        this.dom.remove.classList.add("dataPod_Remove");
        this.dom.remove.textContent = "[X]";

        this.dom.remove.addEventListener("pointerup", (e) => {
            this.podCollection.removePod(this);
        });

        this.container.appendChild(this.dom.remove);

        this.dom.summary = document.createElement("summary");
        this.dom.summary.classList.add("dataPod_Summary");
        this.container.appendChild(this.dom.summary);

        this.dom.dataWrapper = document.createElement("div");
        this.dom.dataWrapper.classList.add("dataPod_RawData");
        this.container.appendChild(this.dom.dataWrapper);
    };

    formRequestAndFetch = () => {
        return new Promise((resolve, reject) => {
            this.url = constructURL(
                this.areaName,
                this.areaType,
                this.availableMetrics
            );
            this.fetchData().then((data) => {
                if (data) {
                    resolve(data);
                } else {
                    reject();
                }
            });
        });
    };

    extractMetrics = (data) => {
        this.lastUpdated = data[0].date;
        //debugger;
        const rollingRateEntry = data.find((entry) => {
            return entry.newCasesBySpecimenDateRollingRate;
        });

        if (rollingRateEntry) {
            this.population =
                (rollingRateEntry.newCasesBySpecimenDateRollingSum /
                    rollingRateEntry.newCasesBySpecimenDateRollingRate) *
                100000;
        }

        data.forEach((entry, idx) => {
            if (entry.newCasesBySpecimenDateRollingRate) {
                entry.newDeaths28DaysByDeathDataRollingRate =
                    this.calculateRollingRateFigure(data, entry, idx);
            }
        });
    };

    calculateRollingRateFigure = (dataSet, entry, idx) => {
        let sevenDayTotal = 0;

        for (var i = 0; i < 7; i++) {
            if (
                dataSet[idx + i] &&
                dataSet[idx + i].newDeaths28DaysByDeathDate
            ) {
                sevenDayTotal += dataSet[idx + i].newDeaths28DaysByDeathDate;
            }
        }

        return parseFloat(
            (sevenDayTotal / (this.population / 100000)).toFixed(1)
        );
    };

    remove = () => {};

    createSummaryItem = (valueString, label) => {
        var change = document.createElement("figure");
        change.classList.add("dataPod_SummaryItem");
        var value = document.createElement("h3");
        value.classList.add("dataPod_SummaryValue");
        value.textContent = valueString;

        if (value.textContent.substr(0, 1) === "+") {
            value.classList.add("dataPod_SummaryValue-Pos");
        } else if (value.textContent.substr(0, 1) === "-") {
            value.classList.add("dataPod_SummaryValue-Neg");
        }

        var caption = document.createElement("figCaption");
        caption.classList.add("dataPod_SummaryLabel");
        caption.textContent = label;
        change.appendChild(value);
        change.appendChild(caption);

        return change;
    };

    fetchData = () => {
        return new Promise((resolve, reject) => {
            fetch(this.url)
                .then((response) => response.json())
                .then((json) => {
                    resolve(json.data);
                })
                .catch(() => {
                    this.areaType = "utla";
                    this.url = constructURL(
                        this.areaName,
                        this.areaType,
                        this.availableMetrics
                    );
                    fetch(this.url)
                        .then((response) => response.json())
                        .then((json) => {
                            resolve(json.data);
                        })
                        .catch(() => {
                            resolve(null);
                        });
                });
        });
    };

    generatePercentageChange = (newValue, oldValue) => {
        var percentageChange = ((newValue - oldValue) / oldValue) * 100;
        var str = percentageChange.toFixed(1) + "%";
        if (percentageChange > 0) {
            return "+" + str;
        } else {
            return str;
        }
    };

    guessAreaType = (areaName) => {
        if (areaName.toLowerCase() == "united kingdom") {
            return "overview";
        } else if (Presets.nations.indexOf(areaName.toLowerCase()) >= 0) {
            return "nation";
        } else if (Presets.regions.indexOf(areaName.toLowerCase()) >= 0) {
            return "region";
        } else {
            return "ltla";
        }
    };

    getLowestSinceDate = (metricKey) => {
        let thisValue = this.data[0][metricKey];

        let previouslyBetterOn = this.data.find((dataPoint) => {
            return dataPoint[metricKey] < thisValue;
        }).date;

        return formatDate(previouslyBetterOn, "{{date}}/{{monthNum}}");
    };

    update = (newData) => {
        if (newData) {
            this.data = JSON.parse(JSON.stringify(newData)).filter((entry) => {
                return (
                    typeof entry[this.metric.key] !== "undefined" &&
                    entry[this.metric.key] !== null
                );
            });
            this.rawData = JSON.parse(JSON.stringify(newData));
        }

        if (!this.data) {
            return;
        }

        this.dom.summary.innerHTML = "";
        this.dom.dataWrapper.innerHTML = "";
        this.dom.title.innerHTML = this.data[0].areaName;

        var day1Change = this.generatePercentageChange(
            this.data[0][this.metric.key],
            this.data[1][this.metric.key]
        );
        var day1 = this.createSummaryItem(day1Change, "from yesterday");
        this.dom.summary.appendChild(day1);

        var day7Change = this.generatePercentageChange(
            this.data[0][this.metric.key],
            this.data[7][this.metric.key]
        );
        var day7 = this.createSummaryItem(day7Change, "from last week");
        this.dom.summary.appendChild(day7);

        var rate = this.createSummaryItem(
            this.data[0][this.metric.key],
            this.metric.label
        );
        this.dom.summary.appendChild(rate);

        let lowestSinceDate = this.getLowestSinceDate(this.metric.key);

        var lowestSince = this.createSummaryItem(
            lowestSinceDate,
            "lowest since"
        );
        this.dom.summary.appendChild(lowestSince);

        this.data.forEach((entry, idx) => {
            var entryWrapper = document.createElement("div");
            entryWrapper.classList.add("dataPod_RawDataItem");

            var date = document.createElement("time");
            date.classList.add("dataPod_RawData-Date");
            date.innerHTML = formatDate(entry.date, "{{date}}/{{monthNum}}");
            entryWrapper.appendChild(date);

            var value = document.createElement("b");
            value.classList.add("dataPod_RawData-Value");
            value.innerHTML = entry.newCasesByPublishDate;
            value.innerHTML = entry[this.metric.key];
            entryWrapper.appendChild(value);

            this.dom.dataWrapper.appendChild(entryWrapper);
        });

        this.podCollection.podHasUpdated(this);
    };
}
