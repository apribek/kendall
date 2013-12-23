/**
 * Created by adam on 12/19/13.
 */

var util = angular.module('util', []).factory('util', ['$log', function ($log) {
    return {
        debounce : function(fn, delay) {
            var timer = null;

            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            }
        },

        parseLocation : function(str) {
            $log.debug(str);

            try {
                var rx = new RegExp("\\[(\\d+\\.\\d+);(\\d+\\.\\d+)\\]");
                var matches = rx.exec(str);

                if(matches) {
                    var lat = parseFloat(matches[1]);
                    var lng = parseFloat(matches[2]);

                    return new google.maps.LatLng(lat, lng);
                }
            }
            catch(error) {
                $log.debug(error);
            }

            return null;
        }
    }
}]);