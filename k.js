require('k')({
    src:'./lib'
})
.chain()
.clean()
.read()
.compress().write()
.log('built dist/twain.min.js')
.fail(function(err){
    console.log('ERROR' + err);
});