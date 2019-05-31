/* Brandon Buchs
GEOG 575 - Interactive Cartography and Geovisuzalization
Lab1 - Leaflet Lab
main.js
27 May 2019*/

//Determine symbol radius
function calcPropRadius(attValue) {
    var scaleFactor = 0.03;
    var area = attValue * scaleFactor;
    var radius = Math.sqrt(area/Math.PI);

    return radius;
}

function createPopup(properties, attribute, layer, radius){
    var popupContent = '<p><b>Park:</b> ' + properties.Name + '</p>';
    var year = attribute;
 
    var panelContent = popupContent  + '<p><b> Visitors in ' + year + ':</b> ' + properties[attribute] + '</p>';

    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -radius)
    });

    //event listeners
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $('#panel').html(panelContent);
        }
    });
};

//Create markers
function createMarkers(feature, latlng, attributes) {
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

    markerOptions.radius = calcPropRadius(attValue);

    var layer = L.circleMarker(latlng, markerOptions);

    createPopup(feature.properties, attribute, layer, markerOptions.radius);
    
    return layer;
};

//Creating proportional symbols
function createPropSymbols(data, map, attributes) {
    
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
    center: [39, -100],
    zoom: 4
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
    $('#slider').append('<input class="range-slider" type="range">');
    $('#slider').append('<button class="skip" id="reverse"><img src="img/reverse.png"></button>');
    $('#slider').append('<button class="skip" id="forward"><img src="img/forward.png"></button>');

    $('.range-slider').attr({
        max: 18,
        min: 0,
        value: 0,
        step: 1
    });

    $('.skip').click(function(){
        var index = $('.range-slider').val();

        if ($(this).attr('id') == 'forward') {
            index ++;
            index = index > 18 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index --;
            index = index < 0 ? 18 : index;
        };

        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index]);
        
    });

    $('.range-slider').on('input', function(){
        var index = $(this).val();
        updatePropSymbols(map, attributes[index]);

    });

    
};

//Dyanmically updating proportional symbols
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;

            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            createPopup(props, attribute, layer, radius);

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
        }
    });
};

$(document).ready(createMap);