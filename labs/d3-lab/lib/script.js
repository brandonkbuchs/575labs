//begin script when window loads

window.onload = setMap();


//set up choropleth map 
function setMap() {

    var width = 960,
        height = 460;
    
    var map = d3.select('body') //create new SVG for map
        .append('svg')
        .attr('class', 'map')
        .attr('width', width)
        .attr('height', height)
    
    var projection = d3.geoAlbers() //create projection
        .center([0, 33])
        .rotate([83.45, 0])
        .parallels([30, 36])
        .scale(4200)
        .translate([width / 2, height / 2]);
    
    var path = d3.geoPath()
        .projection(projection);

    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, 'data/gaEcon.csv') //load attributes from csv
        .defer(d3.json, 'data/ga.topojson') //load background spatial data
        .defer(d3.json, 'data/GeorgiaEconomics.topojson') //load choropleth spatial data
        .await(callback);
    
    function callback(error, csvData, state, econ){

        var graticule = d3.geoGraticule()
            .step([2,2]); //place graticule lines every 2 degrees lat,lon

        
        var gratLines = map.selectAll('.gratLines') //select graticule elements
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append('path') //append each element to the svg as a path element
            .attr('class', 'gratLines') //assign class
            .attr('d', path); //project gratlines
        var stateBackground = topojson.feature(state, state.objects.ga),
            economics = topojson.feature(econ, econ.objects.GaEcon).features;

        var georgia = map.append('path')
            .datum(stateBackground)
            .attr('class', 'georgia')
            .attr('d', path);

        var regions = map.selectAll('.economics')
            .data(economics)
            .enter()
            .append('path')
            .attr('class', function(d) {
                return 'economics ' + d.properties.oid;
            })
            .attr('d', path);
    };
};