angular.module('d3revo', ['angular-ladda'])
    .controller('d3revoCtrl', ['$scope', '$http', function ($scope, $http) {

        var margin = {top: -5, right: -5, bottom: -5, left: 250},
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom,
            root = null,
            i = 0;

        var tree = d3.layout.tree()
            .size([height,width]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) {return [d.y, d.x]});

        var canvas = d3.select("#tree").append("svg")
            .attr("width", "100%")
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.behavior.zoom().scaleExtent([0.3, 1]).on("zoom", function(){
                canvas.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }))
            .append("g");

        canvas.append("rect")
            .attr("class", "overlay")
            .attr("fill", "transparent")
            .attr("width", width*10)
            .attr("height", height*10)
            .attr("transform", "translate(-" + width*5 + ",-" + height*5 + ")");


        /* CREATE TREE */
        root = { name: chance.first()};
        root.children = createSampleNode(3);

        root.x0 = height / 2;
        root.y0 = 0;
        /* END OF CREATE TREE */

        update(root);


        function update(source) {
            var duration = d3.event && d3.event.altKey ? 1000 : 500;

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse();

            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * 180; });

            // Update the nodes…
            var node = canvas.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .on("click", function(d) {
                    if (!d.children && !d._children && d.hasChildren) {
                        d.children = createSampleNode(Math.floor(1 + Math.random() * 5));
                        toggle(d);
                        update(d);
                    }
                    toggle(d);
                    update(d);
                });

            nodeEnter.append("svg:circle")
                .attr("r", 1e-6)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeEnter.append("svg:text")
                .attr("x", function(d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("y", function(d) { return d.children || d._children ? 0 : 0; })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .text(function(d) { return d.name; })
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeUpdate.select("text")
                .delay(0)
                .duration(0)
                .attr("x", function(d) {return d.children || d._children ? -10 : 10;})
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .style("fill-opacity", 1)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
                .style("cursor", function(d) { return "hand";})

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = canvas.selectAll("path.link")
                .data(tree.links(nodes), function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("svg:path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                })
                .transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }
        function toggle(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
        }

        function createSampleNode(number) {
            if (!number) var number = 1;
            var node = [];
            for (var i = 0; i < number; i ++) {
                node.push({name: chance.first(), hasChildren: chance.bool({likelihood: 40})});
            }
            return node;
        }
    }]
);