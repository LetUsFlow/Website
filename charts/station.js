let colors = [
    "#ff0000",
    "#ffb000",
    "#ffff00",
    "#b0ff00",
    "#00ff00",
    "#00ffb0",
    "#00ffff",
    "#00b0ff",
    "#0000ff",
    "#b000ff",
    "#ff00ff",
    "#ff00b0"
]

class Station {
    /**
     *
     * @type {?Date}
     */
    lastFetch = null;

    /**
     * @type {?Date}
     */
    lastDatasetTime = null;

    // /**
    //  *
    //  * @type {{live: Dataset, dashboard: Dataset, hist: Dataset}}
    //  */
    // datasetChart = {
    //     live: new Dataset(),
    //     dashboard: new Dataset(),
    //     hist: new Dataset()
    // };

    /**
     *
     * @type {?HTMLElement}
     */
    navNode = null;

    // /**
    //  *
    //  * @type {number}
    //  */
    // maxCo2 = 0;
    //
    // /**
    //  *
    //  * @type {number}
    //  */
    // minHumidity = 100;

    /**
     *
     * @type {string}
     */
    color = colors[/*(stations.length * 2 + 1) % 11*/stations.length % 12];

    /**
     *
     * @param dbFetch {object}
     */
    constructor(dbFetch) {
        this.id = parseInt(dbFetch.pk_station_id);
        this.name = dbFetch.name;
        this.alertMessageHumidity = dbFetch.alert_message_humidity;
        this.alertMessageCO2 = dbFetch.alert_message_co2;
        this.location = dbFetch.location;

        document.getElementById("stations-box").innerHTML +=
            "<div class = \"tooltip-base\">" +
            "   <a href = \"javascript:selectedStations.toggle(" + this.id + ")\" class=\"list-group-item station-node\" id = \"station-" + this.id + "\">" +
            "       " + this.name + "" +
            "   </a>" +
            "   <div class = \"card\">" +
            "       <div class = \"card-body\">" +
            "           Location: " + this.location + "<br>" +
            "           Last update: <span> not yet </span>" +
            "       </div>" +
            "   </div>" +
            "</div>";
    }

    /**
     * updates the charts, the "last updated" message and variables
     */
    updateValues(data, interval="live") {
        if (interval === "live" || interval === "dashboard") {
            this.liveData.pushData(data);
        } else {
            console.log("unknown interval");
        }
    }

    /**
     *
     * @return {HTMLElement|null}
     */
    getNavNode() {
        if (this.navNode === null) {
            this.navNode = document.getElementById("station-" + this.id);
        }
        return this.navNode;
    }

    /**
     *
     * @return {boolean}
     */
    isOffline() {
        if (this.liveData.timestampOfNewestData !== null) {
            let lastFetch = new Date(this.liveData.timestampOfNewestData);
            return lastFetch.setMinutes(lastFetch.getMinutes() + 5) < new Date();
        }
        return true;
    }


    liveData = {
        station: this,

        datasets: {
            minTemperature: [],
            maxTemperature: [],
            minCo2: [],
            maxCo2: [],
            minHumidity: [],
            maxHumidity: []
        },

        /**
         *
         * @type {number}
         */
        maxCo2: 0,

        /**
         *
         * @type {number}
         */
        minHumidity: 100,

        /**
         * @type {Date}
         */
        timestampOfNewestData: null,

        /**
         * @type {Date}
         */
        timestampOfNewestDatasetEntry: null,

        /**
         * @type {Date}
         */
        timestampOfLastFetch: null,

        pushData(data) {
            let dataPrepared = {};

            for (const entry of data) {
                if (entry.co2 >= grenzwertCO2) {
                    sendAlert(this.alertMessageCO2);
                }
                if (entry.humidity < grenzwertHumidity) {
                    sendAlert(this.alertMessageHumidity);
                }
                let entryTime = mySQLToUTCJSDate(entry.time);
                let entryTimeString = jsTimeTo10MinLocalReadableString(entryTime);

                // sets last the time when the station last sent data, to show offline stations
                if (this.timestampOfNewestData === null || entryTime > this.timestampOfNewestData) {
                    this.timestampOfNewestData = entryTime;
                    this.station.getNavNode().parentElement.getElementsByTagName("span")[0].innerHTML = jsToLocalReadableString(entryTime);
                }

                if (dataPrepared[entryTimeString] === undefined) {
                    dataPrepared[entryTimeString] = {
                        minCo2: entry.co2,
                        maxCo2: entry.co2,
                        minHumidity: entry.humidity,
                        maxHumidity: entry.humidity,
                        minTemperature: entry.temperature,
                        maxTemperature: entry.temperature
                    }
                } else {
                    dataPrepared[entryTimeString] = {
                        minCo2: Math.min(entry.co2, dataPrepared[entryTimeString].minCo2),
                        maxCo2: Math.max(entry.co2, dataPrepared[entryTimeString].maxCo2),
                        minHumidity: Math.min(entry.humidity, dataPrepared[entryTimeString].minHumidity),
                        maxHumidity: Math.max(entry.humidity, dataPrepared[entryTimeString].maxHumidity),
                        minTemperature: Math.min(entry.temperature, dataPrepared[entryTimeString].minTemperature),
                        maxTemperature: Math.max(entry.temperature, dataPrepared[entryTimeString].maxTemperature)
                    }

                }

                this.minHumidity = Math.min(entry.humidity, this.minHumidity);
                this.maxCo2 = Math.max(entry.maxCo2, this.maxCo2);
            }

            /**
             *
             * @type {Date}
             */
            const actTime = new Date();
            actTime.setMilliseconds(0);

            /**
             *
             * @type {Date}
             */
            let time = new Date();
            time.setMinutes(actTime.getMinutes() - 5);

            let push = function (where, what) {
                where.push(what);
                where.shift();
            }

            if (this.timestampOfNewestDatasetEntry === null) {
                push = function (where, what) {
                    where.push(what);
                }
            } else {
                time = this.timestampOfNewestDatasetEntry;
            }

            // console.log("stations - lastChartUpdate: " + this.lastChartUpdate);
            // console.log(this.dataPrepared);

            for (; time < actTime; time.setSeconds(time.getSeconds() + 10)) {
                let timeString = jsTimeTo10MinLocalReadableString(time);

                let values = dataPrepared[timeString];
                if (typeof values !== "object") {
                    values = {
                        minCo2: NaN,
                        maxCo2: NaN,
                        minHumidity: NaN,
                        maxHumidity: NaN,
                        minTemperature: NaN,
                        maxTemperature: NaN
                    }
                }
                push(this.datasets.minTemperature, values.minTemperature);
                push(this.datasets.maxTemperature, values.maxTemperature);
                push(this.datasets.minCo2, values.minCo2);
                push(this.datasets.maxCo2, values.maxCo2);
                push(this.datasets.minHumidity, values.minHumidity);
                push(this.datasets.maxHumidity, values.maxHumidity);
            }

            this.timestampOfNewestDatasetEntry = actTime;
        }
    }
}