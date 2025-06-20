---
slug: cs-jwt
title: JWT (Json Web Token)
tags: [ cs, network ]
---

JWT(Json Web Token) 은 통신 정보를 JSON 형식을 사용하여 안전하게 전송하기 위해 사용됩니다. `JWT`는 토큰 자체에 정보가 포함되어 있는 `Claim` 기반 토큰입니다. 일반적인 애플리케이션에서 `JWT`는 주로 인증과 인가를 구현하기 위해 사용됩니다. `JWT`는 `헤더`, `페이로드`, `시그니처`로 구분됩니다. `헤더`에는 토큰의 암호화 알고리즘이나 타입을 가지며, `페이로드`에는 데이터(만료일, 사용자 정보 등)를 가집니다. `시그니처`는 `헤더`와 `페이로드`가 <mark>**변조되지 않았는지 판단하기 위해 사용**</mark>되는데요. `헤더`와 `페이로드`를 비밀 키를 사용하여 헤더에 명시된 암호화 알고리즘으로 암호화하여 `시그니처`가 만들어집니다.

## ✔️ JWT 구조
JWT는 `Header`, `Payload`, `Signature`의 3 부분으로 이루어지며, JSON 형태인 각 부분은 Base64로 인코딩 되어 표현됩니다. 또한 각각의 부분을 이어 주기 위해 `.` 구분자를 사용하여 구분합니다.

![JWT Structure](img/jwt-structure.png)

### 1) 헤더 (Header)
토큰의 헤더는 두가지 정보(`typ`, `alg`)로 구성됩니다.
`alg`는 헤더(Header)를 암호화 하는 것이 아니고, 서명(Signature)을 해싱하기 위한 알고리즘을 지정합니다.

#### alg
해싱 알고리즘을 지정, 보통 HS256, RSA가 사용되며, 서명(Signature) 및 토큰 검증에 사용합니다.
#### typ
토큰의 타입을 지정합니다.

```json
{ 
   "alg": "HS256",
   "typ": "JWT"
 }
```

