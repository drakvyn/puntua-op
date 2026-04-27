# Makefile — shortcuts for dev & prod Docker workflows

.PHONY: dev prod down-dev down-prod logs-dev logs-prod migrate-dev migrate-prod studio shell-app shell-db

# ─── Dev ──────────────────────────────────────────────────
dev:
	docker compose -f docker-compose.dev.yml --env-file .env.dev up --build

dev-d:
	docker compose -f docker-compose.dev.yml --env-file .env.dev up --build -d

down-dev:
	docker compose -f docker-compose.dev.yml down

down-dev-v:
	docker compose -f docker-compose.dev.yml down -v

logs-dev:
	docker compose -f docker-compose.dev.yml logs -f

migrate-dev:
	docker compose -f docker-compose.dev.yml --env-file .env.dev exec app npx prisma migrate dev

studio:
	@echo "Prisma Studio running at http://localhost:5555"
	docker compose -f docker-compose.dev.yml --env-file .env.dev up prisma-studio

# ─── Prod ─────────────────────────────────────────────────
prod:
	docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

down-prod:
	docker compose -f docker-compose.prod.yml down

down-prod-v:
	docker compose -f docker-compose.prod.yml down -v

logs-prod:
	docker compose -f docker-compose.prod.yml logs -f

migrate-prod:
	docker compose -f docker-compose.prod.yml --env-file .env.prod exec app npx prisma migrate deploy

# ─── Helpers ──────────────────────────────────────────────
shell-app:
	docker compose -f docker-compose.dev.yml exec app sh

shell-db:
	docker compose -f docker-compose.dev.yml exec postgres psql -U gigacoins -d gigacoins_dev

reset-dev:
	docker compose -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.dev.yml --env-file .env.dev up --build -d