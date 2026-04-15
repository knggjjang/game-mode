# 🎮 Game Mode - Windows Gaming Optimizer

Windows 게이밍 성능 최적화 도구입니다. 불필요한 프로세스를 중지하고 메모리를 정리하여 게이밍 경험을 향상시킵니다.

## ✨ 주요 기능

- **게이밍 모드 토글** - 한 버튼으로 게이밍 최적화 활성화/비활성화
- **자동 최적화** - 설정된 시간마다 자동으로 시스템 최적화 수행
- **프로세스 관리** - 불필요한 프로세스 감지 및 중지
- **메모리 최적화** - 사용 가능한 메모리 확보
- **트레이 아이콘** - 최소화하여 백그라운드에서 실행
- **실시간 모니터링** - CPU/메모리 사용률 표시
- **커스터마이즈** - 설정 가능한 옵션들

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Desktop**: Tauri 2.x
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **UI Components**: shadcn/ui, Lucide Icons

## 📦 설치 및 실행

### 프로젝트 클론
```bash
git clone https://github.com/yourusername/game-mode.git
cd game-mode
```

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 📁 프로젝트 구조

```
game-mode/
├── src/
│   ├── app/                 # Next.js 앱 라우팅
│   ├── components/          # React 컴포넌트
│   │   └── ui/             # shadcn UI 컴포넌트
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # 유틸리티 함수
│   ├── services/           # 비즈니스 로직
│   └── store/              # Zustand 상태 관리
├── src-tauri/              # Tauri 데스크톱 앱 설정
├── public/                 # 정적 파일
└── package.json
```

## 🎯 로드맵

- [ ] 기본 UI 구현
- [ ] Windows 프로세스 관리 API 연동
- [ ] 메모리 최적화 기능
- [ ] 자동 최적화 스케줄러
- [ ] 트레이 아이콘 통합
- [ ] 설정 저장 및 로드
- [ ] 게임별 프로필 설정
- [ ] 성능 모니터링 대시보드

## 📝 라이선스

MIT License

## 🤝 기여

버그 리포트나 기능 제안은 Issues를 통해 해주세요.
