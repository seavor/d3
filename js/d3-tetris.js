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



  var config = {
    width: 400,
    height: 500,
    selector : "d3-tetris",
    id : "#d3-tetris",
    prefix : "d3t"
  },

  layout = {
    wrapper  : { x: 20, y: 24, grid: [0, 0]},
    sideBoard: { x: 4,  y: 20, grid: [2, 2]},
    playBoard: { x: 10, y: 20, grid: [8, 2]},
    safeZone:  { x: 4,  y: 4 , grid: [0, 0]},
    scoreBox:  { x: 4,  y: 4 , grid: [0, 5]},
    audioTog:  { x: 2,  y: 2 , grid: [1, 10]},
    buttons:   { x: 4,  y: 7 , grid: [0, 13]},
    // wrapper:   { x: 24, y: 30 },
    endVar:   { x: 0, y: 0 },
  },

  // HTML DOM-level elements (jQuery objects)
  $document = $(document),
  $body = $("body"),
  $element,

  wrapper,
  sideBoard,
  playBoard,

  safeZone,



  endVar;

  function initializeApplication(){
    console.log("Initializing Application");

    // Initialize Application Element
    $element = $(config.id).length ?
      $($(config.id)[0]).empty() :
      $("<div>").attr("id", config.selector).appendTo($body);

    wrapper = new D3ObjectWrapper({
      el : d3.select("#" + $element[0].id).append("svg")
        .attr("width", config.width)
        .attr("height", config.height),
      width: config.width,
      height: config.height,
      class: config.prefix + "-mainWrapper",
      scale: {
        x: d3.scale.linear().domain([0, layout.wrapper.x]).range([0, config.width]),
        y: d3.scale.linear().domain([0, layout.wrapper.y]).range([0, config.height])
      }
    }, "wrapper", false);

    sideBoard = new D3ObjectWrapper({
      el: wrapper.el.append("g")
        .attr("transform", "translate("
          + wrapper.scale.x(layout.sideBoard.grid[0]) + ", "
          + wrapper.scale.y(layout.sideBoard.grid[1]) +")"
        ),
      width: wrapper.scale.x(layout.sideBoard.x),
      height: wrapper.scale.y(layout.sideBoard.y),
      class: config.prefix + "-sideBoard",
    }, "sideBoard");

    safeZone = new D3ObjectWrapper({
      el: sideBoard.el.append("g"),
      width: sideBoard.scale.x(layout.safeZone.x),
      height: sideBoard.scale.y(layout.safeZone.y),
      class: config.prefix + "-safeZone",
      scale: {
        x: d3.scale.linear().domain([0, layout.safeZone.x]).range([0, sideBoard.scale.x(layout.safeZone.x)]),
        y: d3.scale.linear().domain([0, layout.safeZone.y]).range([0, sideBoard.scale.y(layout.safeZone.y)])
      }
    }, "safeZone");

    playBoard = new D3ObjectWrapper({
      width: wrapper.scale.x(layout.playBoard.x),
      height: wrapper.scale.y(layout.playBoard.y),
      class: config.prefix + "-playBoard",

      el: wrapper.el.append("g")
        .attr("transform", "translate("
          + wrapper.scale.x(layout.playBoard.grid[0]) +", "
          + wrapper.scale.y(layout.playBoard.grid[1]) +")"
        )
    }, "playBoard");
  };

 /*
  * D3 object containers
  *
  * @param [Object] data - extend's base object
  * @param [Integer] data.x - element's x position
  * @param [Integer] data.y - element's y position
  * @param [Integer] data.width - element's width
  * @param [Integer] data.height - element's height
  * @param [d3Element] data.el - container for d3 G element
  * @param [String] data.class - class for element
  * @param [d3Scale] data.scale - d3 scale for element's x/y axes
  */

  function D3ObjectWrapper(data, key, scale, rect){
    var scale = scale === undefined ? true : scale,
      rect = rect === undefined ? true : rect,
      temp = $.extend({
        el: {},
        class: "",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        scale: {
          x: {},
          y: {}
        }
      }, data);

    if (scale) {
      temp.scale = {
        x: d3.scale.linear().domain([0, layout[key].x]).range([0, wrapper.scale.x(layout[key].x)]),
        y: d3.scale.linear().domain([0, layout[key].y]).range([0, wrapper.scale.y(layout[key].y)])
      }
    }

    if (rect) {
      temp.el.append("rect")
        .classed(data.class, true)
        .attr("width", data.width)
        .attr("height", data.height);
    }

    return temp;
  }



  $document.ready(function(){ initializeApplication(); });


})(window);