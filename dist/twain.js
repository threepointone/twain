(function(e){if("function"==typeof bootstrap)bootstrap("twain",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeTwain=e}else"undefined"!=typeof window?window.twain=e():global.twain=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// some helper functions
var nativeForEach = [].forEach,
    slice = [].slice,
    has = {}.hasOwnProperty;

function each(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
    } else {
        for (var key in obj) {
            if (has.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === {}) return;
            }
        }
    }
}

function collect(obj, fn) {
    var o = {};
    each(obj, function(el, index) {
        o[index] = (typeof fn === 'string') ? el[fn] : fn(el, index);
    });
    return o;
}

function extend(obj) {
    each(slice.call(arguments, 1), function(source) {
        each(source, function(val, prop){
            obj[prop] = val;
        });        
    });
    return obj;
}

function isValue(v) {
    return v != null; // matches undefined and null
}

function abs(n) {
    return n < 0 ? -n : n;
}

function identity(x) {
    return x;
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

    this.config = config = extend({}, config);

    // merge the defaults with self
    each(defaults, function(val, key) {
        this[key] = isValue(config[key]) ? config[key] : val;
    }, this);
}

extend(Tween.prototype, {
    // Number: defines 'origin', ie - the number to start from
    from: function(from) {
        this._from = this.value = from;
        isValue(this._to) || this.to(from);
        return this;
    },
    // Number: defines 'destinations', ie - the number to go to
    to: function(to) {
        isValue(this._from) || this.from(to);
        this._to = to;
        return this;
    },
    // run one step of the tween. updates internal variables, and return spec object for this 'instant'
    step: function() {

        isValue(this.time) || (this.time = this.now());

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

    extend(this, {
        config: obj || {},
        tweens: {}
    });

    this.encode = this.config.encode || identity;
    this.decode = this.config.decode || identity;

    // reset the config encode/decode functions. we don't want it to propogate through
    // ... or do we?        
    this.config.encode = this.config.decode = identity;

}

extend(Twain.prototype, {
    // convenience to get a tween for a prop, and generate if required.
    // send T == true to generate a nested twain instead
    $t: function(prop, T) {
        return (this.tweens[prop] || (this.tweens[prop] = (T ? Twain : Tween)(this.config)));
    },

    from: function(_from) {
        var from = this.encode(_from);
        each(from, function(val, prop) {
            this.$t(prop, typeof val === 'object').from(val);
        }, this);
        return this;
    },

    to: function(_to) {
        var to = this.encode(_to);
        each(to, function(val, prop) {
            this.$t(prop, typeof val === 'object').to(val);
        }, this);
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
        each(this.tweens, function(t) {
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
        each(this.tweens, function(tween) {
            tween.stop();
        });
        return this;
    }
});

// export some pieces 
Twain.Tween = Tween;

module.exports = Twain;
},{}]},{},[1])(1)
});
;