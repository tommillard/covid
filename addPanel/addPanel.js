class AddPanel {
    app;
    input;

    constructor(app) {
        this.app = app;

        var styles = document.createElement("link");
        styles.setAttribute("href", "./addPanel/addPanel.css");
        styles.setAttribute("rel", "stylesheet");
        styles.setAttribute("type", "text/css");
        document.head.appendChild(styles);

        this.container = document.createElement("div");
        this.container.classList.add("addPanel");

        const intro = document.createElement("p");
        intro.classList.add("addPanel_Intro");
        intro.innerHTML = `Please enter the region name <b>exactly</b> as it appears on the government's coronavirus reports.`;
        this.container.appendChild(intro);

        const errorMessage = createElement({
            elementType: "p",
            class: "addPanel_Error",
            innerHTML: `The region you entered did not return any results. Try finding
                the exact name of your region
                <a
                    class="addPanel_Link"
                    href="https://coronavirus.data.gov.uk/details/interactive-map"
                    target="_blank"
                    >here</a
                >.`,
        });
        this.container.appendChild(errorMessage);

        this.input = createElement({
            elementType: "input",
            class: "addPanel_Input",
            type: "text",
            autocomplete: "false",
            placeholder: "e.g. Staffordshire",
        });
        this.container.appendChild(this.input);

        const submitButton = createElement({
            elementType: "button",
            class: "addPanel_Submit",
            innerHTML: `Add Region`,
        });
        submitButton.addEventListener("pointerup", () => {
            let trimmedInput = this.input.value.trim();
            if (trimmedInput === "") {
                return;
            }
            this.app.addRegion(trimmedInput);
        });

        this.container.appendChild(submitButton);

        const cancelButton = createElement({
            elementType: "button",
            class: "addPanel_Cancel",
            innerHTML: `Cancel`,
        });
        cancelButton.addEventListener("pointerup", () => {
            this.hide();
            this.clear();
        });
        this.container.appendChild(cancelButton);
    }

    show = () => {
        document.documentElement.classList.add("addPanel_Active");
        setTimeout(() => {
            this.input.focus();
        }, 200);
    };

    hide = () => {
        document.documentElement.classList.remove("addPanel_Active");
        document.documentElement.classList.remove("addError");
    };

    clear = () => {
        this.input.value = "";
    };

    showError = () => {
        document.documentElement.classList.add("addError");
    };
}
