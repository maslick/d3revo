angular.module('d3revo', ['angular-ladda'])
    .factory('jQuery', [
        '$window',
        function ($window) {
            return $window.jQuery;
        }
    ])
    .controller('d3revoCtrl', ['$scope', '$http', function ($scope, $http) {

        var width = $("#tree").width();
        var height = $("#tree").height();


        var canvas = d3.select("#tree").append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("transform", "translate(0,0)")
            .call(d3.behavior.zoom().scaleExtent([0.3, 1]).on("zoom", function(){
                canvas.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }))
            .append("g");


        canvas.append("rect")
            .attr("class", "overlay")
            .attr("fill", "transparent")
            .attr("width", width)
            .attr("height", height);

        var tree = d3.layout.tree()
            .size([800,600]);

        d3.json("js/data.json", function(data) {

            var nodes = tree.nodes(data);
            var links = tree.links(nodes);

            var node = canvas.selectAll(".node")
                .data(nodes)
                .enter()
                .append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

            node.append("circle")
                .attr("r",5)
                .attr("fill", "steelblue");

            node.append("text")
                .text(function(d) {return d.name;});


            var diagonal = d3.svg.diagonal()
                .projection(function (d) {return [d.y, d.x]})

            canvas.selectAll(".link")
                .data(links)
                .enter()
                .append("path")
                .attr("class", "link")
                .attr("fill", "none")
                .attr("stroke", "#ADADAD")
                .attr("d", diagonal)


        });


    }]
);