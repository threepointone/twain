(function(e){if("function"==typeof bootstrap)bootstrap("twain",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeTwain=e}else"undefined"!=typeof window?window.twain=e():global.twain=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _ = require('fn');

function collect(obj, fn) {
    var o = {};
    _.each(obj, function(el, index) {
        o[index] = (typeof fn === 'string') ? el[fn] : fn(el, index);
    });
    return o;
}

function abs(n) {
    return n < 0 ? -n : n;
}

// defaults for a single tweener. pass these params into constructor to change the nature of the animation
var defaults = {
    // used for snapping, since the algorithm doesn't ever reach the 'end'
    threshold: 0.2,
    // fraction to moveby per frame * fps. this determines "speed"
    // defaults to ~ 15% * (1000/60)
    multiplier: 0.01,
    // timer function, so you can do a custom f(t)
    now: function() {
        return new Date().getTime();
    }
};


// meat and potatoes

function Tween(config) {
    if (!(this instanceof Tween)) return new Tween(config);

    this.config = config = _.extend({}, config);

    var t = this;

    // merge the defaults with self
    _.each(defaults, function(val, key) {
        t[key] = _.isValue(config[key]) ? config[key] : val;
    });
}

_.extend(Tween.prototype, {
    // Number: defines 'origin', ie - the number to start from
    from: function(from) {
        this._from = this.value = from;
        _.isValue(this._to) || this.to(from);
        return this;
    },
    // Number: defines 'destinations', ie - the number to go to
    to: function(to) {
        _.isValue(this._from) || this.from(to);
        this._to = to;
        return this;
    },
    // run one step of the tween. updates internal variables, and return spec object for this 'instant'
    step: function() {

        _.isValue(this.time) || (this.time = this.now());

        // this is the heart of the whole thing, really. 
        // an implementation of an exponential smoothing function
        // http://en.wikipedia.org/wiki/Exponential_smoothing
        var now = this.now(),
            period = now - this.time,
            fraction = Math.min(this.multiplier * period, 1),
            delta = fraction * (this._to - this.value),
            value = this.value + delta;

        // snap if we're close enough to the target (defined by `this.threshold`)
        if (abs(this._to - value) < this.threshold) {
            delta = this._to - this.value;
            this.value = value = this._to;
            fraction = 1;

        } else {
            this.value = value;
        }

        this.time = now;

        this._update({
            time: this.time,
            period: period,
            fraction: fraction,
            delta: delta,
            value: value
        });

        return this;

    },
    // default handler for every step. change this by using this.update(fn)
    _update: function() {
        // blank
    },
    // if function is passed, it registers that as the step handler. else, it executes a step and returns self
    update: function(fn) {
        if (!fn) return this.step();
        this._update = fn;
        return this;

    },
    // resets time var so that next time it starts with a fresh value
    stop: function() {
        this.time = null;
        return this;
    },
    multiply: function(n) {
        this.multiplier = typeof n === 'function' ? n.apply(this) : n;
    }

});


// Twain.
// this basically holds a collection of tweeners for easy usage. 
// check out examples on how to use.

function Twain(obj) {
    if (!(this instanceof Twain)) return new Twain(obj);

    _.extend(this, {
        config: obj || {},
        tweens: {}
    });

    this.encode = this.config.encode || _.identity;
    this.decode = this.config.decode || _.identity;

    // reset the config encode/decode functions. we don't want it to propogate through
    // ... or do we?        
    this.config.encode = this.config.decode = _.identity;

}

_.extend(Twain.prototype, {
    // convenience to get a tween for a prop, and generate if required.
    // send T == true to generate a nested twain instead
    $t: function(prop, T) {
        return (this.tweens[prop] || (this.tweens[prop] = (T ? Twain : Tween)(this.config)));
    },

    from: function(_from) {
        var t = this;
        var from = this.encode(_from);
        _.each(from, function(val, prop) {
            t.$t(prop, typeof val === 'object').from(val);
        });
        return this;
    },

    to: function(_to) {
        var t = this;
        var to = this.encode(_to);
        _.each(to, function(val, prop) {
            t.$t(prop, typeof val === 'object').to(val);
        });
        return this;
    },

    step: function() {
        var val = this.value = collect(this.tweens, function(tween) {
            return tween.step().value;
        });
        this._update(val);
        return this;
    },
    decoded: function() {
        return this.decode(this.value);
    },

    multiply: function(n) {
        _.each(this.tweens, function(t) {
            t.multiply(n);
        });
    },

    _update: function() {
        // blank
    },

    update: function(fn) {
        if (!fn) return this.step();
        this._update = fn;
        return this;
    },
    stop: function() {
        _.each(this.tweens, function(tween) {
            tween.stop();
        });
        return this;
    }
});

// export some pieces 
Twain.Tween = Tween;

module.exports = Twain;
},{"fn":2}],2:[function(require,module,exports){
// fair caveat, this is code collected for various places, and I don't have tests yet. YET.

"use strict";

module.exports = {
    isValue: isValue,
    identity: identity,
    indexOf: indexOf,
    isArray: isArray,
    toArray: toArray,
    each: each,
    extend: extend,
    map: map,
    times: times,
    invoke: invoke,
    filter: filter,
    find: find,
    reduce: reduce,
    debounce: debounce,
    compose: compose
};

var slice = [].slice,
    has = {}.hasOwnProperty,
    toString = {}.toString;

function isValue(v) {
    return ((v !== null) && (v !== undefined));
}

function identity(x) {
    return x;
}

function indexOf(arr, obj) {
    if (arr.indexOf) {
        return arr.indexOf(obj);
    }
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj) {
            return i;
        }
    }
    return -1;
}

