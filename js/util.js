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
        }
    }
}]);