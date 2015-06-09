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
          .attr('x', function(d, i){ return graphData.xScale(i); })
          .attr('y', function(d){ return graphData.height - graphData.yScale(d); });

        // Append TEXT data label to each group
        bars.append('text')
          .text(function(d){ return d; })
          .attr('x', function(d, i){ return graphData.xScale(i); })
          .attr('y', function(d, i){ return graphData.height - graphData.yScale(d) - 5; });
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
}).controller('GeoMap', function(){})

.directive("comboGraph", function($filter){
  console.log('Initializing Combo Graph');

  var config = {

      width: 1000,
      height: 500,
      margin: [50, 200, 50, 50],

      data: [
        {
          name: "Lending Club",
          data: [
            {
              year: 2015,
              roi: 10.89,
              loss: 1.85,
              loans: 84277,
              volume: 1290044375
            },
            {
              year: 2014,
              roi: 9.39,
              loss: 4.30,
              loans: 235629,
              volume: 3503840175
            },
            {
              year: 2013,
              roi: 8.35,
              loss: 5.91,
              loans: 134756,
              volume: 1982003500
            },
            {
              year: 2012,
              roi: 6.68,
              loss: 7.43,
              loans: 53367,
              volume: 717942625
            },
            {
              year: 2011,
              roi: 6.26,
              loss: 6.66,
              loans: 21721,
              volume: 257363650
            }
          ]
        },
        {
          name: "Proser",
          data: [
            {
              year: 2015,
              roi: 9.64,
              loss: 2.57,
              loans: 9002,
              volume: 120185186
            },
            {
              year: 2014,
              roi: 8.73,
              loss: 4.49,
              loans: 123197,
              volume: 1598747693
            },
            {
              year: 2013,
              roi: 9.52,
              loss: 6.29,
              loans: 33908,
              volume: 357394811
            },
            {
              year: 2012,
              roi: 7.91,
              loss: 10.77,
              loans: 19553,
              volume: 153175120
            },
            {
              year: 2011,
              roi: 9.40,
              loss: 10.53,
              loans: 11228,
              volume: 75138012
            }
          ]
        }
      ]
    },

    colors = d3.scale.category20(),

    availWidth = config.width - config.margin[1] - config.margin[3],
    availHeight = config.height - config.margin[0] - config.margin[2],
    xRange = d3.range(0, config.data[0].data.length),
    yRange = d3.range(0, 100),

    scales,

    element,
    container,

    graphGroup,
    graphBox,

    lineGraphs,

    volumeGroup,
      volumeLines,
    loansGroup,
    roiGroup,
    lossGroup,

    popIdx,
    lineBuildIdx = 0,






    test;

    linker = function($scope, element, attrs) {
      scales = {
        x: d3.scale.ordinal()
            .domain(xRange).rangeBands([0, availWidth], 0, 0),
        y: d3.scale.linear()
          .domain(yRange).range([0, availHeight]),

        ratio: {
          volume: 5000000000, // $10b <= ???
          loans: 500000, // $1m
          roi: .5,
          loss: .5
        }
      }

      // Construct Base SVG element
      element = d3.select(element[0]).append('svg')
        .classed('combo', true)
        .attr('width', config.width)
        .attr('height', config.height);
        // Wrapper of all
        container = element.append('rect')
          .classed('combo-container', true)
          .attr('width', config.width)
          .attr('height', config.height);
        // Grouping of Graph Area
        graphGroup = element.append('g')
          .attr('transform', "translate(" + config.margin[3] + ", " + config.margin[0] + ")");
          // Graph Area
          graphBox = graphGroup.append('rect')
            .classed('combo-graph', true)
            .attr('width', availWidth)
            .attr('height', availHeight);
          // Grouping of Volume Data

          for (popIdx = 0; config.data.length > popIdx; popIdx++) {
            volumeLines = buildLineGraph(graphGroup, config.data[popIdx], "volume");
            loansLines = buildLineGraph(graphGroup, config.data[popIdx], "loans");
          }



    };

    function buildLineGraph(element, data, value) {

      console.log(data);

      var lineGroups = element.append('g')
        .classed("combo-graph-line-group-wrapper", true),

      lineGroup = lineGroups.selectAll('g')
                .data(data.data).enter().append('g')
                  .classed('combo-graph-line-group', true);

      // Construct Lines
      lineGroup.append('line')
        .classed('combo-graph-line', true)
        .attr("stroke-width", "5")
        .attr("x1", function(d, i){ return scales.x.rangeBand() * i; })
        .attr("x2", function(d, i){ return scales.x.rangeBand() * (i + 1); })
        .attr("y1", function(d, i){ return i === 0 ? (availHeight * .75 + (20 * lineBuildIdx)) : availHeight - Math.round(scales.y(data.data[i - 1][value]) / scales.ratio[value]); })
        .attr("y2", function(d, i){ return availHeight - Math.round(scales.y(data.data[i][value]) / scales.ratio[value]); })
        .attr("stroke", colors(lineBuildIdx));
      // Construct Dots
      lineGroup.append('circle')
        .classed('combo-graph-line-dot', true)
        .attr('r', 5)
        .attr("fill", colors(lineBuildIdx))
        .attr("transform", function(d, i){
          return "translate("
            + scales.x.rangeBand() * (i + 1)
            + ","
            + (availHeight - Math.round(scales.y(data.data[i][value]) / scales.ratio[value]))
            + ")";
        });

        lineGroups.append('text')
          .classed('combo-graph-line-label', true)
          .text(data.name + ": [" + value.toUpperCase() + "]")
          .attr('x', availWidth + 10 )
          .attr("y",  availHeight - Math.round(   scales.y(  data.data[data.data.length-1][value]  ) / scales.ratio[value]  )  )
          .attr("stroke", colors(lineBuildIdx));

          // console.log();

        lineBuildIdx++;

        return element;
    }

  return {
    restrict: 'E',
    scope: false,
    link: linker
  };
}).controller('ComboGraph', function(){});