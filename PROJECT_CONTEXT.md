# 기억방 학습기 프론트 프로젝트 인수인계 문서

이 문서는 `/Users/jeongseog-u/VSCode-workspace/remember-room-fe` 프로젝트의 현재 상태를 다른 AI/개발자가 바로 이어받을 수 있도록 정리한 문서다.

## 1. 프로젝트 개요

- 프로젝트명: `기억방 학습기`
- 프론트 저장소: `https://github.com/72studycamp/remember-room-fe.git`
- 기술 스택:
  - React 19
  - TypeScript
  - Vite
  - CSS 단일 파일 스타일링 (`src/styles.css`)
- 실행 포트:
  - 프론트 로컬 dev server: `http://localhost:3000`
- 현재 우선 지원 기능:
  - 생활회화 모드
  - 이미지 위 마커 선택
  - 우측 카드 정보 표시
  - 로컬 진도 저장
  - 오디오 재생

## 2. 핵심 제품 요구 및 방향

- 로그인하지 않은 상태에서는 “랜딩페이지”가 첫 화면이어야 한다.
- 로그인한 상태에서는 기존 이미지 중심 홈 화면(학습 진입 랜딩처럼 보이는 화면)이 첫 화면이어야 한다.
- 공지사항/자유게시판 페이지는 백엔드 미구현 상태이므로 일단 빈 페이지와 목차만 제공한다.
- 복습 / 반복학습은 아직 UI 중심 상태이며, 실제 플로우/반복 루프/자동 진행 로직은 미구현이다.

## 3. 현재 구현 상태 요약

### 이미 안정적으로 동작하는 것

- 생활회화 모드의 콘텐츠 조회
- 이미지 natural size + contain 기준 마커 렌더링
- 이미지 위 마커 클릭
- 우측 카드 표시
- 오디오 재생
- 로컬스토리지 기반 진도 저장
- Vercel 배포용 rewrite/proxy 설정

### 아직 미구현 또는 임시 상태인 것

- 백엔드 progress API 연동
- 정식 로그인 세션/JWT 인증
- 네이버/구글 로그인 백엔드 연동
- 게시판 백엔드
- 복습/반복학습 실동작

## 4. 중요한 설계 결론

### 좌표/이미지 렌더링

- 프론트는 마커 좌표를 `naturalWidth/naturalHeight + object-fit: contain` 기준으로 렌더링한다.
- 좌표계 자체를 프론트에서 새로 재보정하는 방식은 근본 해결이 아니다.
- 백엔드가 내려주는 이미지와 좌표 기준 원본 이미지가 달랐던 과거 이슈가 있었고, 프론트는 현재 구조가 맞다.

### 인증 없는 진도 저장

- 현재 백엔드 progress 기능이 완전하지 않아서, 프론트는 진도를 `localStorage`에 저장한다.
- 저장 키:
  - `remember-room-progress`
- 카카오 로그인 상태 관련 로컬 저장 키:
  - `remember-room-authenticated`
  - `remember-room-member`

## 5. 현재 파일별 핵심 역할

- `src/App.tsx`
  - 전체 화면 상태 관리
  - 비로그인 랜딩 / 로그인 후 홈 / 게시판 분기
  - 학습 모드 UI
  - 카카오 로그인 콜백 처리
- `src/api.ts`
  - 백엔드 API 호출
  - 콘텐츠 페이지 응답 정규화
  - 카카오 로그인 URL 요청 / 코드 교환
- `src/types.ts`
  - 콘텐츠, 오디오, 회원, 카카오 응답 타입 정의
- `src/audio.ts`
  - 단일 오디오 재생 유틸
- `src/styles.css`
  - 전체 스타일
- `vite.config.ts`
  - dev server 3000 고정
  - `/api`, `/actuator`, `/local-assets` 프록시
- `vercel.json`
  - Vercel rewrite/proxy 설정

## 6. 브랜딩 변경 사항

과거 UI 문자열 `Remember Room`은 사용자 노출 기준으로 대부분 `기억방 학습기`로 변경되었다.

반영된 것:

- 랜딩/헤더 브랜딩
- 로그인 모달 내부 문구
- `index.html` `<title>`

