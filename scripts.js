"use strict";

document.body
    .querySelector(".header_AddRegion")
    .addEventListener("pointerup", () => {
        document.body.classList.add("addPanel_Active");
        document.body.querySelector(".addPanel_Input").focus();
    });

document.body
    .querySelector(".addPanel_Cancel")
    .addEventListener("pointerup", () => {
        document.body.classList.remove("addPanel_Active");
        document.body.classList.remove("addError");
    });

document.body
    .querySelector(".addPanel_Submit")
    .addEventListener("pointerup", () => {
        addRegion();
    });

var delay = 500;

var feedList;

if (localStorage.getItem("covidFeeds")) {
    feedList = JSON.parse(localStorage.getItem("covidFeeds"));
} else {
    feedList = [
        "Newcastle-under-Lyme",
        "Staffordshire Moorlands",
        "South Staffordshire",
        "Bolton",
        "Warwick",
        "Staffordshire",
    ];
}

if (!localStorage.getItem("covidFeeds")) {
    localStorage.setItem("covidFeeds", JSON.stringify(feedList));
}

var nations = ["England", "Northern Ireland", "Scotland", "Wales"];
var regions = [
    "East Midlands",
    "East of England",
    "London",
    "North East",
    "North West",
    "South East",
    "South West",
    "West Midlands",
    "Yorkshire and The Humber",
];
var colours = [
    "#FFECDB",
    "#D10046",
    "#428BCA",
    "#F0AD4E",
    "#69D100",
    "#D695BE",
    "#7F8C8D",
    "#8E44AD",
    "#AD4363",
    "#D1D100",
    "#AD8D43",
];

if (!Array.isArray(feedList)) {
    feedList = [];
}

var dataCollection = new Array(feedList.length + 1);

feedList.forEach((feed, idx) => {
    requestAndBuild(feed, idx);
});

var mainCtx = document.querySelector(".mainGraph_Canvas");

var mainChart = new Chart(mainCtx, {
    type: "line",
    data: {
        datasets: convertDataForGraph(),
    },
    options: {
        maintainAspectRatio: false,
        parsing: {
            xAxisKey: "date",
            yAxisKey: "newCasesBySpecimenDateRollingRate",
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: (val) => {
                        return formatDate(val[0].label, "{{date}} {{month}}");
                    },
                    label: (val) => {
                        return " " + val.dataset.label;
                    },
                },
                multiKeyBackground: "#000",
                boxWidth: 5,
                boxHeight: 5,
                bodySpacing: 5,
                itemSort: (a, b) => {
                    return b.dataPoint.y - a.dataPoint.y;
                },
            },
        },
        scales: {
            x: {
                display: false,
                ticks: {
                    autoSkipPadding: 50,
                },
            },
            y: {
                display: false,
                ticks: {
                    autoSkipPadding: 50,
                },
            },
        },
    },
});

document.body
    .querySelector(".wrapper")
    .appendChild(document.createElement("hr"));

var nationWrapper = document.createElement("section");
nationWrapper.classList.add("dataPod");
nationWrapper.style.color = colours[0];

document.body.querySelector(".wrapper").appendChild(nationWrapper);

/*colours.forEach((colour) => {
    var r = document.createElement("div");
    r.style.backgroundColor = colour;
    r.style.width = "30px";
    r.style.height = "30px";
    document.body.querySelector(".wrapper").appendChild(r);
});*/

fetch(constructURL("England|nation"))
    .then((response) => response.json())
    .then((json) => {
        var lastUpdate = formatDate(
            json.data[0].date,
            "{{day}} {{date}} {{month}}"
        );
        document.querySelector(".header_LastUpdated").textContent =
            "Last Updated: " + lastUpdate;
        dataCollection[0] = {
            values: json.data,
            colour: colours[0],
        };
        mainChart.data.datasets = convertDataForGraph();
        mainChart.update("resize");
        addPanel(json.data, nationWrapper);
    });

function convertDataForGraph() {
    var dataForGraph = dataCollection.map((dataSet) => {
        return {
            data: dataSet.values
                .filter((entry) => {
                    return entry.newCasesBySpecimenDateRollingRate;
                })
                .slice(0, 120)
                .reverse(),
            borderColor: dataSet.colour,
            borderWidth: 1,
            pointRadius: 0,
            pointHitRadius: 10,
            label: dataSet.values[0].areaName,
        };
    });

    dataForGraph = dataForGraph.filter((d) => {
        return d.data.length;
    });

    return dataForGraph;
}

