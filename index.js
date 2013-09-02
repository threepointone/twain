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