require('k')({
    src:'./lib'
})
.chain()
.clean()
.read()
.compress().write()
.fn(function(done){
    console.log('built dist/twain.min.js:', (this.files[0].content.length/1000) + 'k')    
})
.fail(function(err){
    console.log('ERROR' + err);
});