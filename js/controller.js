/**
 * Created by adam on 11/22/13.
 */

var geoApp = angular.module('geoApp', ['geoServices', 'taskService', 'gTasks', 'oauth', 'util']);

geoApp.constant('audienceList',
    {
        'myself' : { key: 'myself',  label: 'Myself' },
        'anybody': { key: 'anybody', label: 'Anybody' },
        'blah'   : { key: 'blah',    label: 'Blah label' }
    }
);

geoApp.controller('mapTestCtrl', ['$scope', 'gMap', 'audienceList', 'taskService', 'gTasks', 'oauth', 'util', '$log', function ($scope, map, al, taskService, gTasks, oauth, util, $log) {
    var clientId = '559380446604-rvvui7svj0s98hontlo974fkrtnnms99.apps.googleusercontent.com',
        scope = ['https://www.googleapis.com/auth/tasks', 'https://www.googleapis.com/auth/tasks.readonly'];

    oauth.init(clientId, scope);

    $scope.audienceList = al;
    $scope.message = null;
    $scope.messages = taskService.listTasks;

    map.init($scope);

    $scope.change = util.debounce(function() {
            taskService.updateTask($scope.message);
        }, 500);

    oauth.checkAccess().then(function(a) {
        $scope.hideAuthorizationPanel = a;
        $log.debug("v: " + a);
    });

    $scope.upClicked = function() {
        map.moveActiveMarker(0.001, 0);
    };

    $scope.authorize = function() {
        oauth.allowAccess().then(function(r) {
            $scope.hideAuthorizationPanel = r;
        }, function(error) {
            // bummer
        });
        return false;
    }

    $scope.doNotAuthorize = function() {
        $scope.hideAuthorizationPanel = true;
        oauth.denyAccess();
    }
}]);

geoApp.directive('infoWindow', function() {
    return {
        // template: "<div><textarea ng-model='message.msg'></textarea><br>Audience: <select ng-model='message.audience'><option label='Myself' value='myself'></option><option label='Anybody' value='everybody'></option></select></div>"
        templateUrl: 'index.html'
    }
});

