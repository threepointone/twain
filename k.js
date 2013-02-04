require('k')({
    src:'./',    
    dest: './distro',
    files: [{
        src: './twain.js',
        dest: './twain.js'
    }]
})
.chain()
.read()
.write()
.log('built twain.js')
.compress().write()
.log('built twain.min.js')
.fail(function(err){
    console.log('ERROR' + err);
});