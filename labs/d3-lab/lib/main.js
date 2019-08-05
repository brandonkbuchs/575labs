//begin script when window loads
window.onLoad = setMap();

function setMap() {
    d3.queue()
        .defer(d3.csv, 'data/VAStockedTroutStreams.csv')
        .defer(d3.json, 'data/VAStockedTroutStreams.json')
        .defer(d3.json, 'data/VAState.json')
        .await(callback);

    function callback(error, csvData, streams, state) {
        console.log(error);
        console.log(csvData);
        console.log(streams);
        console.log(state);
    };
};