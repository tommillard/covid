const constructURL = (areaName, areaType, metrics) => {
    let url = metrics.reduce((accumulator, current) => {
        accumulator += `%22${current.requestedKey}%22:%22${current.requestedKey}%22,`;
        return accumulator;
    }, "https://coronavirus.data.gov.uk/api/v1/data?filters=" + "areaType=" + areaType + ";" + "areaName=" + encodeURI(areaName) + "&structure=%7B" + "%22areaType%22:%22areaType%22," + "%22areaName%22:%22areaName%22," + "%22date%22:%22date%22," + "%22newCasesByPublishDate%22:%22newCasesByPublishDate%22,");

    url += `%22newCasesBySpecimenDateRollingSum%22:%22newCasesBySpecimenDateRollingSum%22`;
    url += "%7D&format=json";
    console.log(url);
    return url;
};

//let url = `https://coronavirus.data.gov.uk/api/v1/data?filters=areaType=nhsTrust;areaName=University%2520Hospitals%2520of%2520North%2520Midlands%2520NHS%2520Trust&structure=%7B%22areaType%22:%22areaType%22,%22areaName%22:%22areaName%22,%22areaCode%22:%22areaCode%22,%22date%22:%22date%22,%22newAdmissions%22:%22newAdmissions%22,%22cumAdmissions%22:%22cumAdmissions%22%7D&format=json`;

//https://coronavirus.data.gov.uk/api/v1/data?filters=areaType=trust;areaName=University%20Hospitals%20of%20North%20Midlands%20NHS%20Trust&structure=%7B%22areaType%22:%22areaType%22,%22areaName%22:%22areaName%22,%22date%22:%22date%22,%22newCasesByPublishDate%22:%22newCasesByPublishDate%22,%22newAdmissions%22:%22newAdmissions%22,%22newCasesBySpecimenDateRollingSum%22:%22newCasesBySpecimenDateRollingSum%22%7D&format=json
