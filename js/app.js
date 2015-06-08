var app = angular.module("app", [])

.directive("barGraph", function(){

    var graphData,
      graph,
      bars;

    linker = function($scope, element, attrs) {

      $scope.graph = {
        height : 200,
        width : 450,
        nodes : 10,
        offset: 2
      };

      function drawGraph(){
        // Clear existing graph
        if (graph != undefined) { graph.remove(); }

        // Build SVG Element
        graph = d3.select(element[0]).append('svg')
          .classed('barGraph', true)
          .attr('width', graphData.width)
          .attr('height', graphData.height);

        // Create G groups for graph bars
        bars = graph.selectAll('g')
          .data(graphData.data).enter().append('g')
            .classed('barGraph-bargroup', true);

        // Append a RECT bar to each group
        bars.append('rect')
          .classed('barGraph-bargroup-bar', true)
          .attr('width', graphData.xScale.rangeBand())
          .attr('height', function(d){ return graphData.yScale(d); })
          .attr('x', function(d, i){
            return graphData.xScale(i);
          })
          .attr('y', function(d){
            return graphData.height - graphData.yScale(d);
          });

        // Append TEXT data label to each group
        bars.append('text')
          .text(function(d){ return d; })
          .attr('x', function(d, i){
            return graphData.xScale(i);
          })
          .attr('y', function(d, i){
            return graphData.height - graphData.yScale(d) - 5;
          });
      }

      function init(){

        graphData = angular.copy($scope.graph);
        graphData.offset = Math.floor(graphData.offset) / Math.pow(10, Math.floor(graphData.offset).toString().length);
        graphData.data = d3.range(1, (graphData.nodes + 1));

        graphData.yScale = d3.scale.linear()
          .domain([0, (d3.max(graphData.data) * 1.25)])
          .range([0, graphData.height]);

        graphData.xScale = d3.scale.ordinal()
          .domain(d3.range(0, graphData.data.length))
          .rangeBands([0, graphData.width], graphData.offset, 0);

          drawGraph();
      }

      $scope.$watch('graph', function(newVals, oldVals) {
        init();
      }, true);
    };
  return {
    restrict: 'E',
    scope: false,
    link: linker
  };
}).controller('BarGraph', function(){})

.directive("pieChart", function(){

    var graphData,
      graph,
      pieGroup,
      pie,
      arc,
      slices,

      colors = d3.scale.category20b();

    linker = function($scope, element, attrs) {
      $scope.graph = {
        radius: 100,
        nodes: 3
      };

      function drawGraph(){

        if (graph != undefined) { graph.remove(); }

        pie = d3.layout.pie()
          .value(function(d){
            return d.value;
          });

        arc = d3.svg.arc()
          .outerRadius(graphData.radius);


        graph = d3.select(element[0]).append('svg')
          .classed('pieChart', true)
          .attr('width', (graphData.radius*2))
          .attr('height', (graphData.radius*2));

        pieGroup = graph.append('g')
          .attr('transform', 'translate('+ graphData.radius +','+ graphData.radius +')');

        slices = pieGroup.selectAll('g')
          .data(pie(graphData.data)).enter().append('g');

        slices.append('path')
            .classed('pieChart-path', true)
            .attr('d', arc)
            .attr('fill', function(d, i){
              return colors(i);
            });

        slices.append('text')
          .attr('text-anchor', 'middle')
          .attr('transform', function(d){
            d.innerRadius = 0;
            d.outerRadius = graphData.radius;
            return 'translate('+ arc.centroid(d) +')'
          })
          .text(function(d, i){
            return d.data.value;
          });

      }

      function init() {
        graphData = angular.copy($scope.graph);
        graphData.data = [];

        for (var i = 0; graphData.nodes > i; i++) {
          graphData.data.push({
            "label": "Data Point",
            "value": Math.floor(Math.random() * 100)
          });
        };

        drawGraph();
      }

      $scope.$watch('graph', function(newVals, oldVals) {
        init();
      }, true);
    };
  return {
    restrict: 'E',
    scope: false,
    link: linker
  };
}).controller('PieChart', function(){})

