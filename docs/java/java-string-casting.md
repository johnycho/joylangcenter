---
slug: java-string-casting
title: String 캐스팅 방법 차이
tags: [ java ]
---

## ✔️ `(String) value`
value가 String 타입이 아닌 경우 `ClassCastException`이 발생하며, value가 `null`인 경우 그대로 `null`을 반환하여 이후 메서드를 호출할 때 `NullPointerException`이 발생합니다. 타입 캐스팅은 타입 안정성이 부족하기 때문에 캐스팅하는 타입이 확실할 때만 사용해야 합니다.
```java
Object intValue = 10;
String str1 = (String) intValue; // ClassCastException

Object nullValue = null;
String str2 = (String) nullValue; // null
str2.concat("maeilmail"); // NullPointerException
```

## ✔️ `String.valueOf(value)`
value가 `String` 타입이 아닌 경우 `value.toString()`을 호출하여 `String`으로 변환하며, value가 `null`인 경우 `"null"` 문자열을 반환합니다.
```java
Object intValue = 10;
String str1 = String.valueOf(intValue); // "10"

Object nullValue = null;
String str2 = String.valueOf(nullValue); // "null"
str2.concat("maeilmail"); // "nullmaeilmail"
```
타입 캐스팅에서 발생하는 예외는 런타임 시점에 발생하기 때문에 `String.valueOf()`가 더 안전하고 예외를 방지할 수 있습니다.