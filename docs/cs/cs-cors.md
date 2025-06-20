---
slug: cs-cors
title: CORS(Cross Origin Resource Sharing)
tags: [ cs, network ]
---

# CORS란?
CORS(Cross Origin Resource Sharing)는 출처가 다른 곳의 리소스를 요청할 때 접근 권한을 부여하는 메커니즘입니다. 리소스를 주고받는 두 곳의 출처가 다르면 출처가 교차한다고 합니다. 이때 출처는 URL뿐만 아니라 프로토콜과 포트까지 포함됩니다. 만약 클라이언트의 출처가 허용되지 않았다면 CORS 에러가 발생할 수 있습니다.

## ✔️ CORS는 왜 필요하지?
과거에는 크로스 사이트 요청 위조(CSRF, Cross-Site Request Forgery) 문제가 있었습니다. 피해자의 브라우저에서 다른 애플리케이션으로 가짜 클라이언트 요청을 전송하는 공격입니다.

CSRF를 예방하기 위해 브라우저는 동일 출처 정책(SOP, same-origin policy)을 구현했습니다. SOP가 구현된 브라우저는 클라이언트와 동일한 출처의 리소스로만 요청을 보낼 수 있습니다.

하지만, SOP는 한계가 있습니다. 현대의 웹 애플리케이션은 다른 출처의 리소스를 사용하는 경우가 많기 때문입니다. 따라서, SOP를 확장한 CORS가 필요합니다.

## ✔️ CORS는 어떻게 작동할까요? 🤔
브라우저가 요청 메시지에 Origin 헤더와 응답 메시지의 Access-Control-Allow-Origin 헤더를 비교해서 CORS를 위반하는지 확인합니다. 이때, Origin에는 현재 요청하는 클라이언트의 출처(프로토콜, 도메인, 포트)가, Access-Control-Allow-Origin은 리소스 요청을 허용하는 출처가 작성됩니다.

이렇게 단순하게 요청하는 것을 **Simple Request**라고 합니다. **Simple Request**은 요청 메서드(GET, POST, HEAD), 수동으로 설정한 요청 헤더(Accept, Accept-Language, Content-Language, Content-Type, Range), Content-Type 헤더(application/x-www-form-urlencoded, multipart/form-data, text/plain)인 경우에만 해당합니다.

브라우저가 사전 요청을 보내는 경우도 있습니다. 이때 사전 요청을 **Preflight Request**라고 합니다. 브라우저가 본 요청을 보내기 이전, **Preflight Request**를 <mark>OPTIONS 메서드</mark>로 요청을 보내어 실제 요청이 안전한지 확인합니다.

**Preflight Request**는 추가로 Access-Control-Request-Method로 실 요청 메서드와, Access-Control-Request-Headers 헤더에 실 요청의 추가 헤더 목록을 담아서 보내야 합니다.

이에 대한 응답은 대응되는 Access-Control-Allow-Methods와 Access-Control-Headers를 보내야 하고, Preflight Request로 인한 추가 요청을 줄이기 위해 캐시 기간을 Access-Control-Max-Age에 담아서 보내야 합니다.

또한 인증된 요청을 사용하는 방식도 있는데요. 이를 **Credential Request**라고 합니다. 쿠키나 토큰과 같은 인증 정보를 포함한 요청은 더욱 안전하게 처리되어야 합니다. 이때 **Credential Request**를 수행합니다.

**Credential Request**를 요청하는 경우에는 서버에서는 Access-Control-Allow-Credentials를 true로 설정해야 하며 Access-Control-Allow-Origin에 와일드카드를 사용하지 못합니다.

---

### ✅ Simple Request란?
Simple Request는 웹 브라우저에서 CORS (Cross-Origin Resource Sharing) 정책에 따라 분류되는 HTTP 요청 유형 중 하나입니다.

➡ 즉, 브라우저가 사전 요청(Preflight Request) 없이 바로 서버에 보내는 요청을 의미합니다.  
➡ 브라우저가 보안을 위해 CORS 정책을 적용할 때, 조건을 만족하면 Preflight 없이 요청을 바로 보낼 수 있음.

### ✅ Simple Request의 조건
CORS 규칙에 따라, 요청이 Simple Request로 인정되려면 다음 조건을 충족해야 합니다.

#### 1️⃣ 허용된 HTTP 메서드만 사용해야 함
- GET
- POST
- HEAD

➡ 이 세 가지 메서드만 사용 가능.  
➡ PUT, DELETE, PATCH 등은 Simple Request가 아니라 Preflight 요청이 필요함.

#### 2️⃣ 허용된 HTTP 헤더만 포함해야 함

Simple Request에서는 다음 헤더만 사용할 수 있음:
- Accept
- Accept-Language
- Content-Language
- Content-Type (application/x-www-form-urlencoded, multipart/form-data, text/plain만 허용됨)

🚨 중요
- Authorization, Custom-Header 같은 사용자 정의 헤더가 포함되면 Simple Request가 아님.
- Content-Type이 application/json이면 Simple Request가 아님! (Preflight 요청 필요)

