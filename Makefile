.PHONY: run-frontend
run-frontend:
	@cd frontend && npm run dev

.PHONY: run-testnet
run-testnet:
	@cd blockchain && npm run testnet

.PHONY: run-deploy
run-deploy:
	@cd blockchain && npm run deploy