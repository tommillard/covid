const constructURL = (areaName, areaType, metrics) => {
    let url = metrics.reduce((accumulator, current) => {
        accumulator += `%22${current.requestedKey}%22:%22${current.requestedKey}%22,`;
        return accumulator;
    }, "https://coronavirus.data.gov.uk/api/v1/data?filters=" + "areaType=" + areaType + ";" + "areaName=" + encodeURI(areaName) + "&structure=%7B" + "%22areaType%22:%22areaType%22," + "%22areaName%22:%22areaName%22," + "%22date%22:%22date%22," + "%22newCasesByPublishDate%22:%22newCasesByPublishDate%22,");

    url += `%22newCasesBySpecimenDateRollingSum%22:%22newCasesBySpecimenDateRollingSum%22`;
    url += "%7D&format=json";
    return url;
};
