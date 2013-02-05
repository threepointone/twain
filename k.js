require('k')({
    src:'./',    
    dest: './distro',
    files: [{
        src: './twain.js',
        dest: './twain.js'
    }]
})
.chain()
.clean()
.read()
.compress().write()
.log('built twain.min.js')
.fail(function(err){
    console.log('ERROR' + err);
});