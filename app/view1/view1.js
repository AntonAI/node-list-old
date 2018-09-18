'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.data-service'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', 'DataService', function($scope, DataService) {

  // TODO: get array of nodes from the data service asynchronously, display as a list in the UI
  // TODO: data service will periodically receive updates for single nodes, need to update the UI accordingly
  DataService.getNodes();
}]);