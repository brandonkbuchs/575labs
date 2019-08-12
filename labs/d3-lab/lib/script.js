//begin script when window loads

window.onload = setMap();


//set up choropleth map 
function setMap() {
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, '/data/gaEcon.csv') //load attributes from csv
        .defer(d3.json, '/data/ga.topojson') //load background spatial data
        .defer(d3.json, '/data/GeorgiaEconomics.json') //load choropleth spatial data
        .await(callback);
    
    function callback(error, csvData, state, econ){
        console.log(error);
        console.log(csvData);
        console.log(state);
        console.log(econ);
    };
};