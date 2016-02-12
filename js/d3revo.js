angular.module('d3revo', ['angular-ladda'])
    .factory('jQuery', [
        '$window',
        function ($window) {
            return $window.jQuery;
        }
    ])
    .controller('d3revoCtrl', ['$scope', '$http', function ($scope, $http) {

        var margin = {top: -5, right: -5, bottom: -5, left: 250},
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        var tree = d3.layout.tree()
            .size([height,width]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) {return [d.y, d.x]});


        var canvas = d3.select("#tree").append("svg")
            .attr("width", "100%")
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.behavior.zoom().scaleExtent([0.3, 10]).on("zoom", function(){
                canvas.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }))
            .append("g");


        canvas.append("rect")
            .attr("class", "overlay")
            .attr("fill", "transparent")
            .attr("width", width)
            .attr("height", height);


        d3.json("js/data.json", function(data) {
            data.x0 = height / 2;
            data.y0 = 0;

            var nodes = tree.nodes(data).reverse();
            var links = tree.links(nodes);

            // Normalize for fixed-depth
            nodes.forEach(function(d) { d.y = d.depth * 180; });

            var node = canvas.selectAll("g.node")
                .data(nodes)
                .enter()
                .append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

            node.append("circle")
                .attr("r",5)
                .attr("fill", "lightsteelblue");

            node.append("text")
                .text(function(d) {return d.name;})
                .attr("x", function(d){return -10;})
                .attr("y", function(d) {return 0;})
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return "end"; })



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