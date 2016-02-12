angular.module('wsdlDepsApp', ['angular-ladda'])
    .controller('wsdlDepsCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.url = "http://rijs.cloud.si/rijs-soap/v1/Organ?wsdl";
        $scope.resp = "Click Submit and wait for the response!";


        $scope.send = function () {
            $scope.loginLoading = true;
            $http({
                method: 'POST',
                url: "http://localhost:8080/v1",
                data: $.param({url: $scope.url}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                responseType: "json"
            }).then(success, error)
        };

        var success = function(response) {
            $scope.resp = JSON.stringify(response.data.nodes, null, 2);
            draw(response.data.nodes, response.data.edges);
            $scope.loginLoading = false;
        };

        var error = function(response) {
            $scope.resp = JSON.stringify(response, null, 2);
            $scope.loginLoading = false;
        };

        function draw(nodes, edges) {
            nodes.forEach(function(a){
                a.title = a.label;
                a.label = a.id;
            });

            edges.forEach(function(a){
                a.arrows = "to";
                delete a.value;
            });

            var container = document.getElementById('mynetwork');
            var data = {
                nodes: nodes,
                edges: edges
            };

            var options = {
                nodes: {
                    shape: 'circle',
                    scaling: {
                        min: 5,
                        max: 20
                    },
                    font: {
                        size: 12,
                        face: 'Tahoma'
                    },
                    shadow: true
                },
                edges: {
                    color:{inherit:true},
                    width: 0,
                    smooth: {
                        type: 'vertical',
                        roundness: 1.7
                    }

                },
                interaction: {
                    hideEdgesOnDrag: true,
                    tooltipDelay: 200
                },
                physics: false
            };

            var network = new vis.Network(container, data, options);
        }
    }]
);