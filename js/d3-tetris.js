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

  // HTML DOM-level elements (jQuery objects)
  $document = $(document),
  $body = $("body"),
  $element,

  wrapper,
  fieldGroup,
  sideBoard,
  playBoard,

  safeZone,
  textArea,
    levelCounter,

  audioTog,
  btnOptions,



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

    initPlayboard(wrapper);
  };

  function initPlayboard(board){

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



  $document.ready(function(){ initializeApplication(); });


})(window);