참고:

- `package.json`의 `"name": "remember-room-fe"` 같은 식별자성 이름은 그대로 남아 있다.
- `localStorage` 키도 기존 영문 키를 그대로 쓴다. 사용자 노출 문자열이 아니므로 유지했다.

## 7. Git / 배포 이력

현재 공개된 주요 커밋:

- `96188e2` Initial frontend deploy setup
- `1b640cc` Add Vercel proxy for backend content
- `5f751a8` Update Vercel proxy target IP
- `b072db4` Update branding and restore login UI

중요:

- 현재 워킹트리에 아직 커밋되지 않은 변경이 있다.
- `git status --short` 기준 변경 파일:
  - `src/App.tsx`
  - `src/api.ts`
  - `src/styles.css`
  - `src/types.ts`

즉, 가장 최근 작업 중 일부는 아직 GitHub `main`에 push되지 않았다.

## 8. 백엔드 현재 계약

### 콘텐츠 서버 정보

- 백엔드 서버 퍼블릭 IP: `13.125.26.1`
- 포트: `80`
- 모드: Spring Boot content-only
- DB 없이 콘텐츠 조회 중심
- 외부 확인된 엔드포인트:
  - `GET http://13.125.26.1/actuator/health` -> `200`
  - `GET http://13.125.26.1/api/content/pages/A000/window?forward=1` -> `200`

### asset URL

백엔드가 내려주는 `imageUrl`, `audioUrl`은 현재 아래 origin 기준이다.

- `http://13.125.26.1/local-assets/images/...`
- `http://13.125.26.1/local-assets/audio/...`

프론트는 이 절대 URL이 백엔드 origin과 일치할 경우, 브라우저/배포 환경에서 `/local-assets/...` 상대경로로 바꿔 same-origin proxy를 타게 만든다.

## 9. Vercel 배포 구조

### Vercel rewrites

현재 `vercel.json` 기준:

- `/api/:path*` -> `http://13.125.26.1/api/:path*`
- `/actuator/:path*` -> `http://13.125.26.1/actuator/:path*`
- `/local-assets/:path*` -> `http://13.125.26.1/local-assets/:path*`
- 나머지 -> `/index.html`

### 이유

- 프론트는 `https://*.vercel.app`
- 백엔드는 `http://13.125.26.1`
- 브라우저가 직접 `http` 백엔드를 부르면 mixed content로 막힌다.
- 그래서 Vercel same-origin rewrite/proxy가 필요하다.

### Vercel 환경변수 원칙

실제 Vercel 배포에서는:

- `VITE_BACKEND_ORIGIN=http://13.125.26.1`
- `VITE_API_BASE_URL`은 넣지 않는 편이 안전하다

이유:

- `VITE_API_BASE_URL`을 넣으면 브라우저가 직접 백엔드를 치는 경로가 열릴 수 있다.
- 현재 설계는 배포 환경에서 same-origin rewrite를 타게 하는 구조다.

## 10. 로컬 개발 구조

### 현재 로컬 실행값

- 프론트: `http://localhost:3000`
- 로컬 백엔드 카카오 로그인 테스트 기준 프록시: `http://localhost:8080`

### 관련 파일

- `.env.local`
  - 현재 값:
    - `VITE_DEV_API_PROXY_TARGET=http://localhost:8080`

### dev proxy 동작

`vite.config.ts`에서 아래 경로를 `VITE_DEV_API_PROXY_TARGET`으로 프록시한다.

- `/api`
- `/actuator`
- `/local-assets`

즉 로컬에서 `http://localhost:3000/api/...`를 호출하면 실제로는 `http://localhost:8080/api/...`로 간다.

## 11. 카카오 로그인 백엔드 계약

백엔드에서 제공한다고 공유된 API:

### 1) 로그인 URL 생성

- `GET /api/auth/kakao/login-url`
- 응답 예:

```json
{
  "loginUrl": "https://kauth.kakao.com/..."
}
```

### 2) 인가코드 교환

- `POST /api/auth/kakao/exchange`
- body:

```json
{
  "code": "인가코드"
}
```

