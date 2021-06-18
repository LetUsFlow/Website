class HourInterval extends Interval {
    constructor() {
        super("hour", "Last hour", 60_000,
            time => {
                time.setMinutes(time.getMinutes() - 60);
                return time;
            },
            () => {
                let actTime = new Date();
                actTime.setMilliseconds(0);
                actTime.setSeconds(0);
                return actTime;
            },
            time => {
                return ('00' + time.getHours()).slice(-2) + ':' +
                    ('00' + time.getMinutes()).slice(-2);
            });
    }

    /**
     * prepares a JSON to be sent to the server to fetch only the data needed
     * @return {{data: FormData, method: string, callback: callback, refresh: boolean, url: string}}
     */
    fetch() {
        // prepares data to fetch
        /**
         * @type {{id: number}[]}
         */
        let stationsToLoad = [];
        selectedStations.forEach((station) => {
            if (station.loadedInterval !== this.name) {
                stationsToLoad.push({
                    id: station.id,
                });
            }
            // station.loadedInterval = this.name;
        });
        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));
        data.append('interval', this.name);

        let thisInterval = this;
        // function to work with return values
        let callback = function (data, sensorChart) {
            thisInterval.updateChartValues(data, sensorChart);
        }

        return {data: data, method: "POST", url: "PHP/getDataTimewise.php", callback: callback, refresh: false};
    }

    /**
     * updates the charts, its labels and the values in it by updating the datasets in {@link Station}
     * @param data {{id: number, data: {time: string, minCo2: string, maxCo2: string, minHumidity: string, maxHumidity: string, minTemperature: string, maxTemperature: string}[]}[]} the data to be appended
     * @param sensorChart {SensorChart}
     */
    updateChartValues(data, sensorChart) {
        let actTime = this.getActTime();
        this.updateLabels(sensorChart, actTime);

        // append data
        for (let dataOfStation of data) {
            let station = klimostat.stations[dataOfStation.id];
            this.updateStation(station, actTime);

            for (const entry of dataOfStation.data) {
                let entryTime = date.parseMySQL(entry.time);
                entry.minCo2 = parseFloat(entry.minCo2);
                entry.maxCo2 = parseFloat(entry.maxCo2);
                entry.minHumidity = parseFloat(entry.minHumidity);
                entry.maxHumidity = parseFloat(entry.maxHumidity);
                entry.minTemperature = parseFloat(entry.minTemperature);
                entry.maxTemperature = parseFloat(entry.maxTemperature);
                entryTime.setSeconds(0);
                // let entryTimeString = date.toIntervalLocalReadableString(entryTime, "live");
                let index = sensorChart.labels.length - Math.floor((sensorChart.lastLabelUpdate.getTime() - entryTime.getTime()) / this.intervalPeriod) - 1;
                // console.log(date.toIntervalLocalReadableString(entryTime, "live") + " index " + index + ", " + station.datasets.minHumidity.length);

                // sets last the time when the station last sent data, to show offline stations
                if (station.liveData.timestampOfNewestData === null || entryTime > station.liveData.timestampOfNewestData) {
                    station.liveData.timestampOfNewestData = entryTime;
                    station.navNode.updateNewestData();
                }

                if (typeof station.datasets.dummy[index] === "number") {
                    // console.log("outer " + station.id)
                    if (isNaN(station.datasets.dummy[index])) {
                        // console.log("first " + station.id)
                        station.datasets.dummy[index] = 0;
                        station.datasets.minCo2[index] = entry.minCo2;
                        station.datasets.maxCo2[index] = entry.maxCo2;
                        station.datasets.minHumidity[index] = entry.minHumidity;
                        station.datasets.maxHumidity[index] = entry.maxHumidity;
                        station.datasets.minTemperature[index] = entry.minTemperature;
                        station.datasets.maxTemperature[index] = entry.maxTemperature;
                    } else {
                        // console.log(entry)
                        // console.log(station.datasets.minHumidity[index]);
                        // console.log("second " + station.id)
                        station.datasets.minCo2[index] = Math.min(station.datasets.minCo2[index], entry.minCo2);
                        station.datasets.maxCo2[index] = Math.max(station.datasets.maxCo2[index], entry.maxCo2);
                        station.datasets.minHumidity[index] = Math.min(station.datasets.minHumidity[index], entry.minHumidity);
                        station.datasets.maxHumidity[index] = Math.max(station.datasets.maxHumidity[index], entry.maxHumidity);
                        station.datasets.minTemperature[index] = Math.min(station.datasets.minTemperature[index], entry.minTemperature);
                        station.datasets.maxTemperature[index] = Math.max(station.datasets.maxTemperature[index], entry.maxTemperature);
                    }
                }
            }
        }
    }
}