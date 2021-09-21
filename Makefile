.DEFAULT_GOAL := start

NODE_VERSION = $(shell echo `node -v`)

check_version:
	@echo "Checking if you are using at least node v14..."
	test "v14.0" \< "$(NODE_VERSION)" 

requirements: check_version

install:
	@npm install
	@cd example && npm install

start: requirements
	@npm start &
	@cd example && npm start

e2e_open:
	@npm run cypress:open