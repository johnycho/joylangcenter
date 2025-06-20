---
slug: spring-transaction-propagation
title: Spring 트랜잭션 전파 (Transaction Propagation)
tags: [ spring ]
---

스프링에서 **트랜잭션 전파(Transaction Propagation)** 는 트랜잭션의 경계에서 이미 진행 중인 트랜잭션이 있을 때 또는 없을 때 어떻게 동작할 것인가를 결정하는 기능입니다. 가령, `@Transactional` 어노테이션이 존재하는 메서드를 호출했을 때, 기존에 트랜잭션이 존재하면 재사용할지, 예외를 던질지 등 행동을 결정할 수 있습니다.

트랜잭션 전파 속성에는 `REQUIRED`, `REQUIRED_NEW`, `MANDATORY`, `SUPPORTS`, `NOT_SUPPORTED`, `NESTED`, `NEVER`가 존재하며, `@Transactional` 어노테이션의 `propagation` 속성에 값을 설정할 수 있습니다.

## ✔️ REQUIRED - 기본 값
트랜잭션이 존재하는 경우 해당 트랜잭션 사용하고, 트랜잭션이 없는 경우 트랜잭션을 생성합니다.

```java
package org.springframework.transaction.annotation;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@Reflective
public @interface Transactional {
  Propagation propagation() default Propagation.REQUIRED;
}
```

## ✔️ REQUIRED_NEW
트랜잭션이 존재하는 경우 트랜잭션을 잠시 보류시키고, 신규 트랜잭션을 생성하여 사용합니다.

## ✔️ MANDATORY
트랜잭션이 반드시 있어야 합니다. 트랜잭션이 없다면, 예외가 발생합니다. 만약, 트랜잭션이 존재한다면 해당 트랜잭션을 사용합니다.

## ✔️ SUPPORTS
트랜잭션이 존재하는 경우 트랜잭션을 사용하고, 트랜잭션이 없다면 트랜잭션 없이 실행합니다.

## ✔️ NOT_SUPPORTED
트랜잭션이 존재하는 경우 트랜잭션을 잠시 보류하고, 트랜잭션이 없는 상태로 처리합니다.

## ✔️ NESTED
트랜잭션이 있다면 SAVEPOINT를 남기고 중첩 트랜잭션을 시작합니다. 만약 없는 경우에는 새로운 트랜잭션을 시작합니다.

## ✔️ NEVER
트랜잭션이 존재하는 경우 예외를 발생시키고, 트랜잭션이 없다면 생성하지 않습니다.
