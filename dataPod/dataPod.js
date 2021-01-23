class DataPod {
    request;
    areaType;
    areaName;
    id;
    feed;
    url;
    colour;
    data;
    metric;
    index;
    container;
    podCollection;
    dom = {};

    // data points
    lastUpdated;
    population;

    constructor(options) {
        var styles = document.createElement("link");
        styles.setAttribute("href", "./dataPod/dataPod.css");
        styles.setAttribute("rel", "stylesheet");
        styles.setAttribute("type", "text/css");

        document.head.appendChild(styles);

        this.colour = options.colour;
        this.metric = options.metric;
        this.feed = options.feed;
        this.id =
            Math.round(Math.random() * 1000).toString() +
            Date.now().toString() +
            Math.round(Math.random() * 1000).toString();

        this.podCollection = options.podCollection;

        this.container = document.createElement("div");
        this.container.classList.add("dataPod");
        this.container.style.color = this.colour;

        this.formRequestAndFetch()
            .then((data) => {
                this.extractMetrics(data);
                this.podCollection.registerPod(this);
                this.buildScaffold();
                this.update(data);
                if (options.onComplete) {
                    options.onComplete(this);
                }
            })
            .catch(() => {
                if (options.onFailure) {
                    options.onFailure(this);
                }
            });
    }

    buildScaffold = () => {
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
            this.areaName = this.feed.split("|")[0];

            this.areaType = this.getAreaType(
                this.areaName,
                this.feed.split("|")[1]
            );

            this.url = this.constructURL(this.areaName, this.areaType);

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
        this.population = 12344;
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
                    this.url = this.constructURL(this.areaName, this.areaType);
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

    getAreaType = (areaName, areaType) => {
        if (
            areaType === "overview" ||
            areaType === "nation" ||
            areaType === "region" ||
            areaType === "utla" ||
            areaType == "ltla"
        ) {
            return areaType;
        }

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

    constructURL = (areaName, areaType) => {
        return (
            "https://coronavirus.data.gov.uk/api/v1/data?filters=" +
            "areaType=" +
            areaType +
            ";" +
            "areaName=" +
            encodeURI(areaName) +
            "&structure=%7B" +
            "%22areaType%22:%22areaType%22," +
            "%22areaName%22:%22areaName%22," +
            "%22date%22:%22date%22," +
            "%22newCasesByPublishDate%22:%22newCasesByPublishDate%22," +
            "%22newCasesByPublishDate%22:%22newCasesByPublishDate%22," +
            "%22newCasesBySpecimenDateRollingSum%22:%22newCasesBySpecimenDateRollingSum%22," +
            "%22newCasesBySpecimenDateRollingRate%22:%22newCasesBySpecimenDateRollingRate%22" +
            "%7D" +
            "&format=json"
        );
    };

    update = (newData) => {
        if (newData) {
            this.data = JSON.parse(JSON.stringify(newData)).filter((entry) => {
                return entry[this.metric.key];
            });
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
