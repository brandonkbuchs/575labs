(function(){
    //pseudo global variables
    var attrArray = ['pop','workforce','unemp','pctUnemp','pctUnempBlack','pctUnempAsian','pctUnempWhite','pctUnempHisp'];
    var expressed = attrArray[0];

    //var chartVariables
    var chartHeight = 460,
        chartWidth = window.innerWidth * 0.455,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")"

    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 3700]);
    //begin script when window loads
    window.onload = setMap();


    //set up choropleth map 
    function setMap() {

        var width = window.innerWidth * 0.5,
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
            createDropdown(csvData);
            setGraticule(map, path);

            //translate TopoJSON to geoJSON
            var stateBackground = topojson.feature(state, state.objects.ga),
                economics = topojson.feature(econ, econ.objects.GaEcon).features;

            var georgia = map.append('path')
                .datum(stateBackground)
                .attr('class', 'georgia')
                .attr('d', path);

            var georgiaStats = joinData(economics, csvData);                
            
            //create the color scale    
            var colorScale = makeColorScale(csvData);

            //add cities to map
            setEnumerationUnits(economics, map, path, colorScale);

            //add coordinated visualization to the map
            setChart(csvData, colorScale);
        };
    };

    //set the chart up
    function setChart(csvData, colorScale){
        var chart = d3.select('body')
            .append('svg')
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('class', 'chart');

        var chartBackground = chart.append('rect')
            .attr('class', 'chartBackground')
            .attr('width', chartInnerWidth)
            .attr('height', chartInnerHeight)
            .attr('transform', translate);

        var bars = chart.selectAll('.bars')
            .data(csvData)
            .enter()
            .append('rect')
            .sort(function(a,b){
                return b[expressed]-a[expressed]
            })
            .attr('class', function(d){
                return 'bars ' + d.oid;
            })
            .attr('width', chartInnerWidth / csvData.length - 1)
            .on('mouseover', highlight)
            .on('mouseout', dehighlight)
            .on('mousemove', moveLabel);

        //create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yScale);

        //place axis
        var axis = chart.append('g')
            .attr('class', 'axis')
            .attr('transform', translate)
            .call(yAxis);

        var chartTitle = chart.append('text')
            .attr('x', 20)
            .attr('y', 40)
            .attr('class', 'chartTitle')
            .text('Number of ' + expressed + ' in each city');

        //create frame for chart border
        var chartFrame = chart.append('rect')
            .attr('class', 'chartFrame')
            .attr('width', chartInnerWidth)
            .attr('height', chartInnerHeight)
            .attr('transform', translate);
        
        //set bar positions, heights, and colors
        updateChart(bars, csvData.length, colorScale);
    };

    //set graticule lines
    function setGraticule(map, path){

        var graticule = d3.geoGraticule()
            .step([2,2]); //place graticule lines every 2 degrees lat,lon
    
        var gratLines = map.selectAll('.gratLines') //select graticule elements
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append('path') //append each element to the svg as a path element
            .attr('class', 'gratLines') //assign class
            .attr('d', path); //project gratlines

        var gratBackground = map.append('path')
            .datum(graticule.outline())
            .attr('class', 'gratBackground')
            .attr('d', path);
    };

    //join csv data to geojson data
    function joinData(economics, csvData){
        //variables for data join
        

        //loop through csv to assign each set of csv attribute values to geojson for GeorgiaEconomics
        for (var i=0; i<csvData.length; i++) {
            var csvCity = csvData[i]; //current city
            var csvKey = csvCity.oid; //csv primary key

            //loop through geojson cities to find correct city
            for (var a=0; a<economics.length; a++) {
                var geojsonProps = economics[a].properties; //current city geojson props
                var geojsonKey = geojsonProps.oid; //geojson key

                //where primary keys match, transfer csv data to geojson properties object

                if (geojsonKey==csvKey) {
                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvCity[attr]); //get csv attribute value
                        geojsonProps[attr] = val;
                    });
                };
            };

        };
    };

    function setEnumerationUnits(economics, map, path, colorScale){
        //establish cities on map
        var regions = map.selectAll('.economics')
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
                    highlight(d.properties)
                })
                .on('mouseout', function(d){
                    dehighlight(d.properties);
                })
                .on('mousemove', moveLabel);

    };

    function makeColorScale(data){
        var colorClasses = [
            '#FDF0F7',
            '#CBC9E2',
            '#9E9AC8',
            '#756BB1',
            '#54278F'
        ];

        //create color scale generator
        var colorScale = d3.scaleQuantile()
            .range(colorClasses);

        //build two-value array of minimum and maximum expressed attribute values
        var minmax = [
            d3.min(data, function(d) { return parseFloat(d[expressed]); }),
            d3.max(data, function(d) { return parseFloat(d[expressed]); })
        ];

        //assign two-value array as scale domain
        colorScale.domain(minmax);

        return colorScale;
    };

    function choropleth(props, colorScale){
        //make sure attribute value is a number
        var val = parseFloat(props[expressed]);
        //if attribute value exists, assign a color
        if (typeof val == 'number' && !isNaN(val)){
            return colorScale(val);
        } else {
            return '#CCC';
        };
    };

    function createDropdown(csvData){
        //add a select element
        var dropdown = d3.select('body')
        .append('select')
        .attr('class', 'dropdown')
        .on('change', function(){
            changeAttribute(this.value, csvData)
        });

        var titleOption = dropdown.append('option')
            .attr('class', 'titleOption')
            .attr('disabled', 'true')
            .text('Select Attrtibute');

        var attrOptions = dropdown.selectAll('attrOptions')
            .data(attrArray)
            .enter()
            .append('option')
            .attr('value', function(d){return d})
            .text(function(d){return d });
           
    };

    function changeAttribute(attribute, csvData){
        //change the expressed attribute
        expressed = attribute;

        var colorScale = makeColorScale(csvData);

        //recolor enumeration units
        var regions = d3.selectAll('.regions')
            .transition()
            .duration(1000)
            .style('fill', function(d){
                return choropleth(d.properties, colorscale)
            });

        //re-sort resize and recolor bars
        var bars = d3.selectAll('.bars')
            .sort(function(a, b){
                return b[expressed] - a[expressed];
            })
            .transition() //add animation
            .delay(function(d,i){
                return i * 20;
            })
            .duration(500);
        
        //set bar positions, heights, and colors
        updateChart(bars, csvData.length, colorScale);
            
    };

    //function to position, size, and color bars in chart
    function updateChart(bars, n, colorScale){
        //position bars
        bars.attr('x', function(d,i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr('height', function(d){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr('y', function(d){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style('fill', function(d){
            return choropleth(d, colorScale);
        });

        var chartTitle = d3.select('.chartTitle')
            .text('Number of ' + expressed + ' in each City');
    };

    function highlight(props){
        setLabel(props);

        //change stroke
        var selected = d3.selectAll('.bars' + props.oid)
            .style('stroke', 'green')
            .style('stroke-width', '2');

        
    };

    function dehighlight(props){
        var selected = d3.selectAll('.bars' + props.oid)
            .style('stroke', function(){
                return getStyle(this, 'stroke')
            })
            .style('stroke-width', function(){
                return getStyle(this, 'stroke-width')
            });
        
        //function getStyle to clear changes to strokes/stroke-widths
        function getStyle(element, styleName){
            var styleText = d3.select(element)
                .select('desc')
                .text();

            var styleObject = JSON.parse(styleText);
            d3.select('infoLabel')
                .remove();

            return styleObject[styleName];
        };
    };
    
    //function setLabel builds the label to display when highlighted
    function setLabel(props) {
        //label content
        var labelAttribute = '<h1>' + props[expressed] + '</h1><b>' + expressed + '</b>';

        //create info label div
        var infoLabel = d3.select('body')
            .append('div')
            .attr('class', 'infoLabel')
            .attr('id', props.oid + '_label')
            .html(labelAttribute);

        var cityName = infoLabel.append('div')
            .attr('class', 'labelname')
            .html(props.geoid);
    };
    
    function moveLabel(){
        //get width of label
        var labelWidth = d3.select('.infoLabel')
            .node()
            .getBoundingClientRect()
            .width;

        //use coordinates of mousemove event to set label coordinates
        var x1 = d3.event.clientX + 10,
            y1 = d3.event.clientY - 75,
            x2 = d3.event.clientX - labelWidth - 10,
            y2 = d3.event.clientY + 25;

        //horizontal label coordinates, testing for overflow
        var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2: x1;
        //vertical label coordinate, testing for overflow
        var y = d3.event.clientY < 75 ? y2: y1;

        d3.select('infoLabel')
            .style('left', x, + 'px')
            .style('top', y, + 'px');

    };

})();