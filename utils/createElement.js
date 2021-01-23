function createElement(options) {
    if (!options) {
        return;
    }

    let node = document.createElement(options.elementType || "div");

    node.innerHTML = options.innerHTML || "";

    for (var prop in options) {
        if (
            prop === "elementType" ||
            prop === "innerHTML" ||
            prop === "appendTo"
        ) {
            continue;
        }
        node.setAttribute(prop, options[prop]);
    }

    if (options.appendTo) {
        options.appendTo.appendChild(node);
    }

    return node;
}
