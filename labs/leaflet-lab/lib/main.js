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

//Create markers

function createMarkers(feature, latlng) {
    var attribute = '2001';
    //Create the Marker Options
    var markerOptions = {
    fillColor: '#6D3332',
    color: '#281313',
    opacity: 1,
    fillOpacity: 0.7,
    weight: 1
    };

    var attValue = Number(feature.properties[attribute]);

    markerOptions.radius = calcPropRadius(attValue);

    var layer = L.circleMarker(latlng, markerOptions);

    var popupContent = '<p><b> Park Name: </b>' + feature.properties.Name + ' <br><b> Visitors in ' + attribute + ':</b>' + attValue + '</b></p>';

    layer.bindPopup(popupContent);

    return layer;
}
//Creating proportional symbols
function createPropSymbols(data, map) {
    
    //Plot marker options on map
    L.geoJson(data, {
        pointToLayer: createMarkers
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

//Function to retrieve data and put it on the map
function getData(map) {
    $.ajax('data/parkvisit.geojson', {
        dataType: 'json',
        success: function(response) {
            //call function createPropSymbols
            createPropSymbols(response, map);
        }
    });
};

$(document).ready(createMap);