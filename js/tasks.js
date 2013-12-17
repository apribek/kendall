/**
 * Created by adam on 12/15/13.
 */

var gTasks = angular.module('gTasks', []).factory('gTasks', ['$log', '$q', function($log, $q) {
    var clientId = '559380446604-rvvui7svj0s98hontlo974fkrtnnms99.apps.googleusercontent.com',
        scope = ['https://www.googleapis.com/auth/tasks', 'https://www.googleapis.com/auth/tasks.readonly'],
        authorized = false,
        accessDenied = false,
        libraryLoaded = false;
    var taskListId = null;

    function checkAccess(background) {
        var deferred = $q.defer();

        if(! accessDenied) {
            if(! authorized) {
                gapi.auth.authorize({
                    client_id : clientId,
                    immediate : background,
                    scope     : scope
                }, function(resp) {
                    $log.debug(resp);

                    if(resp != null && ! resp.error) {
                        authorized = true;
                        deferred.resolve(authorized);
                    }
                    else {
                        deferred.reject("Unauthorized");
                    }
                });
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

    function loadTaskLists() {
        var deferred = $q.defer();

        if(taskListId == null) {
            gapi.client.tasks.tasklists.list().execute(function(resp) {
                if(resp.items) {
                    resp.items.forEach(function(e) {
                        if(e.title == 'Default List') {
                            taskListId = e.id;
                            deferred.resolve(taskListId);
                            return false;
                        }
                    });
                }
                else {
                    deferred.reject("Error while getting your tasklists.")
                }
            });
        }
        else {
            deferred.resolve(taskListId);
        }
        return deferred.promise;
    }

    return {
        init : function() {
            gapi.client.setApiKey('AIzaSyClUbYr_xv2K9eGm0ePw2fmvJ11W1XaBK4');
            gapi.client.load('tasks', 'v1');
        },

        denyAccess : function() {
            accessDenied = true;
        },

        checkAccess : function() {
            return checkAccess(true);
        },

        allowAccess : function() {
            return checkAccess(false);
        },

        addTask : function(title, notes) {
            loadTaskLists().then(
                function(id) {
                    gapi.client.tasks.tasks.insert({
                        tasklist : id,
                        resource : {
                            title    : title,
                            notes    : notes
                        }
                    }).execute(function(resp) {
                        $log.debug("task add resp: " + resp);
                    });
                },
                function(error) {
                // could not save the task
                }
            );
        }
    }
}]);

var taskService = angular.module('taskService', ['gTasks']).factory('taskService', ['$log', 'gTasks', function ($log, gTasks) {
    function Task(title, location) {
        this.msg = this.title = title;
        this.location = location;
    }

    var tasks = [];

    return {
        addTask : function (mid, title, location) {
            $log.debug("title: " + title);

            gTasks.addTask(title, "note");
            tasks[mid] = new Task(title, location);
        },

        deleteTask : function (mid) {
            tasks[mid] = null;
        },

        getTask : function (mid) {
            return tasks[mid];
        },

        listTasks : function() {
            return tasks;
        }
    }
}]);