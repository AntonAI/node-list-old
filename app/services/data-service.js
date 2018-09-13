'use strict';

angular.module('myApp.data-service', ['myApp.socket-service'])
    .factory('DataService', ['SocketService', function(SocketService) {

        // Open new socket connection
        SocketService.setHost('dev.sensemetrics.com', 4201);

        return {
            getNodes: function() {
                SocketService.addOpenListener(function() {
                    SocketService.sendRequest('getNodes', {}, function(nodes) {

                        // TODO: return data to controller
                        console.log('Got all nodes:', nodes);

                        // Subscribe to each node's update events
                        for (var i = 0; i < nodes.length; i++) {
                            SocketService.sendRequest('subscribeNodes', {nodes: [nodes[i].id]}, function(newData) {
                                if (!('code' in newData) && 'type' in newData && 'data' in newData) {

                                    // TODO: return fresh data to controller and keep the list updated
                                    console.log('Got new node data:', newData.data);
                                }
                            });
                        }
                    });
                });
            }
        };
    }]);
