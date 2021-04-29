"use strict";

class MasterChart {
    container;
    context;
    chart;
    app;
    range = 120;

    constructor(app) {
        createElement({
            elementType: "link",
            href: "./masterChart/masterChart.css",
            rel: "stylesheet",
            type: "text/css",
            appendTo: document.documentElement,
        });

        this.app = app;
        this.container = document.createElement("div");
        this.container.classList.add("masterChart");

        this.context = document.createElement("canvas");
        this.context.classList.add("masterChart_Canvas");
        this.container.appendChild(this.context);
        
        this.container.addEventListener("pointerup", ()=>{
            this.range = this.range === 120 ? 60 : 120;
            this.update();
        });

        this.chart = new Chart(this.context, {
            type: "line",
            data: {
                datasets: [],
            },
            options: {
                maintainAspectRatio: false,

                parsing: {
                    xAxisKey: "date",
                },
                elements: {
                    line: {
                        borderWidth: 1,
                        tension: 0.1,
                    },
                    point: {
                        radius: 0,
                        hitRadius: 10,
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            title: (val) => {
                                return formatDate(
                                    val[0].label,
                                    "{{date}} {{month}}"
                                );
                            },
                            label: (val) => {
                                return (
                                    " " +
                                    val.dataset.label +
                                    "  " +
                                    val.formattedValue
                                );
                            },
                        },
                        multiKeyBackground: "#000",
                        xPadding: 10,
                        yPadding: 10,
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
                            display: false,
                        },
                    },
                    y: {
                        ticks: {
                            display: false,
                        },
                    },
                },
            },
        });
    }

    update = () => {
        this.chart.options.parsing.yAxisKey = this.app.currentMetric.key;

        let datasets = this.app.areaPods.pods
            .filter((pod) => {
                return pod.data;
            })
            .map((areaPod) => {
                return {
                    data: JSON.parse(JSON.stringify(areaPod.data)).slice(
                        0,
                        this.range
                    ),
                    borderColor: areaPod.colour,
                    label: areaPod.data[0].areaName,
                };
            });

        if (
            this.app.nationalPods.pods[0] &&
            this.app.nationalPods.pods[0].data
        ) {
            datasets.splice(0, 0, {
                data: JSON.parse(
                    JSON.stringify(this.app.nationalPods.pods[0].data)
                ).slice(0, this.range),
                borderColor: this.app.nationalPods.pods[0].colour,
                label: this.app.nationalPods.pods[0].data[0].areaName,
            });
        }
        
        var ds= JSON.parse(JSON.stringify(datasets));

        this.chart.data.datasets = ds.map((dataset) => {
            return {
                data: dataset.data.reverse(),
                borderColor: dataset.borderColor,
                label: dataset.label,
            };
        });
        
        console.log(this.chart);

        this.chart.update();
    };
}