### 2) 페이로드 (Payload)
페이로드에는 토큰에서 사용할 정보의 조각들인 클레임(Claim)이 담겨 있습니다.
여기에 담는 정보의 한 ‘조각’ 을 클레임(claim) 이라고 부르고, 클레임(claim)은 `key-value`의 한 쌍으로 이루어져 있습니다.
클레임(claim)은 총 3가지로 나누어지며, 토큰에는 JSON(`key-value) 형태로 여러 개의 클레임(claim)을 넣을 수 있습니다.

#### 2-1) 등록된 클레임 (Registered Claim)
등록된 클레임들은 서비스에서 필요한 정보들이 아닌, 토큰에 대한 정보들을 담기위하여 이름이 이미 정해진 클레임들입니다. 등록된 클레임의 사용은 모두 선택적 (optional)이며, 이에 포함된 클레임 이름들은 다음과 같습니다:

| Claim | 이름                | 설명                                                                |
|-------|---------------------|-------------------------------------------------------------------|
| `iss` | Issuer              | 토큰 발급자(issuer)                                                    |
| `sub` | Subject             | 토큰 제목(subject)                                                    |
| `aud` | Audience            | 토큰 대상자(audience)                                                  |
| `exp` | Expiration          | 토큰 만료 시간(expiration), NumericDate 형식으로 되어 있어야 함 ex) 1480849147370 |
| `nbf` | Not Before          | 토큰 활성 날짜(not before), 이 날이 지나기 전의 토큰은 활성화되지 않음                    |
| `iat` | Issued At           | 토큰 발급 시간(issued at), 토큰 발급 이후의 경과 시간을 알 수 있음                      |
| `jti` | JWT ID              | 토큰 고유 식별자(JWT ID), 중복 방지를 위해 사용하며, 일회용 토큰(Access Token) 등에 사용     |

#### 2-2) 공개 클레임 (Public Claim)
공개 클레임은 사용자 정의 클레임으로, 공개용 정보를 위해 사용됩니다.
공개 클레임들은 충돌이 방지된 (collision-resistant) 이름을 가지고 있어야 합니다.

#### ❗️Public Claim 충돌 시의 문제점
| 문제 유형       | 설명 |
|----------------|------|
| 🔄 의미 불일치  | 서로 다른 시스템이 동일한 클레임 이름을 **다른 의미로 해석**할 수 있음 |
| 🔒 보안 리스크  | 공격자가 의도적으로 충돌되는 클레임을 삽입하여 **권한 우회**를 시도할 수 있음 |
| 🐞 디버깅 어려움 | 클레임 충돌로 인한 문제가 발생해도, **문제를 추적하고 파악하기가 어려움** |

#### 🧨 충돌 예시
| 시스템          | "role" 클레임 해석                                 |
|--------------|-----------------------------------------------|
| A (내부 서비스)   | 서로 다른 시스템이 동일한 클레임 이름을 **다른 의미로 해석**할 수 있음    |
| B (외부 인증 서버) | 공격자가 의도적으로 충돌되는 클레임을 삽입하여 **권한 우회**를 시도할 수 있음 |

👉🏻 이럴 경우, 의미는 다르지만 이름과 값이 일치해서 혼동 발생  
👉🏻 내부 시스템은 외부에서 온 "admin"을 최고 권한으로 오해하고 권한 과다 부여

충돌을 방지하기 위해서는,
* 클레임 이름을 URI 형식으로 짓거나,
```json
{
  "https://johnycho.com/claims/department": "finance",
  "https://johnycho.com/claims/role": "admin"
}
```
* [IANA](https://www.iana.org/assignments/jwt/jwt.xhtml)에 공식 등록된 public claim 이름만 사용합니다.  
👉🏻 위의 충돌 예시의 방지 대책으로 공식 클레임인 `roles`(principal(자신이 누구라고 주장하는 주체)이 보유한 role(역할) 목록)을 사용

#### 2-3) 비공개 클레임 (Private Claim)
비공개 클레임은 사용자 정의 클레임으로, 서버와 클라이언트 사이에 임의로 지정한 정보를 저장합니다. 외부에 공개되도 상관없지만 해당 유저를 특정할 수 있는 정보들을 담습니다.
```json
{
    "username": "johny"
}
```

### 3) 서명 (Signature)
서명(Signature)은 토큰을 인코딩하거나 유효성 검증을 할 때 사용하는 고유한 암호화 코드이다. 서명(Signature)은 위에서 만든 헤더(Header)와 페이로드(Payload)의 값을 각각 BASE64로 인코딩하고, 인코딩한 값을 비밀 키를 이용해 헤더(Header)에서 정의한 알고리즘(`alg`)으로 해싱을 하고, 이 값을 다시 BASE64로 인코딩하여 생성한다.

#### 3-1) 서명 (Signature) 생성 과정
1.	헤더(JSON)를 `Base64Url` 인코딩
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

2.	페이로드(JSON)를 `Base64Url` 인코딩
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```
> eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ

3.	인코딩된 헤더와 인코딩된 페이로드를 .(점)으로 이어붙임.
```text
<Base64Url(Header)> + "." + <Base64Url(Payload)>
```
> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ

4.	위 문자열을 비밀 키와 함께 지정된 알고리즘(HMAC-SHA256 등)으로 해싱
```text
HMACSHA256(
  data = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
  key = "your-256-bit-secret"
)
```
> 49f94ac7044948c78a285d904f87f0a4c7897f7e8f3a4eb2255fda750b2cc397

👉🏻 SHA-256은 항상 256비트 길이의 해시 값을 출력  
👉🏻 HMAC-SHA256 결과 = 256비트 = 32(256 ÷ 8)바이트 = 16진수 64글자(16진수 1글자: 2바이트 x 32바이트)

5.	나온 해시 값을 `Base64Url`로 다시 인코딩 → 이게 서명(Signature)
> SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

## ✔️ JWT 전달 방법
`JWT`는 일반적으로 <mark>**HTTP 요청의 인증 정보(Access Token)**</mark>로 사용되며, 다음과 같은 방식으로 서버에 전달됩니다.

### 1) Authorization 헤더 사용
```http request
GET /api/user
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```
👉🏻 Bearer는 토큰 유형을 나타냄 (기본 스펙)  
👉🏻 OAuth2, OpenID Connect에서도 이 방식을 따릅니다

### 2) 쿠키에 포함
```http request
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c; HttpOnly; Secure; SameSite=Strict
```
👉🏻 클라이언트가 다음 요청 시 자동으로 쿠키를 보냄  
👉🏻 서버는 Cookie 헤더에서 `JWT` 추출

#### ⚠️ 단점
<mark>**브라우저 보안 정책상 다른 도메인(origin)으로 요청할 때, 쿠키는 기본적으로 포함되지 않기 때문**</mark>에 CSRF 대응이 필요합니다. (→ SameSite + CSRF Token 같이 써야 함)

### 3) 쿼리 스트링 방식
```http request
GET /api/user?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```
❗️URL이 로그에 남거나 공유될 수 있고, 링크 클릭 시 Referer 헤더를 통해 외부로 노출될 위험이 있기 때문에 일반적으로 권장되지 않습니다.

## ✔️ JWT 장점 / 주의 사항
`JWT`를 사용하여 인가를 구현하는 경우, 클레임 기반 토큰의 특성 덕분에 세션 기반 인증에 비해서 사용자 정보를 조회하기 위한 추가적인 작업이 필요하지 않습니다. 또한, 서버가 상태를 관리하지 않기 때문에 서버가 이중화된 환경에서도 사용자의 로그인 정보를 일관성 있게 관리할 수 있습니다. (<mark>**세션 불일치 문제**</mark>가 발생하지 않습니다.)

하지만 `JWT`를 사용하는 경우, 몇 가지 주의 사항이 존재합니다.

* `JWT`는 디코딩이 쉽습니다. Base64로 디코딩하면 페이로드를 확인할 수 있습니다. 따라서, 민감한 정보를 담는 것에 유의해야 합니다.
* 시크릿 키의 복잡도가 낮은 경우, 무작위 대입 공격(Brute force Attack)에 노출될 수 있습니다. 따라서, 강력한 시크릿 키를 사용하는 것이 권장됩니다.
* 시크릿 키는 유출되면 안되기 때문에 안전한 공간에 관리해야합니다.
* `JWT` 탈취에 유의해야 합니다. 이를 위해서 `JWT` 저장 공간, 리프레시 토큰 도입 여부, Refresh Token Rotation, 탈취 감지 및 대응에 대해서 고민이 필요합니다.
* <mark>**토큰의 잦은 갱신이 사용자 경험을 저해하는지 고려**</mark>해야 합니다. 예를 들어, 사용자가 게시글을 3시간 동안 작성하고 제출했지만 `JWT`가 만료되어 사용자가 작성한 글은 사라질 수 있습니다. 이를 해결하기 위해서 <mark>**슬라이딩 세션**</mark>과 같은 전략을 고민해 볼 수 있습니다.
* <mark>**`JWT` none 알고리즘 공격을 유의**</mark>해야 합니다. 공격자가 토큰의 헤더에 명시된 알고리즘을 none으로 변경하여, 페이로드가 변조되어도 시그니처 검증을 우회할 수 있습니다. 이를 해결하기 위해서 <mark>**none 알고리즘 공격을 예방한 라이브러리**</mark>(`ex) jjwt(io.jsonwebtoken)`)를 사용하거나, none 알고리즘과 같이 약한 알고리즘에 대해서 필터링하는 등 주의가 필요합니다.