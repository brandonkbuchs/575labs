//begin script when window loads
window.onLoad = setMap();

function setMap() {

    var width = window.innerWidth * 0.5, height = 460;

    var map = d3.select('body')
        .append('svg')
        .attr('class', 'map')
        .attr('width', width)
        .attr('height', height);

    var projection = d3.geoConicEqualArea()
        .center([-79.0558, 35.9132])
        .rotate([0, 0, 0])
        .parallels([30, 40])
        .scale(3500)
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
        setEnumerationUnits(economics, map, path, colorScale);

        setChart(csvData, colorScale);
    }; 
};//end of function setMap

function setChart(csvData, colorScale, expressed){
    var chartw = window.innerWidth * 0.425, 
        charth = 460,
        leftp = 25,
        rightp = 2,
        topBottomp = 5,
        chartInnerw = chartw - leftp - rightp,
        chartInnerh = charth - topBottomp * 2,
        translate = 'translate(' + leftp + ',' + topBottomp +')';
    
    var chart = d3.select('body')
        .append('svg')
        .attr('width', chartw)
        .attr('height', charth)
        .attr('class', 'chart');

    var chartBg = chart.append('rect')
        .attr('class','chartBg')
        .attr('width', chartInnerw)
        .attr('height', chartInnerh)
        .attr('transform', translate);

    var yScale = d3.scaleLinear()
        .range([463,0])
        .domain([0,100]);


    var bars = chart.selectAll('.bars')
        .data(csvData)
        .enter()
        .append('rect')
        .sort(function(a, b){
            return a[expressed]-b[expressed];
        })
        .attr('class', function(d){
            return "bars" + d.OBJECTID;
        })
        .attr('width', chartw / csvData.length - 1)
        .attr('x', function(d, i){
            return i * (chartw / csvData.length);            
        })
        .attr('height', function(d){
            return yScale(parseFloat(d[expressed]));
        })
        .attr('y',function(d){
            return charth - yScale(parseFloat(d[expressed]));
        })
        .style('fill', function(d){
            return choropleth(d, colorScale);
        });
    
    var numbers = chart.selectAll('.numbers')
        .data(csvData)
        .enter()
        .append('text')
        .sort(function(a,b){
            return a[expressed]-b[expressed];
        })
        .attr('class',function(d){
            return "numbers" + d.OBJECTID;
        })
        .attr('text-anchor','middle')
        .attr('x', function(d,i){
            var fraction = chartw / csvData.length;
            return i * fraction + (fraction - 1) / 2;
        })
        .attr('y', function(d){
            return charth - ySacle(parseFloat(d[expressed])) + 15;
        })
        .text(function(d){
            return d[expressed];
        });

    var chartTitle = chart.append('text')
        .attr('x',20)
        .attr('y',40)
        .attr('class','chartTitle')
        .text('Number of Variable' + expressed + 'in each region');

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .orient('left');
    
    var axis = chart.append('g')
        .attr('class', 'axis')
        .attr('transform', translate)
        .call(yAxis);
    
    var chartFrame = chart.append('rect')
        .attr('class', 'chartFrame')
        .attr('width', chartInnerw)
        .attr('height', chartInnerh)
        .attr('transform', translate)
};

function makeColorScale(data, expressed){
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

        for (var a=0; a<economics.length; a++){
            var geojsonProps = economics[a].properties;
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

function setEnumerationUnits(economics, map, path, colorScale) {
    var economics = map.selectAll('.economics')
        .data(economics)
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

function choropleth(props, colorScale, expressed){
    var val = parseFloat(props[expressed]);
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);        
    } else {
        return "#CCC";
    };
};
 
