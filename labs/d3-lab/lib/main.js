//begin script when window loads
window.onLoad = setMap();

function setMap() {
    d3.queue()
        .defer(d3.csv, 'data/crashes.csv')
        .defer(d3.json, 'data/crashes.topojson')
        .defer(d3.json, 'data/chapelhill.topojson')
        .await(callback);

    function callback(error, csvData, crashes, city) {
        console.log(error);
        console.log(csvData);
        console.log(crashes);
        console.log(city);
    };
  
};

 