function addPanel(data, wrapper) {
    var title = document.createElement("h2");
    title.classList.add("dataPod_Title");
    title.textContent = data[0].areaName;
    wrapper.appendChild(title);

    var remove = document.createElement("a");
    remove.classList.add("dataPod_Remove");
    remove.textContent = "[X]";
    remove.addEventListener("pointerup", (e) => {
        removeRegion(e);
    });
    wrapper.appendChild(remove);

    var summary = document.createElement("summary");
    summary.classList.add("dataPod_Summary");

    data = data.filter((entry) => {
        return entry.newCasesBySpecimenDateRollingSum;
    });

    var day1Change = document.createElement("figure");
    day1Change.classList.add("dataPod_SummaryItem");
    var day1Value = document.createElement("h3");
    day1Value.classList.add("dataPod_SummaryValue");
    day1Value.textContent = generatePercentageChange(
        data[0].newCasesBySpecimenDateRollingSum,
        data[1].newCasesBySpecimenDateRollingSum
    );
    if (day1Value.textContent.substr(0, 1) === "+") {
        day1Value.classList.add("dataPod_SummaryValue-Pos");
    } else if (day1Value.textContent.substr(0, 1) === "-") {
        day1Value.classList.add("dataPod_SummaryValue-Neg");
    }

    var day1Caption = document.createElement("figCaption");
    day1Caption.classList.add("dataPod_SummaryLabel");
    day1Caption.textContent = "from yesterday";
    day1Change.appendChild(day1Value);
    day1Change.appendChild(day1Caption);

    var day7Change = document.createElement("figure");
    day7Change.classList.add("dataPod_SummaryItem");
    var day7Value = document.createElement("h3");
    day7Value.classList.add("dataPod_SummaryValue");
    day7Value.textContent = generatePercentageChange(
        data[0].newCasesBySpecimenDateRollingSum,
        data[7].newCasesBySpecimenDateRollingSum
    );
    if (day7Value.textContent.substr(0, 1) === "+") {
        day7Value.classList.add("dataPod_SummaryValue-Pos");
    } else if (day7Value.textContent.substr(0, 1) === "-") {
        day7Value.classList.add("dataPod_SummaryValue-Neg");
    }

    var day7Caption = document.createElement("figCaption");
    day7Caption.classList.add("dataPod_SummaryLabel");
    day7Caption.textContent = "from last week";
    day7Change.appendChild(day7Value);
    day7Change.appendChild(day7Caption);

    var rate = document.createElement("figure");
    rate.classList.add("dataPod_SummaryItem");
    var rateValue = document.createElement("h3");
    rateValue.classList.add("dataPod_SummaryValue");
    rateValue.textContent = data[0].newCasesBySpecimenDateRollingRate;

    var rateCaption = document.createElement("figCaption");
    rateCaption.classList.add("dataPod_SummaryLabel");
    rateCaption.textContent = "cases per 100k";
    rate.appendChild(rateValue);
    rate.appendChild(rateCaption);

    summary.appendChild(day1Change);
    summary.appendChild(day7Change);
    summary.appendChild(rate);

    wrapper.appendChild(summary);

    var dataLabel = document.createElement("p");
    dataLabel.classList.add("dataPod_RawData-Title");
    dataLabel.textContent = "Cases by day";
    //wrapper.appendChild(dataLabel);

    var dataWrapper = document.createElement("div");
    dataWrapper.classList.add("dataPod_RawData");
    wrapper.appendChild(dataWrapper);

    data.forEach((entry, idx) => {
        var entryWrapper = document.createElement("div");
        entryWrapper.classList.add("dataPod_RawDataItem");

        var date = document.createElement("time");
        date.classList.add("dataPod_RawData-Date");
        date.innerHTML = formatDate(entry.date, "{{date}}/{{monthNum}}");
        entryWrapper.appendChild(date);

        var value = document.createElement("b");
        value.classList.add("dataPod_RawData-Value");
        value.innerHTML = entry.newCasesByPublishDate;
        value.innerHTML = entry.newCasesBySpecimenDateRollingSum;
        entryWrapper.appendChild(value);

        dataWrapper.appendChild(entryWrapper);
    });
}

function generatePercentageChange(newValue, oldValue) {
    var percentageChange = ((newValue - oldValue) / oldValue) * 100;
    var str = percentageChange.toFixed(1) + "%";
    if (percentageChange > 0) {
        return "+" + str;
    } else {
        return str;
    }
}

