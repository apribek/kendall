/**
 * Created by adam on 11/22/13.
 */

var geoApp = angular.module('geoApp', ['geoServices']);

geoApp.constant('audienceList',
    {
        'myself' : { key: 'myself',  label: 'Myself' },
        'anybody': { key: 'anybody', label: 'Anybody' },
        'blah'   : { key: 'blah',    label: 'Blah label' }
    }
);

geoApp.controller('mapTestCtrl', ['$scope', 'gMap', 'audienceList', function ($scope, map, al) {
    $scope.audienceList = al;

    $scope.message = "";
    $scope.messages = [];

    $scope.upClicked = function() {
        map.moveActiveMarker(0.001, 0);
    };

    map.init($scope);
}]);

geoApp.directive('infoWindow', function() {
    return {
        // template: "<div><textarea ng-model='message.msg'></textarea><br>Audience: <select ng-model='message.audience'><option label='Myself' value='myself'></option><option label='Anybody' value='everybody'></option></select></div>"
        templateUrl: 'index.html'
    }
});

