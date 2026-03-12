#!/bin/bash
# Docker compose commands for the local STAC + TiTiler stack.
# Run from the map-app-builder repo root.

COMPOSE_FILE="infra/docker-compose.yml"

case "${1:-up}" in
  up)
    docker compose -f "$COMPOSE_FILE" up -d
    echo "Waiting for services to start..."
    docker compose -f "$COMPOSE_FILE" ps
    ;;
  down)
    docker compose -f "$COMPOSE_FILE" down
    ;;
  reset)
    docker compose -f "$COMPOSE_FILE" down -v
    ;;
  status)
    docker compose -f "$COMPOSE_FILE" ps
    ;;
  *)
    echo "Usage: $0 {up|down|reset|status}"
    echo "  up     - Start all services"
    echo "  down   - Stop all services"
    echo "  reset  - Stop all services and remove database volume"
    echo "  status - Show service status"
    exit 1
    ;;
esac
