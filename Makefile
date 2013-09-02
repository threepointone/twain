build: 
	browserify -r ./index.js -s twain -o dist/twain.js
	cat dist/twain.js | uglifyjs --mangle --compress -o dist/twain.min.js
	cat dist/twain.min.js | gzip | wc -c

test: 
	./node_modules/.bin/mocha tests/test.js --reporter spec

coverage: 
	# this won't work right now. todo. 
	rm -rf lib-cov/ && jscoverage lib lib-cov && TWAIN_COV=1 ./node_modules/.bin/mocha tests/test.js --reporter html-cov > coverage.html && open coverage.html && rm -rf lib-cov