function isArray(obj) {
    if (Array.isArray) {
        return Array.isArray(obj);
    }
    return toString.call(obj) === '[object Array]';
}

function toArray(obj) {
    if (!obj) {
        return [];
    }
    if (isArray(obj)) {
        return slice.call(obj);
    }
    if (obj.length === +obj.length) {
        return map(obj, identity);
    }
    return map(obj, function(val) {
        return val;
    });
}

function each(obj, fn) {
    if (isArray(obj)) {
        for (var i = 0, j = obj.length; i < j; i++) {
            fn(obj[i], i);
        }
    } else {
        for (var prop in obj) {
            if (has.call(obj, prop)) {
                fn(obj[prop], prop);
            }
        }
    }
}

function extend(obj) {
    var args = slice.call(arguments, 1);
    for (var i = 0, j = args.length; i < j; i++) {
        var source = args[i];
        for (var prop in source) {
            if (has.call(source, prop)) {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
}

function map(obj, fn) {
    var arr = [];
    var f = (typeof(fn) === 'string') ? function(o) {
            return o[fn];
        } : fn;
    each(obj, function(v, k) {
        arr.push(f(v, k));
    });
    return arr;
}

function times(n, fn) {
    var arr = [];
    for (var i = 0; i < n; i++) {
        arr[i] = fn(i);
    }
    return arr;
}

function invoke(obj, fnName) {
    var args = slice.call(arguments, 2);
    return map(obj, function(v) {
        return v[fnName].apply(v, args);
    });
}

function filter(arr, fn) {
    var ret = [];
    for (var i = 0, j = arr.length; i < j; i++) {
        if (fn(arr[i], i)) {
            ret.push(arr[i]);
        }
    }
    return ret;
}

function find(arr, fn) {
    for (var i = 0, j = arr.length; i < j; i++) {
        if (fn(arr[i], i)) {
            return arr[i];
        }
    }
    return null;
}

function reduce(arr, fn, initial) {
    var idx = 0;
    var len = arr.length;
    var curr = arguments.length === 3 ? initial : arr[idx++];

    while (idx < len) {
        curr = fn.call(null, curr, arr[idx], ++idx, arr);
    }
    return curr;
}

function debounce(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
        }
        return result;
    };
}

function compose() {
    var funcs = arguments;
    return function() {
        var args = arguments;
        for (var i = funcs.length - 1; i >= 0; i--) {
            args = [funcs[i].apply(this, args)];
        }
        return args[0];
    };
}
},{}]},{},[1])(1)
});
;