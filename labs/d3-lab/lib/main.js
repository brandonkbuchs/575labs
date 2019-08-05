//begin script when window loads
window.onLoad = setMap();

function setMap() {

    var width = 960, height = 460;

    var map = d3.select('body')
        .append('svg')
        .attr('class', 'map')
        .attr('width', width)
        .attr('height', height);

    var projection = d3.geoConicEqualArea()
        .center([-79.0558, 35.9132])
        .rotate([0, 0, 0])
        .parallels([30, 40])
        .scale(2500)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    console.log(map);

    d3.queue()
        .defer(d3.csv, 'data/gaEcon.csv')
        .defer(d3.json, 'data/GeorgiaEconomics.topojson')
        .defer(d3.json, 'data/GeorgiaCities.topojson')
        .await(callback);

    function callback(error, csvData, econ, city) {
        console.log(error);
        console.log(csvData);
        console.log(econ);
        console.log(city);
    
        setGraticule(map, path);

        var economics = topojson.feature(econ, econ.objects.GaEcon).features;
        console.log(economics);

        var cities = topojson.feature(city, city.objects.GeorgiaCities);
        console.log(cities);

        var cities = map.append('path')
            .datum(cities)
            .attr('class', 'cities')
            .attr('d', path);

        economics = joinData(economics, csvData);

        var colorScale = makeColorScale(csvData);
        setEnumerationUnits(economics, map, path);
    }; 
};//end of function setMap

function makeColorScale(data){
    var colorClasses = [
        '#D4B9DA',
        '#C994C7',
        '#DF65B0',
        '#DD1C77',
        '#980043'
    ];

    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    var minmax = [
        d3.min(data, function(d){return parseFloat(d[expressed]);}),
        d3.max(data, function(d){return parseFloat(d[expressed]);})
    ];

    colorScale.domain(minmax);

    /*var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    colorScale.domain(domainArray);*/

    return colorScale;
}; //end of function makeColorScale

function setGraticule(map, path){
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

};//end of function setGraticule

function joinData(economics, csvData){
    var attributeArray = ['pop', 'workforce', 'unempRaw', 'unempPct' ,'blackUnempP', 'asianUnempP', 'whiteUnempP', 'hispanUnempP'];
    
    for (var i=0; i<csvData.length; i++){
        var csvEcon = csvData[i];
        var csvKey = csvEcon.OBJECTID;

        for (var a=0; a<GaEcon.length; a++){
            var geojsonProps = GaEcon[a].properties;
            var geojsonKey = geojsonProps.OBJECTID;

            if (geojsonKey == csvKey){
                attributeArray.forEach(function(attr){
                    var val = parseFloat(csvEcon[attr]);

                    geojsonProps[attr] = val;
                });
            };
        };
    };

    return economics;
}; //end of function joinData

function setEnumerationUnits(economics, map, path) {
    var economics = map.selectAll('.economics')
        .data(economoics)
        .enter()
        .append('path')
        .attr('class', function(d) {
            return 'economics' + d.properties.ID;
        })
        .attr('d', path)
        .style('fill', function(d){
            return choropleth(d.properties, colorScale);
        });
};

function choropleth(props, colorScale){
    var val = parseFloat(props[expressed]);
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);        
    } else {
        return "#CCC";
    };
};
 
