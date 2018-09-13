'use strict';

angular.module('myApp.socket-service', [])
    .factory('SocketService', [function() {

        // Define variables
        var nextId = 0;
        var connected = false;
        var authenticating = false;
        var callbacks = {};
        var openListeners = [];

        var socket;
        var host;
        var port;
        var apiCode;

        var interval;

        return {

            checkConnection: function() {

                var that = this;

                if (!interval) {
                    interval = setInterval(function() {
                        that.checkConnection();
                    }, 5000);
                }

                // Check if connection info has been set
                if (host !== undefined) {

                    // Check if a WebSocket is already open
                    if (socket === undefined) {

                        // Attempt to establish a new connection
                        if (window.location.protocol !== "https:" && host !== 'app.sensemetrics.com') {
                            socket = new WebSocket("ws://" + host + ":" + port + "/");
                        } else {
                            socket = new WebSocket("wss://" + host + ":" + port + "/");
                        }

                        // Trigger when the socket has been opened
                        socket.onopen = function(event) {

                            // Log socket connection
                            console.log("Socket opened with " + host + ":" + port);

                            // Perform socket authentication
                            authenticating = true;
                            that.sendRequest("authenticate", {
                                "code": apiCode
                            }, function(result) {

                                // Log authentication success
                                console.log("Handshake successful");

                                // Set the next request id
                                nextId = result.nextId;

                                // Set flags
                                connected = true;
                                authenticating = false;

                                // Trigger all connection open listeners
                                var i = openListeners.length;
                                while (i--) {
                                    openListeners[i]();
                                    openListeners.splice(i, 1);
                                }
                            });
                        };

                        // Trigger when socket is closed
                        socket.onclose = function() {

                            // Log socket closed
                            console.log("Socket closed");

                            // Set flags
                            connected = false;
                            authenticating = false;

                            // Clear the socket objects
                            socket = undefined;
                            callbacks = {};
                        };

                        // Trigger when a new message is received
                        socket.onmessage = function(event) {
                            that.onMessage(event.data);
                        };

                    } else {

                        // Make sure we are no actively authenticating
                        if (!authenticating) {

                            // Check the connection by sending a "time" request
                            this.sendRequest("time", {}, function(result) {
                                connected = true;
                            });
                        }
                    }

                } else {

                    // Set flags
                    connected = false;
                    authenticating = false;
                }
            },

            addOpenListener: function(listener) {

                // If a socket is already connected, call the listener immediately
                // Otherwise, save the listener
                if (connected) listener();
                else openListeners.push(listener);

                return this;
            },

            setHost: function(newHost, newPort) {

                // Save the connection info
                host = newHost;
                port = newPort;
                apiCode = '6A5CB3B58619A3BE096D8CCE';

                // If a socket is already open, close it
                if (socket !== undefined) {
                    socket.close();
                }

                // Check socket connection
                this.checkConnection();

                return this;

            },

            sendRequest: function(method, params, callback) {

                // Get the request id to use
                var requestId = method === 'authenticate' ? 0 : nextId;

                // Send the message
                socket.send(JSON.stringify({
                    "jsonrpc": "2.0",
                    "method": method,
                    "id": requestId,
                    "params": params
                }));

                // Save the response callback for later
                callbacks[requestId] = callback;

                // Increment the request id
                nextId = nextId + 1;

                return requestId;
            },

            onMessage: function(message) {

                // Parse the message
                var response = JSON.parse(message);

                // Send results to the originator via supplied callback
                if ("result" in response) {
                    if (callbacks[response.id] !== undefined) callbacks[response.id](response.result);
                } else if ("error" in response) {
                    if ("id" in response) {
                        if (callbacks[response.id] !== undefined) callbacks[response.id](response.error);
                    } else {
                        console.warn('Received error message:', JSON.stringify(response.error, undefined, 2));
                    }
                }
            }
        };
    }]);
