build: 
	browserify -r ./index.js -s twain -o dist/twain.js
	cat dist/twain.js | uglifyjs --mangle --compress -o dist/twain.min.js
	cat dist/twain.min.js | gzip | wc -c