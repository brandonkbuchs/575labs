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
        .center([35.9132, -79.0558])
        .rotate([-2, 0, 0])
        .parallels([30, 40])
        .scale(2500)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    d3.queue()
        .defer(d3.csv, 'data/crashes.csv')
        .defer(d3.json, 'data/crashes.topojson')
        .defer(d3.json, 'data/chapelhill.topojson')
        .await(callback);

    function callback(error, csvData, crash, city) {
        var graticule = d3.geoGraticule()
            .step([5, 5]);
        
        var gratBackground = map.append('path')
            .datum(graticule.outline())
            .attr('class', 'gratBackground')
            .attr('d', path);

        var gratLines = map.selectAll('.gratlines')
            .data(graticule.lines())
            .enter()
            .append('path')
            .attr('class', 'gratLines')
            .attr('d', path);

        var chapelHill = topojson.feature(city, city.objects.neighborhoods).features;

        var bikeCrashes = topojson.feature(crash, crash.objects.crashes).features;

        console.log(chapelHill);
        console.log(bikeCrashes);
        var cities = map.append('path')
            .datum(chapelHill)
            .attr('class', 'cities')
            .attr('d', path);

        var crashes = map.selectAll('.crashes')
            .data(bikeCrashes)
            .enter()
            .append('path')
            .attr('class', function(d) {
                return 'crashes' + d.properties.ID;
            })
            .attr('d', path);
    };
  
};

 
