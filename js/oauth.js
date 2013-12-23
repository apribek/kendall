/**
 * Created by adam on 12/21/13.
 */
var oauth = angular.module('oauth', []);

oauth.factory('oauth', ['$log', '$q', function ($log, $q) {
    'use strict';

    var clientId, // = '559380446604-rvvui7svj0s98hontlo974fkrtnnms99.apps.googleusercontent.com',
        scope, // = ['https://www.googleapis.com/auth/tasks', 'https://www.googleapis.com/auth/tasks.readonly'],
        authorized = false,
        accessDenied = false,
        libraryLoaded = false;
    var taskListId = null;
    var gcLoaded = $q.defer();

    function checkAccessInternal(background) {
        var deferred = $q.defer();

        if(! accessDenied) {
            if(! authorized) {
                gcLoaded.promise.then(
                    function() {
                        gapi.auth.authorize({ client_id : clientId, immediate : background, scope : scope },
                            function(resp) {
                                $log.debug(resp);

                                if(resp != null && ! resp.error) {
                                    authorized = true;
                                    deferred.resolve(authorized);
                                }
                                else {
                                    deferred.reject("Unauthorized");
                                }
                            });
                    },
                    function(error) {
                        $log.debug(error);
                    }
                );
            }
            else {
                deferred.resolve(authorized);
            }
        }
        else {
            deferred.reject("Access denied")
        }

        return deferred.promise;
    }

    return {
        init : function(_clientId, _scope) {
            clientId = _clientId;
            scope = _scope;
        },

        gapiClientLoaded : function() {     // does not really belong here
            gcLoaded.resolve(true);
        },

        checkAccess : function() {
            return checkAccessInternal(true);
        },

        denyAccess : function() {
            accessDenied = true;
            gcLoaded.resolve(false);
        },

        allowAccess : function() {
            accessDenied = false;
            return checkAccessInternal(false);
        }
    }
}]);