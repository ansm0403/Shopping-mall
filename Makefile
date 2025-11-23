# Shopping Mall NX 모노레포 Docker 관리 Makefile

.PHONY: help build up down dev logs clean restart

# 기본 타겟
help: ## 사용 가능한 명령어 목록을 보여줍니다
	@echo "사용 가능한 명령어:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# 프로덕션 환경
build: ## 프로덕션용 Docker 이미지를 빌드합니다
	docker-compose build

up: ## 프로덕션 환경을 시작합니다
	docker-compose up -d

down: ## 모든 컨테이너를 중지하고 제거합니다
	docker-compose down

restart: down up ## 컨테이너를 재시작합니다

# 개발 환경
dev: ## 개발 환경을 시작합니다
	docker-compose -f docker-compose.dev.yaml up -d

dev-build: ## 개발용 Docker 이미지를 빌드합니다
	docker-compose -f docker-compose.dev.yaml build

dev-down: ## 개발 환경을 중지합니다
	docker-compose -f docker-compose.dev.yaml down

# 로그 및 디버깅
logs: ## 모든 서비스의 로그를 확인합니다
	docker-compose logs -f

claude-logs: ## Claude Code 대화 로그를 확인합니다 (UTF-8 변환 후)
	@powershell -Command "if (Test-Path ./logs) { Get-ChildItem ./logs/*.log | ForEach-Object { try { $$c = Get-Content $$_.FullName -Encoding Unicode -ErrorAction Stop; $$c | Out-File $$_.FullName -Encoding UTF8 -Force } catch {} }; $$latest = Get-ChildItem ./logs/session-*.log -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1; if ($$latest) { Get-Content $$latest.FullName } else { Write-Host 'No session logs found' } } else { Write-Host 'No logs directory' }"

convert-logs: ## 모든 로그 파일을 UTF-8로 변환합니다
	@powershell -File ./convert-logs-to-utf8.ps1

start-log: ## PowerShell 터미널 로깅을 시작합니다
	@powershell -File ./start-logging.ps1

stop-log: ## PowerShell 터미널 로깅을 종료합니다 (UTF-8 자동 변환)
	@powershell -File ./stop-logging.ps1

logs-backend: ## 백엔드 로그만 확인합니다
	docker-compose logs -f backend

logs-frontend: ## 프론트엔드 로그만 확인합니다
	docker-compose logs -f frontend

logs-postgres: ## PostgreSQL 로그만 확인합니다
	docker-compose logs -f postgres

# 개발용 로그
dev-logs: ## 개발 환경의 모든 로그를 확인합니다
	docker-compose -f docker-compose.dev.yaml logs -f

dev-logs-backend: ## 개발 환경 백엔드 로그를 확인합니다
	docker-compose -f docker-compose.dev.yaml logs -f backend-dev

dev-logs-frontend: ## 개발 환경 프론트엔드 로그를 확인합니다
	docker-compose -f docker-compose.dev.yaml logs -f frontend-dev

# 유지보수
clean: ## 사용하지 않는 Docker 리소스를 정리합니다
	docker system prune -f
	docker volume prune -f

clean-all: down clean ## 모든 컨테이너, 이미지, 볼륨을 제거합니다
	docker-compose down -v --rmi all
	docker system prune -af

# 데이터베이스 관리
db-reset: ## 데이터베이스를 초기화합니다
	docker-compose down -v
	docker-compose up -d postgres

# 헬스 체크
health: ## 모든 서비스의 상태를 확인합니다
	@echo "PostgreSQL 상태:"
	@curl -s http://localhost:5432 || echo "PostgreSQL 연결 실패"
	@echo "\n백엔드 상태:"
	@curl -s http://localhost:3001/health || echo "백엔드 연결 실패"
	@echo "\n프론트엔드 상태:"
	@curl -s http://localhost:3000 || echo "프론트엔드 연결 실패"

# 설치 및 초기 설정
install: ## 프로젝트를 처음 설치합니다
	yarn install
	docker-compose build
	docker-compose up -d

# 개발 환경 전체 재시작
dev-restart: dev-down dev ## 개발 환경을 재시작합니다

# 프로덕션 배포 준비
deploy-prep: ## 배포를 위한 이미지를 빌드합니다
	docker-compose build --no-cache
	docker-compose up -d
	@echo "배포 준비 완료! http://localhost:3000 에서 확인하세요"
