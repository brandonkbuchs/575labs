//begin script when window loads
(function(){
    var attrArray = ['pop','workforce','unemp','pctUnemp','pctUnempBlack','pctUnempAsian','pctUnempWhite','pctUnempHisp'];
    var expressed = attrArray[0];

    var chartw = window.innerWidth * 0.425, 
        charth = 473,
        leftp = 25,
        rightp = 2,
        topBottomp = 5,
        chartInnerw = chartw - leftp - rightp,
        chartInnerh = charth - topBottomp * 2,
        translate = 'translate(' + leftp + ',' + topBottomp +')';

    var yScale = d3.scaleLinear()
        .range([463,0])
        .domain([0,110]);    

window.onLoad = setMap();

function setMap() {

    var width = window.innerWidth * 0.5, height = 460;

    var map = d3.select('body')
        .append('svg')
        .attr('class', 'map')
        .attr('width', width)
        .attr('height', height);


    var projection = d3.geoAlbers()
        .center([0, 33])
        .rotate([83.45, 0])
        .parallels([30, 36])
        .scale(4200)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    d3.queue()
        .defer(d3.csv, 'data/gaEcon.csv') //load CSV data
        .defer(d3.json, 'data/GeorgiaEconomics.topojson') //load the city stats json
        .defer(d3.json, 'data/ga.topojson') //load the state of GA json
        .await(callback);

    function callback(error, csvData, econ, state) {
    
        var economics = topojson.feature(econ, econ.objects.GaEcon).features;
        var georgia = topojson.feature(state, state.objects.ga);

        var gaState = map.append('path')
            .datum(georgia)
            .attr('class', 'gaState')
            .attr('d', path);

        economics = joinData(economics, csvData);

        var colorScale = makeColorScale(csvData);
        setEnumerationUnits(economics, map, path, colorScale);

        setChart(csvData, colorScale);
        createDropdown(csvData);
        setGraticule(map, path);

    }; 
};//end of function setMap

function setChart(csvData, colorScale){
     
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

    var bars = chart.selectAll('.bars')
        .data(csvData)
        .enter()
        .append('rect')
        .sort(function(a, b){
            return b[expressed]-a[expressed];
        })
        .attr('class', function(d){
            return "bars " + d.oid;
        })
        .attr('width', chartInnerw / csvData.length - 1)
        .attr('x', function(d,i){
            return i * (chartInnerw /csvData.length) + leftp;
        })
        .attr('height', function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr('y', function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomp;
        })
        .style('fill', function(d){
            return choropleth(d, colorScale);
        })
        .on('mouseover', highlight)
        .on('mouseout', dehighlight)
        .on('mousemove', moveLabel);

    var desc = bars.append('desc')
        .text('{"stroke": "#000", "stroke-width": "0px"}');
    
    var chartTitle = chart.append('text')
        .attr('x',30)
        .attr('y',40)
        .attr('class','chartTitle')
        .text('Var ' + expressed + ' in each city');

    var yAxis = d3.axisLeft()
        .scale(yScale);
    
    var axis = chart.append('g')
        .attr('class', 'axis')
        .attr('transform', translate)
        .call(yAxis);
    
    var chartFrame = chart.append('rect')
        .attr('class', 'chartFrame')
        .attr('width', chartInnerw)
        .attr('height', chartInnerh)
        .attr('transform', translate);
    
    updateChart(bars, csvData.length, colorScale);
}; //end of setChart

function makeColorScale(data){
    var colorClasses = [
        '#FDF0F7',
        '#CBC9E2',
        '#9E9AC8',
        '#756BB1',
        '#54278F'
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
        .step([2, 2]);
    
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
    
    for (var i=0; i<csvData.length; i++){
        var csvEcon = csvData[i];
        var csvKey = csvEcon.oid;

        for (var a=0; a<economics.length; a++){
            var geojsonProps = economics[a].properties;
            var geojsonKey = geojsonProps.oid;

            if (geojsonKey == csvKey){
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvEcon[attr]);

                    geojsonProps[attr] = val;
                });
            };
        };
    };

    return economics;
}; //end of function joinData

