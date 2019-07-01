/* Brandon Buchs
GEOG 575 - Interactive Cartography and Geovisuzalization
Lab1 - Leaflet Lab
main.js
27 May 2019*/

//Determine symbol radius

//Proporitional symbol radius
function calcPropRadius(attValue) {
    var scaleFactor = 0.01;
    var area = attValue * scaleFactor;
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//Creating panel content
function panelContent(properties, attribute, layer, radius){

    var infoContent = '<p><b>Park:</b> ' + properties.Name + '</p>';
    var year = attribute;    
    
    //Event Listeners
    layer.on({
        click: function() {
            var infoText = infoContent  + '<p><b> Visitors in ' + year + ':</b> ' + properties[attribute] + '</p>';
            $('#panel').html(infoText);           
        }
    });
};

//Create markers
function createMarkers(feature, latlng, attributes, scale) {
    var attribute = attributes[0];
    //Create the Marker Options
    var markerOptions = {
    fillColor: '#6D3332',
    color: '#281313',
    opacity: 1,
    fillOpacity: 0.7,
    weight: 1,
    };

    var attValue = Number(feature.properties[attribute]);

    markerOptions.radius = calcPropRadius(attValue, scale);

    var layer = L.circleMarker(latlng, markerOptions);

    panelContent(feature.properties, attribute, layer, markerOptions.radius);

    return layer;
};

//Creating proportional symbols
function createPropSymbols(data, map, attributes) {
    //Create title text
    var attribute = attributes[0];

    //Plot marker options on map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return createMarkers(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Instantiate leaflet map
function createMap() {
    var map = L.map('map', {
    maxBounds: ([[70.35,-168.56],[18.1,-74.1]]),
    center: [40, -110],
    zoom: 3
    });

    

    //Add the base tileLayer to the map.
    var basemap = L.tileLayer('https://api.mapbox.com/styles/v1/{username}/{style}/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}', {
        attribution: 'Map data provided through mapbox.com',
        username: 'brandonkbuchs',
        style: 'cjw7397uz0kme1cl5ezmdp08y',
        accessToken: 'pk.eyJ1IjoiYnJhbmRvbmtidWNocyIsImEiOiJjamNiOWN5Z2EwMDF2MnF1ajh3NHNwZmN3In0.ZpBtYtaL-UhFvXEHn3vUWA',
        maxZoom: 22,
        minZoom: 2
    }).addTo(map);

    //call getData function
    getData(map);
};

//Create sequence controls
function createSequenceControls(map, attributes) {
    var titleText = '<h3 class="title">Recorded National Park Visitors in ' + attributes[0] + '</h3>';
    $('#map-title').html(titleText);
    $('#symbol-info').html('<p class="desc">Current Symbol Scale Factor: <b>1</b></p>');
    $('#range-slider').append('<p class="desc">Visited Year (2000-2018)</p>');
    $('#range-slider').append('<button class="skip" id="reverse"><img src="img/reverse.png"></button>');
    $('#range-slider').append('<input class="range-slider" type="range">');   
    $('#range-slider').append('<button class="skip" id="forward"><img src="img/forward.png"></button>');
    //Range slider attributes
    $('.range-slider').attr({
        max: 18,
        min: 0,
        value: 1,
        step: 1
    });
    //Symbol size slider
    $('#symbol-slider').append('<p class="desc">Symbol Size Scale (1-5)</p>');
    $('#symbol-slider').append('<button class="size" id="reverse"><img src="img/reverse.png"></button>');
    $('#symbol-slider').append('<input class="symbol-slider" type="range">');
    $('#symbol-slider').append('<button class="size" id="forward"><img src="img/forward.png"></button>');

    //Symbol slider attributes
    $('.symbol-slider').attr({
        max: 5,
        min: 1,
        value: 1,
        step: 1
    });
    
    $('.size').click(function(){
        titleText = '<h3 class="title">Recorded National Park Visitors in ' + attributes[0] + '</h3>';
        $('#map-title').html(titleText);
        var index = $('.symbol-slider').val();
        if ($(this).attr('id') == 'forward') {
            index ++;
            index = index > 5 ? 1 : index;
            
        } else if ($(this).attr('id') == 'reverse'){
            index --;
            index = index < 1 ? 5 : index;            
        };

        $('.symbol-slider').val(index);
        $('.range-slider').val(0);
        $('#symbol-info').html('<p class="desc">Current Symbol Scale Factor: <b>' + index + '</b></p>');
        updatePropSymbols(map, attributes[0], index);
    });    

    $('.skip').click(function(){
        //Establishing the new title text
        var index = $('.range-slider').val();
        var scale = $('.symbol-slider').val();
        $('#panel').html('');
        titleText = '<h3 class="title">Recorded National Park Visitors in ' + attributes[index] + '</h3>';
        $('#map-title').html(titleText);        

        if ($(this).attr('id') == 'forward') {
            index ++;
            index = index > 18 ? 0 : index;
            
        } else if ($(this).attr('id') == 'reverse'){
            index --;
            index = index < 0 ? 18 : index;
            
        };

        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index], scale);
        
    });

    $('.range-slider').on('input', function(){
        var index = $(this).val();
        updatePropSymbols(map, attributes[index]);

    });
    
};

//Dyanmically updating proportional symbols
function updatePropSymbols(map, attribute, scale=1){

    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius*scale);

            panelContent(props, attribute, layer, radius);

        };
    });
};


//Process attributes into an array
function processData(data){
    var attributes = [];

    var properties = data.features[0].properties;

    for (var attribute in properties){
        if (attribute.indexOf("2") > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};

//Function to retrieve data and put it on the map
function getData(map) {
    $.ajax('data/parkvisit.geojson', {
        dataType: 'json',
        success: function(response) {
            //call function createPropSymbols
      

            var attributes = processData(response);
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);

            return attributes;
        }
    });
};

$('#closeButton').click(function() {
    $('#myModal').modal('hide');
});



$(document).ready(function() {
    $('#myModal').modal('show');
    createMap();
    
});