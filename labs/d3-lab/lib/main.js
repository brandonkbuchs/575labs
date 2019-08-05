//begin script when window loads
window.onLoad = setMap();

function setMap() {
    d3.queue()
        .defer(d3.csv, 'data/VAStockedTroutStreams.csv')
        .defer(d3.json, 'data/trout.topojson')
        .defer(d3.json, 'data/state.topojson')
        .await(callback)
        

    function callback(csvData, trout, state) {
        console.log('csv:', csvData);
        console.log('trout.topojson: ', trout);
        console.log('state.topojson: ', state);
    };

    
};

d3.catch(function(error){
    console.log('error: ', error);
});