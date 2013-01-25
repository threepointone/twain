
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
        box.style[step.prop] = step.value + 'px';
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
