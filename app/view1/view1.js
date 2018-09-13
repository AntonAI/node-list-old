'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.data-service'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['DataService', function(DataService) {

  // TODO: get returned array of nodes from the backend, display as a list in the front-end
  // TODO: data service will periodically receive updates for single nodes, need to update fron-end accordingly
  DataService.getNodes();
}]);