//////////////////////////////
// eq.js
// The global borealis object that contains all eq.js functionality.
//
// borealis.nodes - List of all nodes to act upon when borealis.states is called
// borealis.nodesLength - Number of nodes in borealis.nodes
//
// borealis.refreshNodes - Call this function to refresh the list of nodes that eq.js should act on
// borealis.sortObj - Sorts a key: value object based on value
// borealis.query - Runs through all nodes and finds their widths and points
// borealis.nodeWrites - Runs through all nodes and writes their eq status
//////////////////////////////
(function (borealis, domready) {
  'use strict';

  function Borealis() {
    this.nodes = [];
    this.brlLength = 0;
    this.widths = [];
    this.points = [];
    this.callback = undefined;
  }

  //////////////////////////////
  // Object.getPrototypeOf Polyfill
  // From http://stackoverflow.com/a/15851520/703084
  //////////////////////////////
  if (typeof Object.getPrototypeOf !== 'function') {
    Object.getPrototypeOf = ''.__proto__ === String.prototype ? function (object) {
      return object.__proto__;
    }
    : function (object) {
      // May break if the constructor has been tampered with
      return object.constructor.prototype;
    };
  }

  //////////////////////////////
  // Request Animation Frame Polyfill
  //
  // Written by  Erik Möller and Paul Irish
  // From http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  //////////////////////////////
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      element = element;
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }

  //////////////////////////////
  // Add event (cross browser)
  // From http://stackoverflow.com/a/10150042
  //////////////////////////////
  function addEvent(elem, event, fn) {
    if (elem.addEventListener) {
      elem.addEventListener(event, fn, false);
    } else {
      elem.attachEvent('on' + event, function () {
        // set the this pointer same as addEventListener when fn is called
        return (fn.call(elem, window.event));
      });
    }
  }

  //////////////////////////////
  // Query
  //
  // Reads nodes and finds the widths/points
  //  nodes - optional, an array or NodeList of nodes to query
  //  callback - Either boolean (`true`/`false`) to force a normal callback, or a function to use as a callback once query and nodeWrites have finished.
  //////////////////////////////
  Borealis.prototype.query = function (nodes, callback) {
    var proto = Object.getPrototypeOf(borealis);
    var length;

    if (callback && typeof(callback) === 'function') {
      proto.callback = callback;
    }

    if (nodes && typeof(nodes) !== 'number') {
      length = nodes.length;
    }
    else {
      nodes = proto.nodes;
      length = proto.nodesLength;
    }
    var widths = [], points = [], i;

    for (i = 0; i < length; i++) {
      widths.push(nodes[i].offsetWidth);
      try {
        points.push(proto.sortObj(nodes[i].getAttribute('data-borealis-srcs')));
      }
      catch (e) {
        points.push({});
      }
    }

    proto.widths = widths;
    proto.points = points;

    if (nodes && typeof(nodes) !== 'number') {
      proto.nodeWrites(nodes, widths, points);
    }
    else if (callback && typeof(callback) !== 'function') {
      proto.nodeWrites();
    }
    else {
      window.requestAnimationFrame(proto.nodeWrites);
    }
  };

  //////////////////////////////
  // NodeWrites
  //
  // Writes the data attribute to the object
  //  nodes - optional, an array or NodeList of nodes to query
  //  widths - optional, widths of nodes to use. Only used if `nodes` is passed in
  //  points - optional, points of nodes to use. Only used if `nodes` is passed in
  //////////////////////////////
  Borealis.prototype.nodeWrites = function (nodes) {
    var i,
    length,
    callback,
    proto = Object.getPrototypeOf(borealis),
    widths = proto.widths,
    points = proto.points;

    if (nodes && typeof(nodes) !== 'number') {
      length = nodes.length;
    }
    else {
      nodes = proto.nodes;
      length = proto.nodesLength;
    }

    for (i = 0; i < length; i++) {
      // Set object width to found width
      var objWidth = widths[i];
      var obj = nodes[i];
      var brlSrcs = points[i];

      // Get keys for states
      var brlSrcsLength = brlSrcs.length;

      if (brlSrcsLength === 1) {
        obj.setAttribute('src', brlSrcs[0].value);
      }
      // Be greedy for smallest state
      else if (objWidth < brlSrcs[1].key) {
        obj.setAttribute('src', brlSrcs[0].value);
      }
      // Be greedy for largest state
      else if (objWidth >= brlSrcs[brlSrcsLength - 1].key) {
        obj.setAttribute('src', brlSrcs[brlSrcsLength - 1].value);
      }
      // Traverse the states if not found
      else {
        for (var j = 0; j < brlSrcsLength; j++) {
          var current = brlSrcs[j];
          var next = brlSrcs[j + 1];

          if (j === 0 && objWidth < current.key) {
            obj.setAttribute('src', brlSrcs[0].value);
            break;
          }

          if (next.key === undefined) {
            obj.setAttribute('src', next.value);
            break;
          }

          if (objWidth >= current.key && objWidth < next.key) {
            obj.setAttribute('src', current.value);
            break;
          }
        }
      }
    }

    // Run Callback
    if (proto.callback) {
      callback = proto.callback;
      proto.callback = undefined;
      callback(nodes);
    }
  };

  //////////////////////////////
  // Refresh Nodes
  // Refreshes the list of nodes for borealis to work with
  //////////////////////////////
  Borealis.prototype.refreshNodes = function () {
    var proto = Object.getPrototypeOf(borealis);
    proto.nodes = document.querySelectorAll('[data-borealis-srcs]');
    proto.nodesLength = proto.nodes.length;
  };

  //////////////////////////////
  // Sort Object
  // Sorts a simple object (key: value) by value and returns a sorted object
  //////////////////////////////
  Borealis.prototype.sortObj = function (obj) {
    var arr = [];

    var objSplit = obj.split(',');

    for (var i = 0; i < objSplit.length; i++) {
      if (i === 0) {
        arr.push({
          'key': -1,
          'value': objSplit[i]
        });
      }
      else {
        var sSplit = objSplit[i].replace(/:+/, '\x01').split('\x01');
        arr.push({
          'key': parseFloat(sSplit[0]),
          'value': sSplit[1].replace(/^\s+|\s+$/g, '')
        });
      }
    }

    return arr.sort(function (a, b) { return a.value - b.value; });
  };

  //////////////////////////////
  // Style Images
  // Adds styling to set up width and height appropriately
  //////////////////////////////
  Borealis.prototype.styleImages = function () {
    var proto = Object.getPrototypeOf(borealis);
    var nodeLength = proto.nodes.length;
    console.log(nodeLength);
    for (var i = 0; i < nodeLength; i++) {
      proto.nodes[i].style.width = 100 + '%';
      proto.nodes[i].style.height = 'auto';
    }
  };

  //////////////////////////////
  // We only ever want there to be
  // one instance of Borealis in an app
  //////////////////////////////
  borealis = borealis || new Borealis();

  //////////////////////////////
  // Window Onload
  //
  // Fires on load
  //////////////////////////////
  if (domready) {
    domready(function () {
      borealis.refreshNodes();
      borealis.styleImages();
      borealis.query(undefined, true);
    });
  }
  else {
    addEvent(window, 'DOMContentLoaded', function () {
      borealis.refreshNodes();
      borealis.styleImages();
      borealis.query(undefined, true);
    });
  }

  //////////////////////////////
  // Window Resize
  //
  // Loop over each `eq-pts` element and pass to eqState
  //////////////////////////////
  addEvent(window, 'resize', function () {
    borealis.refreshNodes();
    window.requestAnimationFrame(borealis.query);
  });

  // Expose 'borealis'
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = borealis;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return borealis;
    });
  } else {
    window.borealis = borealis;
  }
})(window.borealis, window.domready);