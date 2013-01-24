var animloop = require('animloop'),
    emitter = require('emitter'),
    each = require('each'),
    bind = require('bind');


// some helper functions
var isArray = Array.isArray ||
function(obj) {
    return toString.call(obj) == '[object Array]';
};

function extend(obj) {
    each(Array.prototype.slice.call(arguments, 1), function(source) {
        for(var prop in source) {
            obj[prop] = source[prop];
        }
    });
    return obj;
}

function clone(obj) {
    if(Array.isArray(obj)) return obj.slice();
    var ret = {};
    for(var key in obj) ret[key] = obj[key];
    return ret;
}

function isValue(v) {
    return v != null; // matches undefined and null
}


module.exports = Twain;

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

function Twain(obj) {
    if(!(this instanceof Twain)) return new Twain(obj);

    obj = obj || {};

    var t = this;

    each(defaults, function(val, key) {
        t[key] = isValue(obj[key]) ? obj[key] : val;
    });


    t.step = bind(t, t.step);

    //tracking vars
    this.running = false;
    this.velocity = 0;
}

emitter(Twain.prototype);


extend(Twain.prototype, {
    from: function(from) {
        this._from = this._curr = from;
    },
    to: function(to) {
        if(!this._from){
            this.from(to);      
        }
        this._to = to;
    },
    step: function() {
        var now = new Date().getTime();
        var period = now - this.time;
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
        this.time = now;

        this.emit('step', {
            time: this.time,
            period: period,
            fraction: fraction,
            delta: delta,
            value: value
        });

        return this;

    },
    start: function() {
        if(!this.running) {
            this.running = true;
            this.startTime = this.time = new Date().getTime();
            animloop.on('beforedraw', this.step);

            if(!animloop.running){
                animloop.start();
            }

            this.emit('start');
        }
        return this;
    },
    stop: function() {
        this.running = false;
        animloop.off(this.step);
        this.emit('stop');
        return this;
    },
    
    // convenience function to calculate inertial target at a given point
    // todo - calculate rolling average, instead of this._curr directly

    inertialTarget: function(acceleration, maxDisplacement) {
        var displacement = Math.min(Math.pow(this.velocity, 2) / (-2 * (acceleration || this.acceleration)), maxDisplacement || this.maxDisplacement);
        return(this._curr + (displacement * (this.velocity > 0 ? 1 : -1)));
    }

});