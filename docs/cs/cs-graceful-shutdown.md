---
slug: cs-graceful-shutdown
title: Graceful Shutdown (우아한 종료)
tags: [ cs, spring ]
---

## ✔️ `Graceful Shutdown` (우아한 종료)
애플리케이션이 종료될 때 바로 종료하는 것이 아니라, 현재 처리하고 있는 작업을 마무리하고 리소스를 정리한 이후 종료하는 방식을 의미합니다. 서버 애플리케이션에서 일반적인 `Graceful Shutdown`은 `SIGTERM` 신호를 받았을 때, 새로운 요청은 차단하고 기존 처리 중인 요청을 모두 완료한 뒤에 프로세스를 종료합니다. 만약, 서버 애플리케이션이 요청을 처리하는 중에 즉각적으로 애플리케이션을 종료한다면 트랜잭션 비정상 종료, 데이터 손실, 사용자 경험 저하 문제가 발생할 수 있습니다.

## ✔️ `SIGTERM`과 `SIGKILL`의 차이점
`SIGTERM`과 `SIGKILL`은 유닉스 및 리눅스 운영체제에서 사용되는 프로세스 종료 시그널입니다. 그 중에서 `SIGKILL`은 프로세스를 강제 종료하는 신호입니다. 프로세스가 종료하기 이전에 수행되어야 하는 절차들을 실행하지 않고 즉시 종료합니다. 반면, `SIGTERM`은 프로세스가 해당 시그널을 핸들링할 수 있습니다. 따라서, 프로세스가 종료하기 이전에 수행되어야 하는 절차들을 안전하게 수행할 수 있습니다.

## ✔️ Spring 환경에서 `Graceful Shutdown` 설정
```properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s // 타임 아웃
```
스프링에서는 Graceful Shutdown 설정을 지원해 줍니다. 단, 한 가지 유의해야 할 부분이 있는데요. 기존 처리 중인 요청에서 <mark>**데드락이나 무한 루프가 발생하면 프로세스가 종료되지 않을 수 있습니다.**</mark> 스프링은 이러한 상황을 예방하기 위해서 타임아웃 설정을 지원합니다. 위 예시에서 기존 진행 중인 작업들의 완료가 20초를 넘기는 경우 프로세스를 바로 종료합니다.

### `spring.lifecycle.timeout-per-shutdown-phase`
각 종료 단계마다 기다릴 최대 시간을 제한하고, 그 시간 내에 안 끝나면 강제 종료를 진행합니다.

## ✔️ Spring 환경에서 `Graceful Shutdown` 과정
Spring 애플리케이션 종료 시 다음과 같은 `Graceful Shutdown(우아한 종료)` 과정을 수행합니다:
1.	컨테이너는 ContextClosedEvent 발생
2.	`SmartLifecycle`을 구현한 Bean들이 역순으로 `stop()` 호출
3.	`DisposableBean.destroy()` or `@PreDestroy` 메서드 실행
4.	각 phase마다 `timeout-per-shutdown-phase` 동안 정상 종료를 기다림