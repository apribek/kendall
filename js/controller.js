/**
 * Created by adam on 11/22/13.
 */

var geoApp = angular.module('geoApp', ['geoServices', 'taskService', 'gTasks']);

geoApp.constant('audienceList',
    {
        'myself' : { key: 'myself',  label: 'Myself' },
        'anybody': { key: 'anybody', label: 'Anybody' },
        'blah'   : { key: 'blah',    label: 'Blah label' }
    }
);

geoApp.controller('mapTestCtrl', ['$scope', 'gMap', 'audienceList', 'taskService', 'gTasks', '$log', function ($scope, map, al, taskService, gTasks, $log) {
    $scope.audienceList = al;

    $scope.message = "";
    $scope.messages = taskService.listTasks;

    map.init($scope);
    gTasks.init();

    gTasks.checkAccess().then(function(a) {
        $scope.hideAuthorizationPanel = a;
    });

    $log.debug("v: " + $scope.hideAuthorizationPanel);

    $scope.upClicked = function() {
        map.moveActiveMarker(0.001, 0);
    };

    $scope.authorize = function() {
        gTasks.allowAccess().then(function(r) {
            $scope.hideAuthorizationPanel = r;
        }, function(error) {
            // bummer
        });
        return false;
    }

    $scope.doNotAuthorize = function() {
        $scope.hideAuthorizationPanel = true;
        gTasks.denyAccess();
    }
}]);

geoApp.directive('infoWindow', function() {
    return {
        // template: "<div><textarea ng-model='message.msg'></textarea><br>Audience: <select ng-model='message.audience'><option label='Myself' value='myself'></option><option label='Anybody' value='everybody'></option></select></div>"
        templateUrl: 'index.html'
    }
});

