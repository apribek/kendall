/**
 * Created by adam on 12/15/13.
 */

function Task(title, location) {
    this.id = null;
    this.msg = this.title = title;
    this.location = location;
}

Task.prototype.asResource = function() {
    return  {
        id    : this.id,
        title : this.title,
        notes : this.msg + (this.location ?
                    "\r\n\r\n-- @ --\r\n" + "[" + this.location.lat() + ";" + this.location.lng() + "]"
                    : "")
    }
}

var gTasks = angular.module('gTasks', ['oauth']).factory('gTasks', ['$log', '$q', 'oauth', function($log, $q, oauth) {
    'use strict';

    var taskListId = null;

    function loadTaskLists() {
        var deferred = $q.defer();

        if(taskListId == null) {
            oauth.checkAccess().then(
                function() {
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
                    }
                );
            });
        }
        else {
            deferred.resolve(taskListId);
        }
        return deferred.promise;
    }

    return {
        updateTask : function(task) {
            var taskId;

            loadTaskLists().then(
                function() {
                    if(! task.id) {
                        gapi.client.tasks.tasks.insert({
                                tasklist : taskListId,
                                resource : task.asResource()
                            }
                        ).execute(
                            function(resp) {
                                task.id = resp.id;
                            }
                        );
                    }
                    else {
                        $log.debug("update" + task.asResource());
                        gapi.client.tasks.tasks.update({
                                task     : task.id,
                                tasklist : taskListId,
                                resource : task.asResource()
                            }
                        ).execute(function(resp){
                            $log.debug(resp);
                        });
                    }
                },
                function(error) {
                // could not save the task
                }
            );

            return task;
        }
    }
}]);

var taskService = angular.module('taskService', ['gTasks']).factory('taskService', ['$log', 'gTasks', function ($log, gTasks) {
    var tasks = [];

    return {
        addTask : function (mid, title, location) {
            tasks[mid] = gTasks.updateTask(new Task(title, location));
        },

        updateTask : function(task) {
            gTasks.updateTask(task);
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