- 응답 예:

```json
{
  "provider": "kakao",
  "providerUserId": "1234567890",
  "member": {
    "id": 1,
    "externalId": "kakao:1234567890",
    "displayName": "홍길동"
  }
}
```

### 백엔드 구현 범위 (공유받은 내용 기준)

- 카카오 OAuth 인가코드 로그인
- 카카오 사용자 조회
- `app_members` upsert
- `externalId = kakao:{kakaoUserId}`
- `displayName` 업데이트
- JWT/세션 발급은 아직 없음

즉 현재는 “회원 식별값 확보” 단계까지다.

## 12. 카카오 로그인 프론트 구현 상태

### 반영된 동작

- 카카오 버튼 클릭 시 `GET /api/auth/kakao/login-url` 호출
- 응답 `loginUrl`로 `window.location.assign(...)`
- `/auth/kakao/callback?code=...` 진입 시 `code` 파싱
- `POST /api/auth/kakao/exchange`
- 성공 시 `member` 저장 + 로그인 상태 전환

### 현재 저장 방식

- 로그인 여부: `remember-room-authenticated`
- member 객체: `remember-room-member`

### 아직 없는 것

- JWT/세션 처리 없음
- 실제 보호 인증 없음
- progress API에 `member.externalId`를 실제로 사용하는 연동은 아직 미완

## 13. 카카오 로그인에서 겪었던 문제와 해결

### 문제 1: `/api/auth/kakao/login-url` 404

증상:

- `http://localhost:3000/api/auth/kakao/login-url` 404

원인:

- 프론트가 잘못된 dev proxy 대상을 보고 있거나
- 로컬 백엔드 `localhost:8080`에 해당 엔드포인트가 안 떠 있음

해결 방향:

- 로컬 카카오 테스트 시 `.env.local`을 `http://localhost:8080`으로 맞춤
- 이 상태에서 404면 백엔드 로컬 라우트/실행상태 문제로 본다

### 문제 2: `/api/auth/kakao/exchange` 502 혹은 재사용 의심

백엔드 공유 내용:

- 카카오 인가코드는 1회용
- 동일 code 재사용 시 실패 가능

프론트에서 실제 위험 요인:

- `src/main.tsx`에서 `React.StrictMode` 사용 중
- dev 환경에서는 effect가 두 번 도는 일이 있음

프론트 수정 내용:

- `src/App.tsx` callback effect에서 code를 읽은 직후 바로:

```ts
window.history.replaceState({}, "", "/");
```

- 즉 URL에서 `?code=...`를 먼저 제거한 뒤 `exchange` 호출
- 효과:
  - 새로고침
  - StrictMode remount
  - 같은 callback URL 재실행
  시 동일 code 재사용 가능성을 크게 줄임

## 14. 현재 UI/플로우 상태

### 비로그인 상태

- 첫 화면은 새 랜딩페이지
- 구성:
  - 제품 설명
  - 학습 방식 안내 카드
  - 공개 구역 섹션
  - `공지/자유게시판` 이동 버튼
  - 로그인 모달

### 로그인 상태

- 첫 화면은 기존 이미지 중심 홈(학습 진입형 랜딩)
- 상단에 홈 / 공지-자유게시판 이동 가능
- 로그아웃 버튼 존재
- 학습 시작 후 기존 학습 화면 진입

### 공지/자유게시판

- 상단 메뉴에서 진입 가능
- 현재는 목차와 빈 placeholder만 있음
- 백엔드 미연동

## 15. 기존 기능 중 유지해야 하는 것

- 이미지 위 0번 마커 제거
- 상단 제목을 `A000` 대신 `pageTitleItem.word`로 표시
- 제목 클릭 시 0번 항목 선택
- 디버그 버튼/오버레이/테이블 제거 유지
- dev server는 3000 포트만 사용
- 이미지 잘림 문제는 `aspect-ratio + object-fit: contain` 기준 유지

## 16. 파일별 중요 로직 메모

### `src/api.ts`

