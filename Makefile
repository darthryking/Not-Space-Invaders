.PHONY: run indent npm-install precommit-hook setup

run:
	python -m http.server

indent:
	node beautify.js

npm-install:
	npm install

precommit-hook:
	cp -f pre-commit ./.git/hooks/
	chmod u+x ./.git/hooks/pre-commit

setup: npm-install precommit-hook