function requestAndBuild(feed, idx, freshRequest, onComplete) {
    var ltlaWrapper = document.createElement("section");
    ltlaWrapper.classList.add("dataPod");
    ltlaWrapper.style.color = colours[idx + 1];
    ltlaWrapper.setAttribute("data-idx", idx.toString());
    if (freshRequest) {
        document.body
            .querySelector(".wrapper")
            .insertBefore(ltlaWrapper, document.body.querySelector("hr"));
    } else {
        document.body.querySelector(".wrapper").appendChild(ltlaWrapper);
    }
    setTimeout(
        () => {
            fetch(constructURL(feed))
                .then((response) => response.json())
                .then((json) => {
                    updateLocalStorage(json.data[0], idx);
                    dataCollection[idx + 1] = {
                        values: json.data,
                        colour: colours[idx + 1],
                    };
                    mainChart.data.datasets = convertDataForGraph();
                    mainChart.update("resize");
                    addPanel(json.data, ltlaWrapper);

                    if (onComplete) {
                        onComplete(true);
                    }
                })
                .catch(() => {
                    fetch(constructURL(feed + "|utla"))
                        .then((response) => response.json())
                        .then((json) => {
                            updateLocalStorage(json.data[0], idx);
                            dataCollection[idx + 1] = {
                                values: json.data,
                                colour: colours[idx + 1],
                            };
                            mainChart.data.datasets = convertDataForGraph();
                            mainChart.update();
                            addPanel(json.data, ltlaWrapper);

                            if (onComplete) {
                                onComplete(true);
                            }
                        })
                        .catch(() => {
                            if (onComplete) {
                                onComplete(false);
                            }
                        });
                });
        },
        freshRequest ? 0 : delay * idx
    );
}

function formatDate(date, format) {
    // day date month
    var formattedDate = new Date(date).toString().split(" ");
    var monthNum = new Date(date).getMonth() + 1;

    var finalDate = format.replace("{{day}}", formattedDate[0]);
    finalDate = finalDate.replace("{{month}}", formattedDate[1]);
    finalDate = finalDate.replace("{{date}}", formattedDate[2]);
    finalDate = finalDate.replace("{{monthNum}}", monthNum);

    return finalDate;
}

function addRegion() {
    var regionName = document.querySelector(".addPanel input").value.trim();

    if (regionName === "") {
        return;
    }

    requestAndBuild(regionName, feedList.length, true, (success) => {
        if (!success) {
            document.body.classList.add("addError");
            document.body
                .querySelector(".wrapper")
                .removeChild(
                    document.body.querySelector(
                        `[data-idx="${feedList.length}"]`
                    )
                );
        } else {
            document.body.classList.remove("addError");
            document.querySelector(".addPanel input").value = "";
            document.body.classList.remove("addPanel_Active");
        }
    });
}

function removeRegion(e) {
    var regionIdx = e.target.closest("section").getAttribute("data-idx");
    document.body
        .querySelector(".wrapper")
        .removeChild(e.target.closest("section"));
    feedList.splice(parseInt(regionIdx, 0), 1);
    var podList = document.querySelectorAll("section");

    for (var i = 0; i < podList.length; i++) {
        podList[i].setAttribute("data-idx", i.toString());
    }
    localStorage.setItem("covidFeeds", JSON.stringify(feedList));
}

function updateURL() {
    newURL = localStorage["covidFeeds"].reduce((accumulator, current) => {
        return accumulator;
    }, window.location.origin + window.location.pathname + "?feeds=");
}

function updateLocalStorage(entry, idx) {
    feedList[idx] = `${entry.areaName}|${entry.areaType}`;
    localStorage.setItem("covidFeeds", JSON.stringify(feedList));
}

function constructURL(areaName) {
    var splitName = areaName.split("|");

    var areaType;

    if (splitName[1]) {
        areaType = splitName[1];
    } else if (areaName.toLowerCase() == "united kingdom") {
        areaType = "overview";
    } else if (nations.indexOf(areaName.toLowerCase()) >= 0) {
        areaType = "nation";
    } else if (regions.indexOf(areaName.toLowerCase()) >= 0) {
        areaType = "region";
    } else {
        areaType = "ltla";
    }

    return (
        "https://coronavirus.data.gov.uk/api/v1/data?filters=" +
        "areaType=" +
        areaType +
        ";" +
        "areaName=" +
        encodeURI(splitName[0]) +
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
}
