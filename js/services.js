/**
 * Created by adam on 11/23/13.
 */

var geoServices = angular.module('geoServices', []);

geoServices.factory('gMap', function($compile) {
    var markerCounter = 0;
    var messages = [];
    var activeMarker = null;
    var scope = null;

    var addMarker = function(marker) {
        markerCounter++;

        marker.iid = markerCounter;
        marker.title = 'Marker ' + markerCounter;

        pushMessage({ msg: marker.title, audience: 'myself' });
        setActiveMarker(marker);
    };

    var setActiveMarker = function(newMarker) {
        if(activeMarker != null) {
            activeMarker.setIcon("http://maps.google.com/mapfiles/ms/micons/red-dot.png");
        }
        activeMarker = newMarker;
        activeMarker.setIcon('http://maps.google.com/mapfiles/ms/micons/yellow-dot.png');

        scope.message = messages[newMarker.iid - 1];
        scope.$apply();
    };

    var removeMarker =  function(marker) {
        marker.setMap(null);
        messages[marker.iid - 1] = marker.iid;  // cannot be set to null because ng-repeat will error if two or more of the same key (null) are found
    };

    var pushMessage = function(message) {
        messages.push(message);
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

            scope.messages = messages;

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
});