.directive("forceGraph", function(){

  function buildMatrix(nodes){
    linkMatrix = [];
    tempMatrix = [];

    for (node in nodes) {
      if (nodes.hasOwnProperty(node)) {
        for (nodeIndex = 0; nodes[node] > nodeIndex; nodeIndex++) {
          tempMatrix.push({ name: node, target: mapNode(nodes, node, nodeIndex) });
        }
      }
    }

    return tempMatrix;

  }

  function mapNode(nodes, node, index) {
    if (node.toLowerCase() === "primary") { return []; }
    else {
      parentNode = node.toLowerCase() === "secondary" ? "primary" : "secondary";
      startRange = tempMatrix.length - nodes[parentNode] - index;
      endRange = tempMatrix.length - index;
      mapRange = d3.range(startRange, endRange);

      return spliceConnections(mapRange, graphData.connections, node);
    }
  }

  function spliceConnections(mapRange, connections) {
    if (mapRange.length > connections) {
      spliceIndex = Math.floor(Math.random() * mapRange.length + 1) - 1;
      mapRange.splice(spliceIndex, (spliceIndex + 1 !== mapRange.length ? spliceIndex + 1 : null));
      return spliceConnections(mapRange, connections);
    }

    return mapRange;
  }

  var graphData = {},
    links = [],
    nodes = [],
    node = "",
    handles,
    labels,
    graph,
    force,

    matrix = [],
    tempMatrix = [],
    linkMatrix = [],
    linkIndex = 0,
    targetLinkIndex = 0,
    parentNode = "",
    nodeIndex = 0,

    startRange,
    endRange,
    mapRange,
    spliceIndex,

    nodeSizes = {
      small: 2,
      medium: 4,
      large: 6
    },



    linker = function($scope, element, attrs) {
      $scope.graph = {
        width: 1000,
        height: 400,
        gravity: 1,
        charge: 500,
        connections: 1,
        nodeSize: "small",
        nodes: {
          primary: 1,
          secondary: 2,
          tertiary: 3
        }
      };

      function drawGraph() {

        if (graph != undefined) { graph.remove(); }

        graph = d3.select(element[0]).append('svg')
          .attr('width', graphData.width)
          .attr('height', graphData.height)
          .style('background', 'black');

        force = d3.layout.force()
          .nodes(graphData.data)
          .links([])
          .gravity(Math.floor(graphData.gravity) / Math.pow(10, Math.floor(graphData.gravity).toString().length))
          .charge(-graphData.charge)
          .size([graphData.width, graphData.height]);


        links = graph.selectAll('line')
          .data(linkMatrix).enter().append('line')
            .attr('stroke', 'white')

        handles = graph.selectAll('circle')
          .data(graphData.data).enter().append('g')
            .classed('forceGraph-handles', true)
            .call(force.drag);

        handles.append('circle')
          .attr('cx', function(d){ return d.x; })
          .attr('cy', function(d){ return d.y; })
          .attr('r', nodeSizes[graphData.nodeSize])
          .attr('fill', 'red');

        labels = handles.append('text')
          .text(function(d){ return d.name; })
          .attr('fill', 'green')
          .attr('font-size', function(d, i){
            switch (d.name.toLowerCase()) {
              case "primary":
                return "2em";
                break;
              case "secondary":
                return "1.5em";
                break;
              case "tertiary":
                return "1em";
                break;
              default: ".5em"
            }
          });

        force.on('tick', function(e){
          handles
            .attr('transform', function(d, i){ return 'translate('+ d.x + ',' + d.y +')'; })

          links
            .attr('x1', function(d){ return d.source.x; })
            .attr('y1', function(d){ return d.source.y; })
            .attr('x2', function(d){ return d.target.x; })
            .attr('y2', function(d){ return d.target.y; })
        });

        force.start();
      }

      function init(){
        graphData = angular.copy($scope.graph);
        graphData.connections = graphData.connections > 0 ? graphData.connections : 1;

        graphData.data = buildMatrix(graphData.nodes);

        for (linkIndex = 0; graphData.data.length > linkIndex; linkIndex++) {
          if (graphData.data[linkIndex].target && graphData.data[linkIndex].target.length) {
            for (targetLinkIndex = 0; graphData.data[linkIndex].target.length > targetLinkIndex; targetLinkIndex++) {
              linkMatrix.push({
                source: graphData.data[linkIndex],
                target: graphData.data[graphData.data[linkIndex].target[targetLinkIndex]]
              });
            };
          }
        };

        drawGraph();
      }

      $scope.$watch('graph', function(newVals, oldVals) {
        init();
      }, true);
    };

  return {
    restrict: 'E',
    scope: false,
    link: linker
  };
}).controller('ForceGraph', function(){})

.directive("geoMap", function($q){

  var graph,
    graphData,
    rawGeoData,
    jsonDefer,

    projector,
    path,

    boroughs,
    borders,

    projections = {
      mercator: "mercator",
      azimuth: "azimuthalEqualArea",
      stereographic: "stereographic"
    }

    linker = function($scope, element, attrs) {

      $scope.graph = {
        width: 800,
        height: 500,
        scale: 5,
        projection: projections["mercator"]
      }

      function drawGraph() {
        var scale = 5000;

        if (graph != undefined) { graph.remove(); }

        projector = d3.geo[projections[graphData.projection]]()
          .center([-73.9, 40.7])
          .scale(graphData.scale*10000)
          .translate([graphData.width/2,graphData.height/2]);

          console.log(rawGeoData);

        path = d3.geo.path().projection(projector);

        graph = d3.select(element[0]).append('svg')
          .classed('map', true)
          .attr('width', graphData.width)
          .attr('height', graphData.height)
          .style('border', "2px solid black");

        boroughs = graph.selectAll('g')
          .data(rawGeoData.features).enter().append('g');

        borders = boroughs.append('path')
          .classed('map-borough', true)
          .attr('d', path);
      }

      function init(){
        jsonDefer = $q.defer();

        if (!rawGeoData) {
          d3.json('/js/nyc.geojson', function(data){
            rawGeoData = data;
            jsonDefer.resolve();
          });
        } else { jsonDefer.resolve(); }

        jsonDefer.promise.then(function(){
          graphData = angular.copy($scope.graph);
          drawGraph();
        })
      }

      $scope.$watch('graph', function(newVals, oldVals) {
        init();
      }, true);
    };

  return {
    restrict: 'E',
    scope: false,
    link: linker
  };











}).controller('GeoMap', function(){});