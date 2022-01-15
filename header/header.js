class Header {
    addButton;
    lastUpdated;
    title;
    app;

    constructor(app) {
        var styles = document.createElement("link");
        styles.setAttribute("href", "./header/header.css");
        styles.setAttribute("rel", "stylesheet");
        styles.setAttribute("type", "text/css");
        document.head.appendChild(styles);

        this.app = app;

        this.container = document.createElement("header");
        this.container.classList.add("header");

        this.lastUpdated = document.createElement("p");
        this.lastUpdated.classList.add("header_LastUpdated");
        this.container.appendChild(this.lastUpdated);

        this.title = createElement({
            elementType: "h1",
            class: "header_Title",
            appendTo: this.container,
        });

        this.title.addEventListener("pointerup", () => {
            this.app.cycleMetric();
        });

        this.update();

        //this.addButton = document.createElement("button");
        //this.addButton.classList.add("header_AddRegion");
        //this.addButton.textContent = "Add Region";
        //this.addButton.addEventListener("pointerup", () => {
        //this.app.showAddPanel();
        //});
        //this.container.appendChild(this.addButton);
    }

    update = () => {
        this.title.innerHTML = `Daily <b class="header_Link">${this.app.currentMetric.label}</b>`;
    };

    setLastUpdated = (date) => {
        this.lastUpdated.textContent =
            "Last Updated: " + formatDate(date, "{{day}} {{date}} {{month}}");
    };
}
