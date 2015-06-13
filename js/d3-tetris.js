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



  endVar,

  tileMatrix = d3.range(0, 10);
  tileMatrix.forEach(function(v, i){ tileMatrix[i] = d3.range(0, 20); });

  function initializeApplication(){
    console.log("Initializing Application");

    // Initialize Application Element
    $element = $(config.id).length ?
      $($(config.id)[0]).empty() :
      $("<div>").attr("id", config.selector).appendTo($body);

    wrapper = new D3BoardObject({
      el : d3.select("#" + $element[0].id).append("svg")
        .attr("width", config.width)
        .attr("height", config.height),
      key: "wrapper",
      width: config.width,
      height: config.height,
      class: config.prefix + "-mainWrapper",
      scale: {
        x: d3.scale.linear().domain([0, layout.wrapper.x]).range([0, config.width]),
        y: d3.scale.linear().domain([0, layout.wrapper.y]).range([0, config.height])
      }
    }).init(false, false, true);

    // fieldGroup = wrapper.config.el.append('g');

    createFieldElements(wrapper);
  };

  function createFieldElements(playfield){
    playBoard = new D3BoardObject({
      el: playfield.config.el.append("g"),
      key: "playBoard",
      parent: playfield,
      scaleToParent: true,
      class: config.prefix + "-playBoard",
    }).init(true, true, true);

      playBoard.initPlayfield = function(){
        tileMatrix.forEach(function(i, x){
          tileMatrix[x].forEach(function(y, o){
            tileMatrix[x][y] = false;
          });
        });

        return this;
      }

    safeZone = new D3BoardObject({
      el: playfield.config.el.append("g"),
      key: "safeZone",
      parent: playfield,
      scaleToParent: true,
      class: config.prefix + "-safeZone"
    }).init(true, true, true);

    scoreBox = new D3BoardObject({
      el: playfield.config.el.append("g"),
      key: "scoreBox",
      parent: playfield,
      scaleToParent: true,
      class: config.prefix + "-scoreBox"
    }).init(true, true);

      levelCounter = new D3TextNode({
        el: scoreBox.config.el.append("text"),
        key: "levelCounter",
        parent: scoreBox,
        scaleToParent: true,
        class: config.prefix + "-levelCounter"
      }).init(true, true).config.el
        .text("Level 1");

      yourScore = new D3TextNode({
        el: scoreBox.config.el.append("text"),
        key: "yourScore",
        parent: scoreBox,
        scaleToParent: true,
        class: config.prefix + "-yourScore"
      }).init(true, true).config.el
        .text("000000");

      highScore = new D3TextNode({
        el: scoreBox.config.el.append("text"),
        key: "highScore",
        parent: scoreBox,
        scaleToParent: true,
        class: config.prefix + "-highScore"
      }).init(true, true).config.el
        .text("999999");


    btnAudio = new D3ActionButton({
      el: playfield.config.el.append("g"),
      key: "btnAudio",
      parent: playfield,
      scaleToParent: true,
      class: config.prefix + "-btn-audio",
      clickEvent: function(){
        console.log("Audio Button Clicked: ", this);
      },
    }).init(true, true, true).initClickEvents();
      new D3TextNode({
        el: btnAudio.config.el.append("text").text("Toggle Audio"),
        parent: btnAudio,
        scaleToParent: true
      });

    btnOptions = new D3ActionButton({
      el: playfield.config.el.append("g"),
      key: "btnOptions",
      parent: playfield,
      scaleToParent: true,
      class: config.prefix + "-btn-options",
      clickEvent: function(){
        console.log("Options Button Clicked: ", this);
      }
    }).init(true, true, true).initClickEvents();;
      new D3TextNode({
        el: btnOptions.config.el.append("text").text("Options"),
        parent: btnOptions,
        scaleToParent: true
      });

    btnNewGame = new D3ActionButton({
      el: playfield.config.el.append("g"),
      key: "btnNewGame",
      parent: playfield,
      scaleToParent: true,
      class: config.prefix + "-btn-newGame",
      clickEvent: function(){
        console.log("New Game Button Clicked: ", this);
      }
    }).init(true, true, true).initClickEvents();;
      new D3TextNode({
        el: btnNewGame.config.el.append("text").text("New Game"),
        parent: btnNewGame,
        scaleToParent: true
      });

    btnPause = new D3ActionButton({
      el: playfield.config.el.append("g"),
      key: "btnPause",
      parent: playfield,
      scaleToParent: true,
      class: config.prefix + "-btn-pause",
      clickEvent: function(){
        console.log("Pause Button Clicked: ", this);
      }
    }).init(true, true, true).initClickEvents();;
      new D3TextNode({
        el: btnPause.config.el.append("text").text("Pause"),
        parent: btnPause,
        scaleToParent: true
      });
  }

 /*
  * D3 Board Objects
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

  function D3Object(data){
    this.config = $.extend({
      el: {},
      class: "",
      x: 0,
      y: 0,
      key: "",
      parent: "",
      scaleToParent: false,
      width: 0,
      height: 0,
      scale: {
        x: {},
        y: {}
      }
    }, data);

    this.init = function(gridPosition, calcScale, addRect){
      if (this.config.scaleToParent) {
        this.config.width = this.config.parent.config.scale.x(layout[this.config.key].x);
        this.config.height = this.config.parent.config.scale.y(layout[this.config.key].y);
      }

      if (gridPosition && !!layout[this.config.key]) {
        this.config.el.attr("transform",  "translate("
          + this.config.parent.config.scale.x(layout[this.config.key].grid[0]) + ", "
          + this.config.parent.config.scale.y(layout[this.config.key].grid[1]) + ")"
        );
      }


      if (calcScale && !!layout[this.config.key]) {
        this.config.scale = {
          x: d3.scale.linear().domain([0, layout[this.config.key].x]).range([0, this.config.parent.config.scale.x(layout[this.config.key].x)]),
          y: d3.scale.linear().domain([0, layout[this.config.key].y]).range([0, this.config.parent.config.scale.y(layout[this.config.key].y)])
        }
      }

      if (addRect) {
        this.config.el.append("rect")
          .classed(this.config.class, true)
          .attr("width", this.config.width)
          .attr("height", this.config.height);
      }

      return this;
    }
  }

  function D3BoardObject(data){
    D3Object.apply(this, arguments);
  } D3BoardObject.prototype.constructor = D3Object;


  function D3ActionButton(data){
    D3Object.apply(this, arguments);

    this.initClickEvents = function(){
      $(this.config.el.select("rect")[0]).on('click', this.config.clickEvent);
      return this;
    }
  } D3ActionButton.prototype.constructor = D3Object;

  function D3TextNode(data){
    D3Object.apply(this, arguments);
  } D3TextNode.prototype.constructor = D3Object;

  function D3Modal(data){
    var modal = wrapper.append('g')
      .attr("id", "d3-tetris-modal");

    // modal.append("rect")
    //   .attr("width", config.width)
    //   .attr("height", config.height);
  }


  $document.ready(function(){ initializeApplication(); });


})(window);