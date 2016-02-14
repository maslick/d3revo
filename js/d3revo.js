angular.module('d3revo', ['angular-ladda', 'ui.select'])
    .controller('d3revoCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

        $scope.nodelistitem = {};
        $scope.nodelist = [];

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
        $scope.nodelist.push({name: root.name});
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
                .style("fill-opacity", 1e-6)
                .style("cursor", function(d) { return d.hasChildren ? "hand" : "cursor";})

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function(d) {
                    if (d.class === "found") {
                        return "#ff4136"; //red
                    }
                    else if (d._children) {
                        return "lightsteelblue";
                    }
                    else {
                        return "#fff";
                    }
                })
                .style("stroke", function(d) {
                    if(d.class === "found")
                        return "#ff4136"; //red
                });

            nodeUpdate.select("text")
                .delay(0)
                .duration(0)
                .attr("x", function(d) {return d.children || d._children ? -10 : 10;})
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .style("fill-opacity", 1)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })

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
                .attr("d", diagonal)
                .style("stroke",function(d){
                    if(d.target.class==="found"){
                        return "#ff4136";
                    }
                });

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
            var name;
            for (var i = 0; i < number; i ++) {
                name = chance.first();
                node.push({name: name, hasChildren: chance.bool({likelihood: 40})});
                $scope.nodelist.push({name: name});
            }
            return node;
        }

        $scope.findNode = function(query) {
            $scope.laddaLoading = true;
            clearFoundNodes(root);
            update(root);
            var paths = searchTree(root,query,[]);
            if(typeof(paths) !== "undefined"){
                openPaths(paths);
            }
            else{
                alert(query +" not found!");
            }
            $timeout(function () {
                $scope.laddaLoading = false;
            }, 300);
        };

        function searchTree(obj,search,path){
            if(obj.name === search){ //if search is found return, add the object to the path and return it
                path.push(obj);
                return path;
            }
            else if(obj.children || obj._children){ //if children are collapsed d3 object will have them instantiated as _children
                var children = (obj.children) ? obj.children : obj._children;
                for(var i=0;i<children.length;i++){
                    path.push(obj);// we assume this path is the right one
                    var found = searchTree(children[i],search,path);
                    if(found){ // we were right, this should return the bubbled-up path from the first if statement
                        return found;
                    }
                    else{ //we were wrong, remove this parent from the path and continue iterating
                        path.pop();
                    }
                }
            }
            else{ //not the right object, return false so it will continue to iterate in the loop
                return false;
            }
        }

        function openPaths(paths){
            for(var i=0;i<paths.length;i++){
                if(paths[i].id !== "1"){ //i.e. not root
                    paths[i].class = 'found';
                    if(paths[i]._children){ //if children are hidden: open them, otherwise: don't do anything
                        paths[i].children = paths[i]._children;
                        paths[i]._children = null;
                    }
                    update(paths[i]);
                }
            }
        }

        function clearFoundNodes(obj) {
            delete obj.class;
            if(obj.children || obj._children) {
                var children = (obj.children) ? obj.children : obj._children;
                for(var i=0;i<children.length;i++) {
                    clearFoundNodes(children[i]);
                }
            }
        }

    }]
);