- `RAW_API_BASE_URL`, `API_BASE_URL`, `BACKEND_ORIGIN` 분리
- 배포 환경에서 `https` 페이지가 `http` 백엔드를 직접 치지 않도록 조절
- content API 응답의 absolute asset URL을 same-origin 경로로 변환

### `src/App.tsx`

- 하나의 컴포넌트에 UI 상태가 많이 몰려 있다
- 핵심 상태:
  - `isAuthenticated`
  - `member`
  - `surfaceView`
  - `hasEnteredStudy`
  - `studyMode`
- callback 처리:
  - `window.location.pathname === "/auth/kakao/callback"`

### `src/styles.css`

- 랜딩 / 학습 / 로그인 모달 / 게시판 placeholder 스타일이 한 파일에 공존
- 구조가 커졌기 때문에 향후 페이지 분리 시 CSS도 분리하는 것이 좋다

## 17. 지금 시점의 워킹트리 변경(중요)

현재 Git에 아직 커밋되지 않은 실제 기능 변경:

- 새 랜딩페이지 추가
- 로그인 상태에 따른 첫 화면 분기
- 공지/자유게시판 placeholder 페이지 추가
- 카카오 로그인 프론트 연동 추가
- callback code 재사용 방지 로직 추가

현재 수정 파일:

- `src/App.tsx`
- `src/api.ts`
- `src/styles.css`
- `src/types.ts`

이 변경은 **빌드 통과 상태**까지는 확인되었지만, 아직 커밋/푸시되지 않았다.

## 18. 마지막 확인된 빌드 상태

최근 작업 후 여러 차례 아래 명령은 통과했다.

```bash
npm run build
```

즉 타입/번들 기준으로는 현재 워킹트리 상태가 빌드 가능한 상태다.

## 19. 로컬 확인 URL

- 프론트 dev server: `http://localhost:3000`

카카오 로그인 로컬 테스트 기준:

- redirect URI:
  - `http://localhost:3000/auth/kakao/callback`

## 20. 다음 작업자에게 가장 중요한 체크리스트

### A. 지금 당장 해야 할 가능성이 높은 작업

1. 현재 워킹트리 변경을 검토 후 커밋/푸시
2. 로컬 `localhost:8080` 백엔드에서 `GET /api/auth/kakao/login-url` 실제 응답 확인
3. 카카오 디벨로퍼스 redirect URI가 정확히 `http://localhost:3000/auth/kakao/callback`인지 재확인
4. 카카오 로그인 성공 후 `member.externalId`를 이후 진도 저장에 어떻게 연결할지 설계

### B. 배포 전 확인

1. Vercel env:
   - `VITE_BACKEND_ORIGIN=http://13.125.26.1`
   - `VITE_API_BASE_URL` 미설정 권장
2. `vercel.json` rewrite target이 여전히 현재 EC2 IP인지 확인
3. EC2 public IP가 바뀌지 않았는지 확인

### C. 알려진 함정

1. EC2에 Elastic IP가 없어서 public IP가 바뀔 수 있음
2. dev 환경의 `React.StrictMode` 때문에 OAuth callback은 중복 실행 위험이 있음
3. progress API는 아직 제대로 되지 않아서 프론트는 localStorage 진도 저장을 사용 중
4. 네이버/구글 로그인은 UI만 있고 실제 연동 없음

## 21. 권장 후속 정리 작업

- `src/App.tsx`를 페이지/레이아웃/로그인 콜백 로직으로 분리
- `Progress` 타입과 실제 백엔드 연동 방식 재정의
- 인증 상태를 context 또는 store로 분리
- Vercel/로컬 env 전략을 문서화
- Elastic IP 또는 도메인 도입 전까지 IP 변경 체크 절차 마련

## 22. 현재 프로젝트 절대 경로

```text
/Users/jeongseog-u/VSCode-workspace/remember-room-fe
```

## 23. 요약 한 문장

현재 이 프로젝트는 “콘텐츠 조회와 이미지 기반 학습 화면은 동작하고, 비로그인 랜딩/게시판 placeholder/카카오 로그인 프론트 연동까지 진행된 상태이며, 최신 기능 변경 일부는 아직 워킹트리에만 있고 GitHub main에는 반영되지 않은 상태”다.
