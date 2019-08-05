//begin script when window loads
window.onLoad = setMap();

function setMap() {
    var crashesJson = d3.json('data/crashes.topojson');
    console.log('crashesJson:', crashesJson);

    var cityJson = d3.json('data/chapelhill.topojson');
    console.log('cityJson:', cityJson);

    var csvData = d3.csv('data/crashes.csv');
    console.log('csvData:', csvData);

    var city = topojson.feature(cityJson.objects.cityJson), 
        crashes = topojson.feature(crashesJson.objects.crashesJson).features;

    console.log(city);
    console.log(crashes);
};

 
