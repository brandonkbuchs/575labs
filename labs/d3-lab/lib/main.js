//begin script when window loads
window.onLoad = setMap();

function setMap() {
    d3.queue()
        .defer(d3.csv, 'data/VAStockedTroutStreams.csv')
        .defer(d3.json, 'data/trout.topojson')
        .defer(d3.json, 'data/state.topojson')
        .await(callback);

    function callback(csvData, trout, state) {
        console.log(csvData);
        console.log(trout);
        console.log(state);
    };

    .catch(function(error){
        console.log(error);
    });
};