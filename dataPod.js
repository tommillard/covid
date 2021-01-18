var DataPod = function () {
    init = function (data) {
        this.data = JSON.parse(JSON.stringify(data));

        this.container = document.createElement("div");
        this.container.classList.add("dataPod");

        this.title = document.createElement("h1");
        this.title.classList.add("dataPod_Title");
        this.title.textContent = data[0].areaName;
        this.container.appendChild(this.title);
    };

    yell = function () {
        console.log("pop");
    };

    return {
        init: init,
        yell: yell,
    };
};
