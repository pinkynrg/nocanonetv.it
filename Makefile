.PHONY: start_server make_migrations migrate send_reminders start_client start_db start demo

start_server:
	PYTHONPATH=$(CURDIR) uv run --directory server uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload

make_migrations:
	docker compose -f docker-compose.development.yml up -d
	PYTHONPATH=$(CURDIR) uv run --project server alembic -c server/alembic.ini revision --autogenerate -m $(name)
	docker compose -f docker-compose.development.yml down

migrate:
	PYTHONPATH=$(CURDIR) uv run --project server alembic -c server/alembic.ini upgrade head

send_reminders:
	PYTHONPATH=$(CURDIR) uv run --project server python -m server.send_reminders $(args)

start_client:
	cd client && npm run dev && cd..

start_db:
	docker compose -f docker-compose.development.yml up

start:
	npx concurrently --names 'frontend,backend ,db      ' -c 'bgBlue.bold,bgMagenta.bold,bgGreen.bold' "make start_client" "make start_server" "make start_db"

# Re-record the README demo. Needs `make start` running in another terminal:
# the tape drives the real app, and the tokens in it are minted by the real API.
demo:
	cd demo && npm install --silent && npm run demo