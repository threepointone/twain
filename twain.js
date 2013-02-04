(function(name, definition) {

    if(typeof define === 'function') define(definition);
    else if(typeof module !== 'undefined') module.exports = definition();
    else this[name] = definition();

})('Twain', function() {

    // some helper functions
    var nativeForEach = [].forEach,
        slice = [].slice;

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

    // defaults for a single tweener. pass these params into constructor to change the nature of the animation
    var defaults = {
        // used for snapping, since the default algo doesn't
        threshold: 0.2,
        // fraction to moveby per frame * fps. this determins "speed"
        multiplier: 0.15 / 16,
        // rate of deceleration (used for inertia calculations)
        acceleration: -2.5 / 1000,
        // upper limit on inertial movement
        maxDisplacement: 500,
        // timer function, so you can do a custom f(t)
        now: function() {
            return new Date().getTime();
        }
    };


    // meat and potatoes
    function Tween(obj) {
        if(!(this instanceof Tween)) return new Tween(obj);
        obj = obj || {};
        var t = this;
        // merge the defaults with self
        each(defaults, function(val, key) {
            t[key] = isValue(obj[key]) ? obj[key] : val;
        });

        //tracking vars
        this.velocity = 0;
    }

    extend(Tween.prototype, {
        // Number: defines 'origin', ie - the number to start from
        from: function(from) {
            this._from = this._curr = from;
        },
        // Number: defines 'destinations', ie - the number to go to
        to: function(to) {
            if(!isValue(this._from)) {
                this.from(to);
            }
            this._to = to;
        },
        // run one step of the tween. updates internal variables, and return spec object for this 'instant'
        step: function() {
            this.time || (this.time = this.now());            
            // this is the heart of the whole thing, really. 
            // a simple implementation of an exponential smoothing function
            var now = this.now(),
                period = now - this.time,
                fraction = Math.min(this.multiplier * period, 1),
                delta = fraction * (this._to - this._curr),
                value = this._curr + delta;

            // snap if we're close enough to the target (defined by `this.threshold`)
            if(Math.abs(this._to - value) < this.threshold) {
                delta = this._to - this._curr;
                this._curr = value = this._to;
                fraction = 1;

            } else {
                this._curr = value;
            }
            // todo - this has to be a smoother average, so we can use it for inertia calculations
            this.velocity = delta / period;
            this.time = now;

            var step = {
                time: this.time,
                period: period,
                fraction: fraction,
                delta: delta,
                value: value
            };

            this._update(step);

            return step;

        },
        // default handler for every step. change this by using this.update(fn)
        _update: function() {
            // blank
        },
        // if function is passed, it registers that as the step handler. else, it executes a step and returns the spec object
        update: function(fn) {
            if(!fn) return this.step();
            this._update = fn;
            return this;

        },
        // resets time var so that next time it starts with a fresh value
        reset: function() {
            this.time = null;
            return this;
        },

        // convenience function to calculate inertial target at a given point
        // todo - calculate rolling average, instead of this._curr directly
        inertialTarget: function(acceleration, maxDisplacement) {
            var displacement = Math.min(Math.pow(this.velocity, 2) / (-2 * (acceleration || this.acceleration)), maxDisplacement || this.maxDisplacement);
            return(this._curr + (displacement * (this.velocity > 0 ? 1 : -1)));
        }

    });


    // Twain.
    // this basically holds a collection of tweeners for easy usage. 
    // check out examples on how to use.

    function Twain(obj) {
        if(!(this instanceof Twain)) return new Twain(obj);
        var t = this,
            _step = t.step;

        extend(t, {
            config: obj,
            tweens: {},
            step: function() {
                _step.apply(t, arguments);
            }
        });

    }

    extend(Twain.prototype, {
        // convenience to get a tween for a prop
        $t: function(prop, opts) {
            return(this.tweens[prop] || (this.tweens[prop] = Tween(extend({}, this.config, opts))));
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

        current: function() {
            var o = {};
            each(this.tweens, function(tween, prop) {
                o[prop] = tween._curr;
            });
            return o;
        },

        step: function() {
            var o = {};
            each(this.tweens, function(tween, prop) {
                o[prop] = tween.step().value;
            });
            this._update(o);
            return o;
        },

        _update: function() {
            // blank
        },

        update: function(fn) {
            if(!fn) return this.step();
            this._update = fn;
            return this;
        },

        inertial: function(obj) {
            obj = obj || {};
            var o = {};
            each(this.tweens, function(tween, prop) {
                o[prop] = tween.inertialTarget.apply(tween, obj[prop]);
            });
            return o;
        }
    });

    Twain.Tween = Tween;

    return Twain;

});