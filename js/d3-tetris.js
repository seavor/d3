(function(window){
  // (function injectDependencies(){
    //   var jQueryDefer = new Promise(function(resolve, reject){
    //     if (!!window.jQuery) { resolve(); }
    //     else {

    //       var tag = document.createElement('script');
    //         tag.type = "text/javascript";
    //         tag.async = true;
    //         tag.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js';
    //         tag.onload = resolve;
    //         tag.onreadystatechange = function() {
    //             if (this.readyState == 'complete') { resolve(); }
    //         }

    //         document.getElementsByTagName('head')[0].appendChild(tag);
    //     }
    //   });
    // })();

  var app = {
    width: 400,
    height: 500,
    selector : "d3-tetris",
    id : "#d3-tetris",
    prefix : "d3t"
  },

  layout = {
    wrapper  : { x: 20, y: 24, grid: [0, 0]},
    playBoard: { x: 10, y: 20, grid: [8, 2]},
    safeZone:  { x: 4,  y: 4 , grid: [2, 2]},
    scoreBox:  { x: 4,  y: 4 , grid: [2, 7]},
      levelCounter: { x: 0,  y: 0 , grid: [.75, 1]},
      yourScore:    { x: 0,  y: 0 , grid: [.75, 2.75]},
      highScore:    { x: 0,  y: 0 , grid: [.75, 3.5]},
    btnAudio:  { x: 2,  y: 2 , grid: [3, 12]},
    btnOptions:{ x: 4,  y: 2 , grid: [2, 15]},
    btnNewGame:{ x: 4,  y: 2 , grid: [2, 17.5]},
    btnPause:  { x: 4,  y: 2 , grid: [2, 20]},

    endVar:   { x: 0, y: 0 },
  },

  pieces = {
    cube  : newD3Matrix(4, 2, [[0, 0],[0, 1],[1, 0],[1, 1]]),
    line  : newD3Matrix(4, 2, [[0, 1],[1, 1],[2, 1],[3, 1]]),
    el    : newD3Matrix(4, 2, [[0, 1],[0, 0],[1, 0],[2, 0]]),
    jay   : newD3Matrix(4, 2, [[0, 0],[1, 0],[2, 0],[2, 1]]),
    zee   : newD3Matrix(4, 2, [[0, 1],[1, 1],[1, 0],[2, 0]]),
    beezee: newD3Matrix(4, 2, [[0, 0],[1, 0],[1, 1],[2, 1]]),
    tri   : newD3Matrix(4, 2, [[0, 0],[1, 0],[2, 0],[1, 1]])
  },

  // HTML DOM-level elements (jQuery objects)
  $document = $(document),
  $body = $("body"),
  $element,





  endVar;

  function initializeApplication(){
    console.log("Initializing Application");

    // Initialize Application Element
    $element = $(app.id).length ?
      $($(app.id)[0]).empty() :
      $("<div>").attr("id", app.selector).appendTo($body);

    wrapper = new D3Object({
      el: d3.select("#" + $element[0].id).append("svg")
        .attr("width", app.width)
        .attr("height", app.height),
      key: "wrapper",
      width: app.width,
      height: app.height,
      class: app.prefix + "-mainWrapper",
    }, false, false, true);

    wrapper.resetDimensions = function(){

      this.dimensions.width = app.width;
      this.dimensions.height = app.height;

      this.dimensions.scale = {
        x: d3.scale.linear().domain([0, layout.wrapper.x]).range([0, this.dimensions.width]),
        y: d3.scale.linear().domain([0, layout.wrapper.y]).range([0, this.dimensions.height])
      }
    }; wrapper.resetDimensions();

    initializePlayboard(wrapper);
  };

  function initializePlayboard(board){

    playBoard = new D3Object({
      el: board.element().append("g"),
      key: "playBoard",
      parent: board,
      class: app.prefix + "-playBoard",
    }, true, true, true );






  }

 /*
  * Custom-Wrapped D3 Object
  */

  function D3ConfigObject(data){
    return $.extend({
      el: {},
      class: "",
      x: 0,
      y: 0,
      key: "",
      parent: "",
      width: 0,
      height: 0,
      scale: {
        x: {},
        y: {}
      }
    }, data);
  }

  function D3Object(data, initDimensions, positionToGrid, addFrame){
    var config =  new D3ConfigObject(data);

    if (initDimensions) { setDimensions(); }
    if (positionToGrid && !!layout[config.key]) { setToGrid(); }
    if (addFrame) { addRect(); }


    function setDimensions(){
      config.width = config.parent.dimensions.scale.x(layout[config.key].x);
      config.height = config.parent.dimensions.scale.y(layout[config.key].y);

      config.scale = {
        x: d3.scale.linear()
          .domain([0, layout[config.key].x])
          .range([0, config.parent.dimensions.scale.x(layout[config.key].x)]),
        y: d3.scale.linear()
          .domain([0, layout[config.key].y])
          .range([0, config.parent.dimensions.scale.y(layout[config.key].y)])
      }
    }

    function setToGrid(){
      config.el.attr("transform",  "translate("
        + config.parent.dimensions.scale.x(layout[config.key].grid[0]) + ", "
        + config.parent.dimensions.scale.y(layout[config.key].grid[1]) + ")"
      );
    }

    function addRect(width, height, pos){
      var temp = config.el.append("rect")
        .classed(app.prefix + "-frame", true)
        .attr("width", width || config.width)
        .attr("height", height || config.height);

        if (pos) {
          temp.attr("transform", "translate(" + pos[0] + "," + pos[1] + ")")
        }

      return config.el;
    }

    return {
      element: function(el){
          if (!!el & typeof(el) == Object) { config.el = el; }
          return config.el;
        },
      parent: function(el){
          if (!!el & typeof(el) == Object) { config.parent = el; }
          return config.parent;
        },
      key: function(key){
          if (!!key & typeof(key) == String) { config.key = key; }
          return config.key;
        },
      dimensions: {
          height: config.height,
          width: config.width,
          x: config.x,
          y: config.y,
          scale: {
            x: config.scale.x,
            y: config.scale.y,
          }
        },

      addRect: addRect,
      resetDimensions: setDimensions
    }
  }

  function D3PieceGenerater(piece) {
    var keys = Object.keys(pieces);

    return pieces[piece] || pieces[keys[ keys.length * Math.random() << 0]];
  }

 /*
  * Utility Functions
  */
  function newD3Matrix(x, y, config){
    var config = config || [],
      matrix = new Array(x),

      i, o, configTemp;

      for (i = 0; matrix.length > i; i++) {
        matrix[i] = new Array(y);
      }

      for (o = 0; config.length > o; o++) {
        configTemp = config[o];
        matrix[configTemp[0]][configTemp[1]] = true;
      };

      return matrix;
  }



  $document.ready(function(){ initializeApplication(); });


})(window);