#### 3️⃣ 요청에 XMLHttpRequest.withCredentials = true가 없어야 함
- 쿠키나 인증 정보를 포함하는 요청은 Simple Request가 아님 (Preflight 요청 필요).

### ✅ Simple Request 예시
📌 (1) Simple Request 예제 - GET 요청
```http request
GET /api/data HTTP/1.1
Host: example.com
Accept: application/json
```
✔ 요청 조건 충족
- 메서드: GET (✅ 허용됨)
- 추가 헤더 없음 (✅ 허용됨)
- 쿠키 없음 (✅ 허용됨)

➡ 이 요청은 Simple Request로 처리됨.

📌 (2) Simple Request 예제 - POST 요청
```http request
POST /api/login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
```
✔ 요청 조건 충족
- 메서드: POST (✅ 허용됨)
- Content-Type: application/x-www-form-urlencoded (✅ 허용됨)

➡ 이 요청도 Simple Request로 처리됨.

✅ Simple Request가 아닌 경우 (Preflight 요청 발생)

❌ (1) Content-Type: application/json 사용
```http request
POST /api/data HTTP/1.1
Host: example.com
Content-Type: application/json
```
🚨 Simple Request 아님! (Preflight 필요)
- Content-Type: application/json은 CORS에서 허용되지 않는 기본 타입이므로 Preflight 요청이 발생함.

❌ (2) Authorization 헤더 포함
```http request
GET /api/data HTTP/1.1
Host: example.com
Authorization: Bearer abc123
```
🚨 Simple Request 아님! (Preflight 필요)
- Authorization 헤더는 Simple Request에서 허용되지 않음.

---

### ✅ Preflight Request란?
**Preflight Request(사전 요청)** 은 CORS (Cross-Origin Resource Sharing) 정책에 의해 발생하는 HTTP 요청입니다.

➡ 브라우저가 보안상의 이유로 실제 요청을 보내기 전에, 서버가 해당 요청을 허용하는지 미리 확인하는 과정입니다.

즉,
- 브라우저가 실제 요청을 보내기 전에 OPTIONS 메서드로 먼저 서버에 허용 여부를 확인함.
- 서버가 “이 요청 허용할게!“라고 응답하면, 그제야 브라우저가 본 요청(Actual Request)을 보냄.

### ✅ Preflight Request가 필요한 경우
📌 아래 조건 중 하나라도 만족하면 Preflight 요청이 발생합니다.

#### 1️⃣ 허용되지 않은 HTTP 메서드 사용
- GET, POST, HEAD 외의 메서드 (PUT, DELETE, PATCH, OPTIONS 등)를 사용할 경우.

📌 예시 (Preflight 요청 발생!)
```http request
DELETE /api/delete-user HTTP/1.1
Host: example.com
```
➡ DELETE는 Simple Request 조건을 만족하지 않음 → Preflight 필요!

#### 2️⃣ 허용되지 않은 헤더 사용
- Authorization, X-Custom-Header, X-Requested-With 등 브라우저가 기본적으로 허용하지 않는 헤더를 포함하면 Preflight 요청 발생.

📌 예시 (Preflight 요청 발생!)
```http request
POST /api/data HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer abc123
```
➡ Authorization 헤더는 기본적으로 허용되지 않음 → Preflight 필요!

#### 3️⃣ 허용되지 않은 Content-Type 사용
- Content-Type이 다음 중 하나가 아니면 Preflight 요청이 발생:
- application/x-www-form-urlencoded
- multipart/form-data
- text/plain

📌 예시 (Preflight 요청 발생!)
```http request
POST /api/data HTTP/1.1
Host: example.com
Content-Type: application/json
```
➡ Content-Type: application/json은 기본 허용되지 않음 → Preflight 필요!

### ✅ Preflight Request의 동작 과정

#### 1️⃣ 브라우저가 OPTIONS 메서드로 Preflight 요청을 보냄
```http request
OPTIONS /api/data HTTP/1.1
Host: example.com
Origin: https://my-frontend.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type
```
➡ 서버에게 “이 요청 해도 돼?“라고 물어보는 단계

#### 2️⃣ 서버가 CORS 설정에 따라 응답
```http request
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://my-frontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 3600
```
✔ Access-Control-Allow-Methods → 서버가 허용하는 HTTP 메서드  
✔ Access-Control-Allow-Headers → 서버가 허용하는 요청 헤더  
✔ Access-Control-Allow-Origin → 특정 Origin에서 요청 허용  
✔ Access-Control-Max-Age → Preflight 결과를 캐시하는 시간 (3600초 = 1시간)

#### 3️⃣ 브라우저가 본 요청(Actual Request) 보냄
✔ 서버가 허용하면 이제야 브라우저가 본 요청을 보낼 수 있음!
```http request
POST /api/data HTTP/1.1
Host: example.com
Origin: https://my-frontend.com
Authorization: Bearer abc123
Content-Type: application/json
```