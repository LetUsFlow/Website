let dashboard = {

    /**
     * The interval in seconds in which the data should be updated.
     * @type {number}
     */
    UPDATE_INTERVAL: 10,
    DISPLAYED_STATION_COUNT: 5,

    /**
     *
     * @type {SensorChart}
     */
    humidityChart: null,

    /**
     *
     * @type {SensorChart}
     */
    co2Chart: null,

    /**
     *
     * @type {number[]}
     */
    maxCo2Ids: null,

    /**
     *
     * @type {number[]}
     */
    minHumidityIds: null,

    /**
     * initializes live charts and sets interval
     */
    init: function () {
        // console.log("destroyed charts and loaded dashboard");
        charts = {
            /*temperature: new Chart(document.getElementById('chart-temperature'), {
                type: 'line',
                data: {},
                options: {
                    legend: {
                        labels: {
                            fontColor: 'black',
                            defaultFontColor: 'black'
                        }
                    },
                },
            }),*/
            humidity: new Chart(document.getElementById('chart-humidity'), {
                type: 'line',
                data: {},
                options: {
                    legend: {
                        labels: {
                            fontColor: 'black',
                            defaultFontColor: 'black'
                        }
                    },
                }
            }),
            co2: new Chart(document.getElementById('chart-co2'), {
                type: 'line',
                data: {},
                options: {
                    legend: {
                        labels: {
                            fontColor: 'black',
                            defaultFontColor: 'black'
                        }
                    }
                }
            })
        };

        this.maxCo2Ids = [];
        this.minHumidityIds = [];

        this.humidityChart = new SensorChart([{name: "humidity", chart: charts.humidity}]);
        this.co2Chart = new SensorChart([{name: "co2", chart: charts.co2}]);

        this.updateCharts();
    },

    /**
     *
     */
    destroy: function () {
        // console.log("dashboard.destroy");
        charts.humidity.destroy();
        this.humidityChart.clear();
        charts.co2.destroy();
        this.co2Chart.clear();
        this.maxCo2Ids = null;
        this.minHumidityIds = null;
    },

    /**
     * updates the countdown, is called by an interval every second
     */
    updateCountdown: function () {
        if (nextUpdateIn <= 1) {
            this.fetchAndDeliverValuesFromDB();
            nextUpdateIn = this.UPDATE_INTERVAL;
        } else {
            nextUpdateIn--;
        }
        document.getElementById("nextUpdateIn").innerHTML = "" + nextUpdateIn;

        // feeds db
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", "PHP/feeddb.php", true);
        xhttp.send();

    },

    updateCharts: function () {
        nextUpdateIn = 0;
        this.updateCountdown();
        clearInterval(intervalObj);
        intervalObj = setInterval(function () {dashboard.updateCountdown()}, 1000);
    },

    fetchAndDeliverValuesFromDB: function () {
        let stationsToLoad = [];
        stations.forEach(station => {
            stationsToLoad.push({
                id: station.id,
                since: station.lastFetch
            })
        });

        // console.log(stationsToLoad);

        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let dataPerStation = JSON.parse(this.responseText);
                // console.log("db response: ");
                // console.log(dataPerStation);
                for (let dataset of dataPerStation) {
                    stations[parseInt(dataset.id)].updateValues(dataset.data);
                    // console.log("id: " + dataset.id);
                    // console.log(stations[dataset.id].getChartValues());
                }
                dashboard.appendValuesFromStationToCharts();
            }
        };
        xhttp.open("POST", "PHP/getDataLive.php", true);
        xhttp.send(data);
    },

    /**
     * appends values to a chart
     */
    appendValuesFromStationToCharts: function () {
        this.updateAndDisplay();

        // console.log("appendValuesFromStationsToCharts: updateCo2Chart()");
        this.co2Chart.updateCharts();
        // console.log("appendValuesFromStationsToCharts: updateHumidityChart()");
        this.humidityChart.updateCharts();
    },

    /**
     *
     */
    updateAndDisplay: function () {
        /**
         *
         * @type {number[]}
         */
        let maxCo2IdsNew = this.maxCo2Ids.slice();
        /**
         *
         * @type {number[]}
         */
        let maxCo2IdsOld = this.maxCo2Ids.slice();
        /**
         *
         * @type {number[]}
         */
        let minHumidityIdsNew = this.minHumidityIds.slice();
        /**
         *
         * @type {number[]}
         */
        let minHumidityIdsOld = this.minHumidityIds.slice();

        stations.forEach(station => {
            //CO2
            let co2CompareFn = (a, b) => -stations[a].maxCo2 + stations[b].maxCo2;
            if (maxCo2IdsNew.includes(station.id)) {
                maxCo2IdsNew.sort(co2CompareFn);
            } else if (maxCo2IdsNew.length < this.DISPLAYED_STATION_COUNT) {
                maxCo2IdsNew.push(station.id);
                maxCo2IdsNew.sort(co2CompareFn);
            } else if (station.maxCo2 > stations[maxCo2IdsNew[maxCo2IdsNew.length - 1]].maxCo2) {
                maxCo2IdsNew.push(station.id);
                maxCo2IdsNew.sort(co2CompareFn);
                maxCo2IdsNew.pop();
            }

            //Humidity
            let humidityCompareFn = (a, b) => stations[a].minHumidity - stations[b].minHumidity;
            if (minHumidityIdsNew.includes(station.id)) {
                minHumidityIdsNew.sort(humidityCompareFn);
            } else if (minHumidityIdsNew.length < this.DISPLAYED_STATION_COUNT) {
                minHumidityIdsNew.push(station.id);
                minHumidityIdsNew.sort(humidityCompareFn);
            } else if (station.minHumidity < stations[minHumidityIdsNew[minHumidityIdsNew.length - 1]].minHumidity) {
                minHumidityIdsNew.push(station.id);
                minHumidityIdsNew.sort(humidityCompareFn);
                minHumidityIdsNew.pop();
            }
        });

        for (let i = 0; i < maxCo2IdsOld.length; i++){
            const id = maxCo2IdsOld[i];
            if (!maxCo2IdsNew.includes(id)) {
                maxCo2IdsOld.splice(i, 1);
                this.co2Chart.remove(id);
                i--;
            }
        }

        for (let i = 0; i < minHumidityIdsOld.length; i++){
            const id = minHumidityIdsOld[i];
            if (!minHumidityIdsNew.includes(id)) {
                minHumidityIdsOld.splice(i, 1);
                // console.log("dashboard.updateAndDisplay: remove station from humidity chart " + id)
                this.humidityChart.remove(id);
                i--;
            }
        }

        for (let i = 0; i < maxCo2IdsNew.length; i++){
            const id = maxCo2IdsNew[i];
            if (!maxCo2IdsOld.includes(id)) {
                maxCo2IdsOld.push(id);
                this.co2Chart.push(id, {co2: stations[id].datasetChart.maxCo2});
            }
        }

        for (let i = 0; i < minHumidityIdsNew.length; i++){
            const id = minHumidityIdsNew[i];
            if (!minHumidityIdsOld.includes(id)) {
                minHumidityIdsOld.push(id);
                // console.log("dashboard.updateAndDisplay: push station to humidity chart " + id)
                this.humidityChart.push(id, {humidity: stations[id].datasetChart.minHumidity});
            }
        }

        this.maxCo2Ids = maxCo2IdsNew;
        this.minHumidityIds = minHumidityIdsNew;
    },
}