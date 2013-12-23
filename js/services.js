/**
 * Created by adam on 11/23/13.
 */

var geoServices = angular.module('geoServices', []);

geoServices.factory('gMap', ['$compile', '$log', 'taskService', function($compile, $log, taskService) {
    'use strict';

    var map = null;
    var infoWindow = new google.maps.InfoWindow();

    var markerCounter = 0;
    var activeMarker = null;
    var scope = null;

    function placeMarkerOnMap(latLng) {
        var marker = new google.maps.Marker({
            map: map,
            position: latLng,
            visible: true,
            draggable: true
        });

        return marker;
    }

    function addNewMarker(latLng, title) {
        var marker = placeMarkerOnMap(latLng);

        $log.debug(title);

        marker.iid = markerCounter++;
        marker.title = title || 'Marker ' + markerCounter;

        if(! title) {
            taskService.addTask(marker.iid, marker.title, marker.position);
            setActiveMarker(marker);

            if(! infoWindow.closed) {
                infoWindow.close();
                infoWindow.closed = true;
            }
        }

        infoWindow.iid = marker.iid;

        google.maps.event.addListener(marker, 'click', function(marker) {
            return function() {
                map.panTo(marker.position);
                setActiveMarker(marker);

                if(infoWindow.iid != marker.iid) {
                    infoWindow.iid = marker.iid;
                    infoWindow.close();
                    infoWindow.closed = true;
                }
                else {
                    if(infoWindow.closed) {
                        infoWindow.open(map, marker);
                        infoWindow.closed = false;
                    }
                    else {
                        infoWindow.close();
                        infoWindow.iid = marker.iid;
                        infoWindow.closed = true;
                    }
                }
            }
        }(marker));

        marker.addListener('rightclick', function() {
            removeMarker(this);
        });

    }

    function setActiveMarker(newMarker) {
        if(activeMarker != null) {
            activeMarker.setIcon("http://maps.google.com/mapfiles/ms/micons/red-dot.png");
        }
        activeMarker = newMarker;
        activeMarker.setIcon('http://maps.google.com/mapfiles/ms/micons/yellow-dot.png');

        // >>> This does not belong here
        scope.message = taskService.getTask(newMarker.iid);
        try {
            scope.$apply();
        }
        catch(error) {

        }
        // <<<
    };

    function removeMarker (marker) {
        marker.setMap(null);
        taskService.deleteTask(marker.iid - 1);
    };

    function setupMap() {
        map.addListener('click', function(mouseEvent) {     // mobile devices?
            map.panTo(mouseEvent.latLng);
            addNewMarker(mouseEvent.latLng);
        });
    }

    return {
        addNewMarker : function(latLng, title) {
            addNewMarker(latLng, title);
        },

        moveActiveMarker : function(dLat, dLong){
            if(activeMarker) {
                var currentPostion = activeMarker.getPosition();
                activeMarker.setPosition(new google.maps.LatLng(currentPostion.lat() + dLat, currentPostion.lng() + dLong));
            }
        },
        init : function(_scope) {
            scope = _scope;

            var ifmsgTemplate = $compile("<div info-window></div>")(scope);
            infoWindow.setContent(ifmsgTemplate[0]);
            infoWindow.iid = -1;
            infoWindow.closed = true;

            navigator.geolocation.getCurrentPosition(function(position) {
                map = new google.maps.Map(document.getElementById('map-canvas'), {
                    center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                    zoom: 15
                });
                setupMap();
            }, function(error) {
                $log.error(error);

                map = new google.maps.Map(document.getElementById('map-canvas'), {
                    center: new google.maps.LatLng(47.67431722805188, 19.124600887298584),
                    zoom: 15
                });

                setupMap();
            });

            navigator.geolocation.watchPosition(function(position) {
                map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
            });
        }
    }
}]);