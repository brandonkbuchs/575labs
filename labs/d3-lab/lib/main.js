//begin script when window loads
window.onLoad = setMap();

function setMap() {
    var jsonFiles = ['data/crashes.topojson', 'data/chapelhill.topojson'];

    Promise.all(jsonFiles.map(url => d3.json(url))).then(function(values){
        console.log(values);
    });

    var csvData = d3.csv('data/crashes.csv');
    console.log('csvData:', csvData);
};

 
