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