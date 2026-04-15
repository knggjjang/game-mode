# Game Mode - Build Guide

이 가이드는 Game Mode를 Windows에서 빌드하고 배포하는 방법을 설명합니다.

## 필수 요구사항

### Windows
- **Rust** (최소 1.77.2 이상): https://rustup.rs/
- **Node.js** (최소 16 이상): https://nodejs.org/
- **npm** 또는 **yarn**
- **Visual Studio Build Tools** (C++ 빌드 도구)
  - [Visual Studio Community](https://visualstudio.microsoft.com/vs/community/) 설치
  - 또는 [Build Tools for Visual Studio](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) 설치

## 설치 및 빌드

### 1단계: 저장소 클론

```bash
git clone https://github.com/knggjjang/game-mode.git
cd game-mode
```

### 2단계: 의존성 설치

```bash
npm install
```

### 3단계: 개발 모드로 실행

```bash
npm run dev
```

그러면 다음 두 가지가 실행됩니다:
- Next.js 개발 서버 (http://localhost:3000)
- Tauri 데스크톱 앱

### 4단계: 프로덕션 빌드

```bash
npm run tauri build
```

빌드 결과물은 `src-tauri/target/release/bundle/` 디렉토리에 생성됩니다:
- `msi/` - Windows MSI 설치 프로그램
- `nsis/` - Windows NSIS 설치 프로그램

## 프로젝트 구조

```
game-mode/
├── src/                      # Next.js 프론트엔드
│   ├── app/                 # 페이지 및 레이아웃
│   ├── components/          # React 컴포넌트
│   ├── hooks/              # Custom hooks
│   ├── services/           # Tauri API 서비스
│   └── store/              # Zustand 상태 관리
├── src-tauri/              # Rust 백엔드
│   ├── src/               # Rust 소스 코드
│   ├── Cargo.toml         # Rust 의존성
│   └── tauri.conf.json    # Tauri 설정
├── public/                # 정적 자산
└── package.json          # Node.js 의존성
```

## 개발 가이드

### Tauri 커맨드 호출

프론트엔드에서 Rust 함수 호출:

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke("get_system_info");
```

### 새 Tauri 커맨드 추가

1. `src-tauri/src/lib.rs`에 함수 추가:

```rust
#[tauri::command]
fn my_command(param: String) -> Result<String, String> {
    Ok(format!("Received: {}", param))
}
```

2. `invoke_handler`에 등록:

```rust
.invoke_handler(tauri::generate_handler![
    my_command,
    // ... 다른 커맨드들
])
```

3. 프론트엔드에서 호출:

```typescript
const result = await invoke("my_command", { param: "test" });
```

## 문제 해결

### 빌드 실패

**증상**: `error: Microsoft Visual C++ 14.0 is required`

**해결**: Visual Studio Build Tools 설치 또는 Visual Studio Community의 C++ 빌드 도구 설치

### Tauri 오류

**증상**: `Error: ENOENT: no such file or directory, open 'path/to/file'`

**해결**: `npm install` 실행 후 재시도

## 배포

### 1. GitHub Releases에 업로드

1. GitHub에서 새 Release 생성
2. `src-tauri/target/release/bundle/msi/` 파일 업로드
3. 변경 사항 기술 및 게시

### 2. 자동 배포 (GitHub Actions)

`.github/workflows/build.yml`에서 자동 빌드/배포 설정 가능

## 참고 자료

- [Tauri 공식 문서](https://tauri.app/docs/)
- [Rust 공식 가이드](https://doc.rust-lang.org/)
- [Next.js 공식 문서](https://nextjs.org/docs)

## 라이선스

MIT License
