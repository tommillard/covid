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
