//begin script when window loads
window.onLoad = setMap();

function setMap() {
    var width = 960,
        height = 460;
    
    var map = d3.select('body')
        .append('svg')
        .attr('class', 'map')
        .attr('width', width)
        .attr('height', height);

    var projection = d3.geoAlbers()
        .center([-79.0558, 35.9132])
        .rotate([-2, 0, 0])
        .parallels([43, 63])
        .scale(2500)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);
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

        var chapelHill = topojson.feature(city, city.objects.chapelhill),
            bikeCrashes = topojson.feature(crashes, crashes.objects.crashes).features;

        console.log(chapelHill);
        console.log(bikeCrashes);

        var cities = map.append('path')
            .datum(chapelHill)
            .attr('class', 'cities')
            .attr('d', path);

        var crashes = map.selectAll('crashes')
            .data(bikeCrashes)
            .enter()
            .append('path')
            .attr('class', function(d) {
                return 'crashes' + d.properties.ID;
            })
            .attr('d', path);
    };
  
};

 
