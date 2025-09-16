#!/bin/bash

# script de funções e atalhos para o servidor/terminal
cd "$(dirname "$0")"

# iniciar servidor --start
function ligar() {
  pm2 start npm --name "evershop" --namespace "prod" -- run start
}

# iniciar servidor de dev --dev
function ligar_dev() {
  pm2 delete all >/dev/null 2>&1 && pm2 start npm --name "evershop" --namespace "dev" -- run dev
}

# iniciar servidor de teste --test
function ligar_test() {
  pm2 delete all >/dev/null 2>&1 && pm2 start npm --name "evershop" --namespace "test" -- run test
}

# compilar tema --compilar
function compilar() {
  echo "Compilando o tema 13372077.."
  npm run compile
  echo ""
  echo "Check."
}

# inicia verificação do servidor --lint
function lint() {
  echo "Iniciando verificação do servidor.."
  npm run lint
  echo ""
  echo "Check."
}

# limpar cache --cache
function cache() {
  echo "Limpando cache.."
  rm -rf dist/*
  echo "Check."
}

# parar servidor --stop
function parar_servidor() {
  pm2 stop evershop
}

# reiniciar servidor --restart
function reiniciar_servidor() {
  pm2 restart all --update-env
}

# resetar servidor --reset
function resetar_servidor() {
  pm2 delete all
}

# reinstalar dependencias --reinstall
function reinstalar() {
  echo "Reinstalando dependências.."
  rm -rf node_modules
  npm install
  echo "Check."
}

# status do servidor --status
function status_servidor() {
  pm2 status
}

# logs em tempo real --logs
function ver_logs() {
  pm2 logs evershop
}

# Função para limpar os logs do PM2 --cleanlog
function limpar_logs() {
  echo "Limpando logs.."
  pm2 flush
  echo "Check."
}

# buildar --build
function build() {
  echo "Buildando servidor.."
  local total_minutes=100
  local total_seconds=$((total_minutes * 60))

  # Inicia o build em segundo plano
  npm run build &
  local pid=$!

  # Contador regressivo
  while [ $total_seconds -gt 0 ]; do
    # Verifica se o processo ainda está rodando
    if ! ps -p $pid > /dev/null; then
      echo -e "\nBuild concluída antes do tempo estimado!"
      break
    fi

    # Calcula minutos e segundos restantes
    local mins=$((total_seconds / 60))
    local secs=$((total_seconds % 60))

    # Atualiza a mesma linha do terminal
    echo -ne "Tempo restante: ${mins}min ${secs}s\033[0K\r"

    sleep 1
    total_seconds=$((total_seconds - 1))
  done

  # Se o processo ainda estiver rodando após o tempo estimado
  if ps -p $pid > /dev/null; then
    echo -e "\nAguardando conclusão..."
    wait $pid
  fi

  echo -e "\nCheck."
}

# dicionário --ajuda
function ajuda() {
  echo "Comandos disponíveis:"
  echo "  build              - Builda o servidor."
  echo "  start              - Inicia o servidor."
  echo "  test               - Inicia o servidor em modo de testes."
  echo "  dev                - Inicia o servidor em modo de desenvolvimento."
  echo "  stop               - Para o servidor."
  echo "  restart            - Reinicia o servidor."
  echo "  reinstall          - Reinstala dependências."
  echo "  reset              - Mata todos os processos."
  echo "  status             - Verifica o status do servidor."
  echo "  logs               - Log em tempo real."
  echo "  clean              - Limpa os logs."
  echo "  cache              - Limpa a memória cachê."
  echo "  compilar           - Compila os arquivos de tema."
  echo "  lint               - Roda uma verificação completa no servidor."
  echo ""
}

# --- Lógica de Execução ---

case "$1" in
  "start")
    ligar
    ;;
  "dev")
    ligar_dev
    ;;
  "test")
    ligar_test
    ;;
  "compilar")
    compilar
    ;;
  "cache")
    cache
    ;;
  "build")
    build
    ;;
  "lint")
    lint
    ;;
  "tempmode")
    ligar_temp
    ;;
  "stop")
    parar_servidor
    ;;
  "restart")
    reiniciar_servidor
    ;;
  "reset")
    resetar_servidor
    ;;
  "reinstall")
    reinstalar
    ;;
  "status")
    status_servidor
    ;;
  "logs")
    ver_logs
    ;;
  "clean")
    limpar_logs
    ;;
  "ajuda" | "--help")
    ajuda
    ;;
  *)
    echo "??????????"
    ajuda
    exit 1
    ;;
esac
