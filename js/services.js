/**
 * Created by adam on 11/23/13.
 */

var geoServices = angular.module('geoServices', ['taskService']);

geoServices.factory('gMap', ['$compile', 'taskService', function($compile, taskService) {
    'use strict';

    var markerCounter = 0;
    var activeMarker = null;
    var scope = null;

    var addMarker = function(marker) {
        markerCounter++;

        marker.iid = markerCounter;
        marker.title = 'Marker ' + markerCounter;

        taskService.addTask(marker.iid, marker.title, marker.position)
        setActiveMarker(marker);
    };

    var setActiveMarker = function(newMarker) {
        if(activeMarker != null) {
            activeMarker.setIcon("http://maps.google.com/mapfiles/ms/micons/red-dot.png");
        }
        activeMarker = newMarker;
        activeMarker.setIcon('http://maps.google.com/mapfiles/ms/micons/yellow-dot.png');

        // >>> This does not belong here
        scope.message = taskService.getTask(newMarker.iid);
        scope.$apply();
        // <<<
    };

    var removeMarker =  function(marker) {
        marker.setMap(null);
        taskService.deleteTask(marker.iid - 1);
    };

    return {
        moveActiveMarker:  function(dLat, dLong){
            if(activeMarker) {
                var currentPostion = activeMarker.getPosition();
                activeMarker.setPosition(new google.maps.LatLng(currentPostion.lat() + dLat, currentPostion.lng() + dLong));
            }
        },
        init: function(_scope) {
            scope = _scope;

            var map = null;
            var ifmsgTemplate = $compile("<div info-window></div>")(scope);
            var infoWindow = new google.maps.InfoWindow();
            infoWindow.setContent(ifmsgTemplate[0]);
            infoWindow.iid = -1;
            infoWindow.closed = true;

            navigator.geolocation.getCurrentPosition(function(position) {
                map = new google.maps.Map(document.getElementById('map-canvas'), {
                    center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                    zoom: 15
                });

                map.addListener('click', function(mouseEvent) {     // mobile devices?
                    map.panTo(mouseEvent.latLng);

                    var marker = new google.maps.Marker({
                        map: map,
                        position: mouseEvent.latLng,
                        visible: true,
                        draggable: true
                    });

                    addMarker(marker);

                    if(! infoWindow.closed) {
                        infoWindow.close();
                    }
                    infoWindow.iid = marker.iid;
                    infoWindow.closed = true;

                    google.maps.event.addListener(marker, 'click', function(marker){
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
                });
            });

            navigator.geolocation.watchPosition(function(position) {
                map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
            });
        }
    }
}]);