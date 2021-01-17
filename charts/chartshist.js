/**
 * initializes live charts and sets interval
 */
function initCharts() {
    document.getElementById("timing").innerHTML = "";

    charts = [
        new Chart(document.getElementById('chart-temperatur'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Maximum der ' + sensors[0].funktionalitaet + ' in ' + sensors[0].messeinheit,
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 0.7)',
                borderWidth: 1
            }, {
                label: 'Minimum der ' + sensors[0].funktionalitaet + ' in ' + sensors[0].messeinheit,
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 0.7)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
        },
    }),
        new Chart(document.getElementById('chart-humidity'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Maximum der ' + sensors[1].funktionalitaet + ' in ' + sensors[1].messeinheit,
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }, {
                label: 'Minimum der ' + sensors[1].funktionalitaet + ' in ' + sensors[1].messeinheit,
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
        }
    }),
        new Chart(document.getElementById('chart-co2'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Maximum der ' + sensors[2].funktionalitaet + ' in ' + sensors[2].messeinheit,
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Minimum der ' + sensors[2].funktionalitaet + ' in ' + sensors[2].messeinheit,
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            }
        }
    }),
        new Chart(document.getElementById('chart-flood'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: sensors[3].funktionalitaet + ' in ' + sensors[3].messeinheit,
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })
    ]

    intervalSelect.addEventListener("change", updateSummaryChartsTrigger);

    if (!Number.isInteger(intervalSelectIndex)) {
        intervalSelectIndex = 1;
    }
    intervalSelect.selectedIndex = intervalSelectIndex;
    updateSummaryChartsTrigger(intervalSelectIndex);
}

/**
 * updates the charts
 * @param interval {string} the interval in which the data should be summarized, options are "min", "10min", "hr", "day"
 * @param from {Date} the date since when the data should be loaded
 * @param to {Date} the date until when the data should be loaded
 */
function updateSummaryCharts(interval, from = new Date(2000, 1, 1), to = new Date()) {
    for (let i = 0; i < 4; i++) {
        updateSummaryChartWithValuesFromDB(i, from, to, interval);
    }
}

/**
 * updates a chart by requesting data from the server
 * @param id {number} the id of the sensor and chart
 * @param from {Date} the date since when the data should be loaded
 * @param to {Date} the date until when the data should be loaded
 * @param interval {string} the interval in which the data should be summarized, options are "min", "10min", "hr", "day"
 */
function updateSummaryChartWithValuesFromDB(id, from, to, interval) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // console.log(this.responseText);
            setValuesOfSummaryChart(id, JSON.parse(this.responseText));
        }
    };
    xhttp.open("POST", "PHP/getDataTimewise.php", true);
    let data = new FormData();
    data.append('sensorId', sensors[id].pk_SensorId);
    data.append('from', jsToUTCMySQLDate(from));
    data.append('to', jsToUTCMySQLDate(to));
    data.append('interval', interval);
    xhttp.send(data);
}

/**
 * sets the values of a chart
 * @param id {number} the id of the chart
 * @param dataset {Object[]} an array that has entries of {time:,min:,max:} objects
 */
function setValuesOfSummaryChart(id, dataset) {
    charts[id].data.labels = [];
    charts[id].data.datasets[0].data = [];
    if (charts[id].data.datasets.length > 1) {
        charts[id].data.datasets[1].data = [];
    }

    for (const entry of dataset) {
        charts[id].data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        charts[id].data.datasets[0].data.push(entry.max);
        if (charts[id].data.datasets.length > 1) {
            charts[id].data.datasets[1].data.push(entry.min);
        }
    }
    charts[id].update();
}

/**
 * updates the time interval that should be displayed.
 */
function updateSummaryChartsTrigger () {
    let index = intervalSelect.selectedIndex;
    let myDate = new Date();
    switch (index) {
        case 0:
            location.assign(".");
            break;
        case 1: // last hour
            myDate.setHours(myDate.getHours() -1);
            updateSummaryCharts("min", myDate);
            break;
        case 2: // last day
            myDate.setHours(myDate.getHours() -24);
            updateSummaryCharts("10min", myDate);
            break;
        case 3: // last week
            myDate.setHours(myDate.getHours() - (24 * 7));
            updateSummaryCharts("hr", myDate);
            break;
        case 4: // last month
            myDate.setMonth(myDate.getMonth() - 1);
            updateSummaryCharts("day", myDate);
            break;
        case 5:
            myDate.setMonth(myDate.getMonth() - 3);
            updateSummaryCharts("day", myDate);
            break;
        case 6:
            myDate.setMonth(myDate.getMonth() - 6);
            updateSummaryCharts("day", myDate);
            break;
        case 7:
            myDate.setFullYear(myDate.getFullYear() - 1);
            updateSummaryCharts("day", myDate);
            break;
        case 8:
            updateSummaryCharts("day");
            break;
        default:
            // console.log(index);
    }
}