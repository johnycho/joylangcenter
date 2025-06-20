---
slug: cs-test-double
title: 테스트 더블 (Test Double)
tags: [ cs, java ]
---

**테스트 더블(Test Double)** 은 테스트 코드에서 실제 객체 대신 사용하는 대체 객체를 의미합니다. 실전에서 사용하는 객체를 테스트 환경에 맞게 “더블”로 바꿔치기해서 테스트를 수행할 수 있도록 도와줍니다.
이는 영화에서 배우 대신 위험한 장면을 수행하는 “스턴트 더블”에서 유래한 표현입니다.

## ✔️ 테스트 더블의 종류에는 무엇이 있을까? 🤔
| 종류   | 목적                         | 실제 구현 여부 | 검증 가능 | 반환값 설정 |
|--------|------------------------------|----------------|------------|--------------|
| Dummy  | 파라미터 채우기만 목적       | ❌             | ❌         | ❌           |
| Fake   | 테스트용 간단한 구현체       | ⭕             | ⭕         | ⭕           |
| Stub   | 고정된 값 반환               | ❌             | ❌         | ⭕           |
| Spy    | 실제 구현 + 호출 감시        | ⭕             | ⭕         | ⭕           |
| Mock   | 기대된 호출 여부 검증        | ❌             | ⭕         | ⭕           |

### 더미 (Dummy)
아무런 동작도 하지 않으며, 단순히 파라미터를 채우기 위해 인스턴스화된 객체만 필요한 경우에 사용합니다.

```java
@Test
void dummyExample() {
    User dummyUser = new User("dummy"); // 실제로 사용하지 않음
    NotificationService service = new NotificationService();

    service.sendWelcomeEmail(dummyUser); // 내부 로직에서 user를 사용하지 않는 경우
}
```

### 스텁 (Stub)
특정 호출에 대해 미리 정해진 값을 반환하도록 설정된 객체로, 테스트에 맞게 단순히 원하는 동작을 수행합니다.

```java
@Test
void stubExample() {
    UserService userService = mock(UserService.class);
    when(userService.getUserName(1L)).thenReturn("Alice"); // Stub 설정

    assertEquals("Alice", userService.getUserName(1L));
}
```

### 페이크 (Fake)
실제 구현 대신, 간단하게 동작하는 객체입니다. (e.g. 메모리 DB)

```java
class FakeUserRepository implements UserRepository {
    private Map<Long, User> store = new HashMap<>();

    @Override
    public void save(User user) {
        store.put(user.getId(), user);
    }

    @Override
    public User findById(Long id) {
        return store.get(id);
    }
}

// 테스트에서 사용
@Test
void fakeExample() {
    UserRepository repo = new FakeUserRepository(); // 진짜 DB 사용 안함
    repo.save(new User(1L, "Alice"));
    assertEquals("Alice", repo.findById(1L).getName());
}
```

### 스파이 (Spy)
스텁(Stub)의 일종으로 호출된 내역(호출 여부나 호출 횟수 등)을 기록하고, 기록한 내용은 테스트 결과를 검증할 때 주로 사용합니다.

```java
@Test
void spyExample() {
    List<String> list = spy(new ArrayList<>());

    list.add("a");
    list.add("b");

    verify(list).add("a");
    verify(list, times(2)).add(anyString());
}
```

### 목 (Mock)
행위에 대한 기대(expectation)를 설정하고 검증하는 객체로, 기대한 것처럼 동작하지 않으면 예외를 발생할 수 있습니다. 목 객체는 스텁이자 스파이기도 합니다.

```java
@Test
void mockExample() {
    EmailService mockEmailService = mock(EmailService.class);
    UserService userService = new UserService(mockEmailService);

    userService.registerUser("user@example.com");

    verify(mockEmailService).sendWelcomeEmail("user@example.com"); // 호출 검증
}
```