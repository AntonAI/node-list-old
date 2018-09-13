'use strict';

angular.module('myApp.data-service', ['myApp.socket-service'])
    .factory('DataService', ['SocketService', function(SocketService) {

        // Open a new socket connection
        SocketService.setHost('dev.sensemetrics.com', 4201);

        return {

            // Retrieve all nodes from server
            getNodes: function() {
                SocketService.addOpenListener(function() {
                    SocketService.sendRequest('getNodes', {}, function(nodes) {

                        // TODO: return data to controller for display
                        console.log('Got all nodes:', nodes);

                        // Subscribe to each node's update events
                        for (var i = 0; i < nodes.length; i++) {
                            SocketService.sendRequest('subscribeNodes', {nodes: [nodes[i].id]}, function(newData) {
                                if (!('code' in newData) && 'type' in newData && 'data' in newData) {

                                    // TODO: return updated data for a single node to controller and update display
                                    console.log('Got new node data:', newData.data);
                                }
                            });
                        }
                    });
                });
            }
        };
    }]);
