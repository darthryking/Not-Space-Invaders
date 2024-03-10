.PHONY: run indent precommit-hook

run:
	python -m http.server

indent:
	node beautify.js

precommit-hook:
	cp -f pre-commit ./.git/hooks/
	chmod u+x ./.git/hooks/pre-commit
