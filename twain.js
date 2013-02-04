;(function(){


/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("threepointone-raf/index.js", function(exports, require, module){
(function(){

    var root = this;
    module.exports = root.requestAnimationFrame || 
        root.webkitRequestAnimationFrame || 
        root.mozRequestAnimationFrame || 
        root.oRequestAnimationFrame || 
        root.msRequestAnimationFrame || 
        fallback;

var prev = new Date().getTime();

function fallback(fn) {
    var curr = new Date().getTime();
    var ms = Math.max(0, 16 - (curr - prev));
    setTimeout(fn, ms);
    prev = curr;
}    
}).call(this);



});
require.register("threepointone-animloop/index.js", function(exports, require, module){
var raf = require('raf'),
    emitter = require('emitter');

var running = false;

var EVT = 'beforedraw';

var AnimLoop = {
    start: function() {
        if(!running){
            running = true;
            runloop();
        }
    },
    stop: function(){
        running = false;
    }
};

emitter(AnimLoop);

module.exports = AnimLoop;

function runloop(){
    if(running){
        AnimLoop.emit(EVT);
        raf(runloop);
    }
}


});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("twain/index.js", function(exports, require, module){
//tween.js
var animloop = require('animloop'),
    emitter = require('emitter');

// some helper functions


var nativeForEach = [].forEach,
    slice = Array.prototype.slice;
function each(obj, iterator, context) {
    if(obj == null) return;
    if(nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if(obj.length === +obj.length) {
        for(var i = 0, l = obj.length; i < l; i++) {
            if(iterator.call(context, obj[i], i, obj) === {}) return;
        }
    } else {
        for(var key in obj) {
            if(Object.prototype.hasOwnProperty.call(obj, key)) {
                if(iterator.call(context, obj[key], key, obj) === {}) return;
            }
        }
    }
}


function extend(obj) {
    each(slice.call(arguments, 1), function(source) {
        for(var prop in source) {
            obj[prop] = source[prop];
        }
    });
    return obj;
}

function isValue(v) {
    return v != null; // matches undefined and null
}



// defaults
var defaults = {
    threshold: 0.2,
    // used for snapping, since the default algo doesn't
    multiplier: 0.15 / 16,
    // fraction to moveby per frame * fps
    acceleration: -2.5 / 1000,
    // rate of deceleration (used for inertia calculations)
    maxDisplacement: 500 // upper limit on inertial movement
};


// meat and potatoes

function Tween(obj) {
    if(!(this instanceof Tween)) return new Tween(obj);

    obj = obj || {};

    var t = this;

    each(defaults, function(val, key) {
        t[key] = isValue(obj[key]) ? obj[key] : val;
    });

    //tracking vars
    this.velocity = 0;
}

emitter(Tween.prototype);

extend(Tween.prototype, {
    from: function(from) {
        this._from = this._curr = from;
    },
    to: function(to) {
        if(!isValue(this._from)) {
            this.from(to);
        }
        this._to = to;
    },
    step: function() {
        if(!this.now) {
            this.startTime = this.now = new Date().getTime();
        }
        var now = new Date().getTime();
        var period = now - this.now;
        var fraction = Math.min(this.multiplier * period, 1);
        var delta = fraction * (this._to - this._curr);
        var value = this._curr + delta;

        if(Math.abs(this._to - value) < this.threshold) {
            delta = this._to - this._curr;
            this._curr = value = this._to;
            fraction = 1;
            this.emit('bullseye')

        } else {
            this._curr = value;
        }

        this.velocity = delta / period;
        this.now = now;

        var step = {
            time: this.now,
            period: period,
            fraction: fraction,
            delta: delta,
            value: value
        };

        this.emit('step', step);
        return step;

    },
    reset: function() {
        this.emit('reset');
        this.startTime = this.time = null;
        return this;
    },

    // convenience function to calculate inertial target at a given point
    // todo - calculate rolling average, instead of this._curr directly
    inertialTarget: function(acceleration, maxDisplacement) {
        var displacement = Math.min(Math.pow(this.velocity, 2) / (-2 * (acceleration || this.acceleration)), maxDisplacement || this.maxDisplacement);
        return(this._curr + (displacement * (this.velocity > 0 ? 1 : -1)));
    }

});


// Twain.js

function Twain(obj) {
    if(!(this instanceof Twain)) return new Twain(obj);
    this.config = obj;
    this.tweens = {};
    var t = this;

    var _step = this.step;
    this.step = function(){
        _step.apply(t, arguments);
    }

    this.running = false;
}

emitter(Twain.prototype);

extend(Twain.prototype, {
    // convenience to get a tween for a prop
    $t: function(prop, opts) {
        var t = this;
        if(this.tweens[prop]) {
            return this.tweens[prop];
        }

        var tween = this.tweens[prop] = Tween(opts || this.config);

        return tween;
    },
    from: function(from) {
        var t = this;
        each(from, function(val, prop) {
            t.$t(prop).from(val);
        });
        return this;
    },

    to: function(to) {
        var t = this;
        each(to, function(val, prop) {
            t.$t(prop).to(val);
        });
        return this;
    },
    step: function() {
        var o = {};
        each(this.tweens, function(tween, prop) {
            o[prop] = tween.step().value;
        });
        this.emit('step', o);
        return o;
    },
    start: function(prop) {
        // convenience to start off all/one tweens
        if(!this.running) {
            this.running = true;
            animloop.on('beforedraw', this.step);
            this.emit('start');

            if(!animloop.running) {
                animloop.start();
            }

        }

        this.running = true;
        return this;

    },
    stop: function(prop) {
        // convenience to stop all/one tweens
        this.running = false;
        animloop.off(this.step);
        this.emit('stop');
        return this;

    },
    inertial: function(obj) {
        obj = obj || {};
        var o = {},
            t = this;
        each(this.tweens, function(tween, prop) {
            o[prop] = tween.inertialTarget.apply(tween, obj[prop]);
        });
        return o;
    }
});

Twain.Tween = Tween;

module.exports = Twain;
});
require.alias("threepointone-animloop/index.js", "twain/deps/animloop/index.js");
require.alias("threepointone-raf/index.js", "threepointone-animloop/deps/raf/index.js");

require.alias("component-emitter/index.js", "threepointone-animloop/deps/emitter/index.js");

require.alias("component-emitter/index.js", "twain/deps/emitter/index.js");

if (typeof exports == "object") {
  module.exports = require("twain");
} else if (typeof define == "function" && define.amd) {
  define(require("twain"));
} else {
  window["Twain"] = require("twain");
}})();