function setEnumerationUnits(economics, map, path, colorScale) {
    var mapRegions = map.selectAll('.economics')
        .data(economics)
        .enter()
        .append('path')
        .attr('class', function(d) {
            return 'economics ' + d.properties.oid;
        })
        .attr('d', path)
        .style('fill', function(d){
            return choropleth(d.properties, colorScale);
        })
        .on('mouseover', function(d){
            highlight(d.properties);
        })
        .on('mouseout', function(d){
            dehighlight(d.properties);
        })
        .on('mousemove', moveLabel);

    var desc = mapRegions.append('desc')
        .text('{"stroke":"#000", "stroke-width":"0.5px"}');
}; //end of function setEnumerationUnits

function choropleth(props, colorScale){
    var val = parseFloat(props[expressed]);
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);        
    } else {
        return "#CCC";
    };
}; //end of function choropleth

function createDropdown(csvData) {
    var dropdown = d3.select('body')
        .append('select')
        .attr('class','dropdown')
        .on('change', function(){
            changeAttribute(this.value, csvData);
        });

    var titleOption = dropdown.append('option')
        .attr('class', 'titleOption')
        .attr('diabled', 'true')
        .text('Select Attribute');

    var attrOptions = dropdown.selectAll('attrOptions')
        .data(attrArray)
        .enter()
        .append('option')
        .attr('value', function(d){return d;})
        .text(function(d){return d; });
}; //end of function createDropdown

function changeAttribute(attribute, csvData) {
    expressed = attribute;
    var colorScale = makeColorScale(csvData);

    var economics = d3.selectAll('economics')
        .transition()
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });
            
    var bars = d3.selectAll('.bars')
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition()
        .delay(function(d,i){
            return i * 20
        })
        .duration(500)
        .attr('x', function(d, i){
            return i * (chartInnerw /csvData.length) + leftp;
        })
        .attr('height', function(d,i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr('y',function(d,i){
            return yScale(parseFloat(d[expressed])) + topBottomp;
        })
        .style('fill', function(d){
            return choropleth(d, colorScale);
        });

    updateChart(bars, csvData.length, colorScale);
}; //end of changeAttribute

function updateChart(bars, n, colorScale){
    bars.attr('x', function(d,i){
        return i * (chartInnerw / n) + leftp;
    })
    .attr('height', function(d,i){
        return 463 - yScale(parseFloat(d[expressed]));
    })
    .attr('y', function(d,i){
        return yScale(parseFloat(d[expressed])) + topBottomp;
    })
    .style('fill', function(d){
        return choropleth(d, colorScale);
    });

    var chartTitle = d3.select('.chartTitle')
        .text('Var ' + expressed + ' in each city');
}; //end of updateChart

function highlight(props){
    var selected = d3.selectAll('.' + props.oid)
        .style('stroke', 'blue')
        .style('stroke-width', '2');
    
    setLabel(props);
}; //end of highlight

function dehighlight(props){
    var selected = d3.selectAll('.' + props.oid)
        .style('stroke', function(){
            return getStyle(this, 'stroke');
        })
        .style('stroke-width', function(){
            return getStyle(this, 'stroke-width');
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select('desc')
            .text();

        var styleObject = JSON.parse(styleText);
    
    d3.select('.infoLabel')
        .remove();

        return styleObject[styleName];
    };
}; //end of dehighlight

function setLabel(props){
    var labelAttribute = '<h1>' + props[expressed] + '</h1><b>' + expressed + '</b>';

    var infoLabel = d3.select('body')
        .append('div')
        .attr('class', 'infoLabel')
        .attr('id', props.oid + '_label')
        .html(labelAttribute);

    var econName = infoLabel.append('div')
        .attr('class', 'labelname')
        .html(props.gid);
}; //end of setLabel

function moveLabel(){

    var labelWidth = d3.select('.infoLabel')
        .node()
        .getBoundingClientRect()
        .width;

    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;

    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    var y = d3.event.clientY < 75 ? y2 : y1;        


    d3.select('.infoLabel')
        .style('left', x + 'px')
        .style('top', y + 'px');
}; //end of moveLabel

}());


 
