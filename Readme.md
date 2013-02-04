
# twain

  dynamic tweening engine

## Installation

    $ component install threepointone/twain

## API

from `examples/index.html`
```js

var box = document.getElementById('box'),
    twain = require('twain');

var tween = twain();    // start up a new tweener

tween.on('step', function(step) {
    for(var prop in step){
        box.style[prop] = step[prop] + 'px';
    }
    // if you had jquery, you could do -
    // $(box).css(step);
});

// update targets with every mousemove
document.body.addEventListener('mousemove', function(e) {
    tween.to({
        left: e.clientX,
        top:e.clientY
    });
});

// and... go!
tween.start();

```   

## License

  MIT
