E 커머스 쇼핑몰


# 계좌 어플리케이션
<br>

---


## 프로젝트 소개

토스와 같은 계좌 어플리케이션입니다. 

해당 프로젝트를 통하여 트랜잭션이 오가는 상황에서의 데이터 처리와 데이터베이스 관리, 계좌 잔액의 데이터 리슨(Listen)을 통한 실시간 업데이트를 공부했습니다.

그리고 모바일 어플리케이션을 겨냥하여 UI 를 구성하였습니다.

---
## 개발자 소개

<br>

* 안상문 : 프론트엔드, 백엔드

<br>

## 기술 스택


### Development

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Context-API](https://img.shields.io/badge/Context--Api-000000?style=for-the-badge&logo=react)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white) <br>
![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)
![Styled Components](https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white)


### Enviornment

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)


### Config

![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)

<br>

## 주요 기능

1. 계좌 및 카드 신청
2. 거래내역 확인
3. 입출금 및 이체
4. 분석
5. 신용점수 확인

<br>

# 실행 결과

<img width="200" alt="화면 캡처 2025-06-02 213821" src="https://github.com/user-attachments/assets/2f4a7119-8bc6-4229-b3a7-880e2e9dba7a" />
<img width="200" alt="화면 캡처 2025-06-02 213821" src="https://github.com/user-attachments/assets/d6a9e259-6bf3-4788-adbe-efe8b6c90796" />
<img width="200" alt="화면 캡처 2025-06-02 213821" src="https://github.com/user-attachments/assets/014dbd16-c0a4-4502-a38c-b17e4570aeef" />
<img width="200" alt="화면 캡처 2025-06-02 213821" src="https://github.com/user-attachments/assets/1fb0925c-45ec-469f-9bd0-f1f7e60cdd8b" />

<br>

배포 : https://webtoon-web-service-renew.vercel.app/

로그인은 직접 Google Oauth 를 통하시면 되며, 시험용 계좌 : 1746128790915 / 1746282153766

1746128790915 : 이름/안상문
1746282153766 : 이름/김철수

<br>

## 개선점

#### 메인 페이지의 굉장히 큰 LCP 지표.
1. 해당 홈 의 LCP 가 굉장히 크게 나왔습니다. 사실 어플리케이션 특성상 홈에 기능이 모여있긴 했지만 예상보다 더 큰 결과였습니다.
2. 홈은 서버 컴포넌트인데, Next.js SSR의 이점을 버리는게 훨씬 이득이었기에 홈에 있는 모든 컴포넌트를 클라이언트 컴포넌트로 분리하여 스플리팅을 하였습니다.
3. page.tsx의 용량이 `7.2 MB` 에서 `2.1 MB` 까지 줄었으며, `LCP` 를 `4.2` 에서 `2.4`까지 줄이는데 성공했습니다.

#### Firebase 참조에서 데이터 복제로 변경
1. 유저 컬렉션에 존재하는 하위 컬렉션인 트랜잭션의 경우 트랜잭션 컬렉션의 `ID` 를 그대로 받아서 참조로 저장했습니다.
2. 하지만 이렇게 될 경우 하위 컬렉션을 받아와서 또 추가로 받아온 참조들을 이용하여 fetch 하는 방법말고는 없었습니다. _(Sanity 에서는 이것을 쿼리 한 줄로도 해결할 수 있었는데 아쉬웠습니다.))_
3. NoSQL 은 원래가 데이터 복제를 권장하는 방식으로 만들어졌고, 쿼리의 수를 줄이는 것이 성능에 가장 큰 영향을 준다는 것을 알게 됐습니다.
4. RDB 처럼 만들려했던 것이 패착으로, NoSQL 본연의 방식대로 데이터 복제로 바꿔 참조 대신 트랜잭션 데이터 그 자체를 하위 컬렉션에 추가했습니다.
5. 10개의 트랜잭션을 가져오는 기준 `280ms -> 132ms` 로 개선하였습니다.

#### CLS 개선
1. 홈에 기능들을 집약했기 때문에 단순히 로딩 스피너 만으로는 `CLS` 값을 개선할 수 없었습니다.
2. 그래서 스켈레톤 UI 를 만들어 `CLS` 값을 `0.32`에서 `0.03` 으로 개선하였습니다.

#### 보안 추가
1. 계좌 생성시 전달하는 정보를 AES + RSA 암호화.

<br>

## 후기


