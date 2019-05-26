
var map = L.map('map').setView([33.502, -82.206], 15); //Build the map with the center point and starting zoom


var basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data provided through mapbox.com',
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoiYnJhbmRvbmtidWNocyIsImEiOiJjamNiOWN5Z2EwMDF2MnF1ajh3NHNwZmN3In0.ZpBtYtaL-UhFvXEHn3vUWA',
    maxZoom: 22,
    minZoom: 10
}); //Add the basemap or first tileLayer to the map. Needs attribution, ID and accesstoken.

basemap.addTo(map); //Actually add to map


var marker = L.marker([33.479705, -82.22974]).addTo(map); //Add a marker to the map

marker.bindPopup('<b>I am located in Columbia County!</b>'); //add a popup to the marker


var polygon = L.polygon([
    [33.550238, -82.216991],
    [33.549487, -82.217163],
    [33.54963, -82.215554],
    [33.550632, -82.214888]
]).addTo(map); //Polygon added to map

polygon.bindPopup('<b>Redeemer Presbyterian Church</b>'); //Popup for the polygon

var circle = L.circle([33.50050, -82.19854], 500, {
    color: 'green',
    fillColor: 'gray',
    fillOpacity: 0.48
}).addTo(map); //circle added to the map