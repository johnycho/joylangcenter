---
slug: spring-dependency-injection
title: 의존성 주입 (Dependency Injection)
tags: [ spring, java ]
---

A 객체가 어떤 작업을 수행하기 위해 B 객체를 필요로 하는 경우에 두 객체 사이에 의존성이 존재한다고 표현합니다. 이때, A 객체가 아닌 외부의 C 객체가 B를 생성한 뒤에 이를 전달해서 의존성을 해결하는 방법을 의존성 주입(Dependency Injection) 이라고 합니다.

유연하고 재사용할 수 있는 설계를 만들기 위해서는 코드의 변경 없이 다양한 실행 구조를 만들 수 있어야 합니다. 의존성 주입은 이를 돕습니다. 예를 들어, A 객체 내부에서 B를 직접 생성하는 경우에는 B에 대한 결합도가 높아집니다. 반면, B에 대한 생성 책임을 C에게 위임하고, C가 A에게 다시 전달해 주는 방식(의존성 주입)을 통해서 A는 B에 대한 결합도를 낮추고 유연한 설계를 만들 수 있습니다.

## ✔️ 생성자 주입 (Constructor Injection)
```java
@Service
public class OrderService {
    private final OrderRepository repo;

    @Autowired
    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }
}
```
### ✅ 생성자 주입을 권장하는 이유
| 이유                           | 설명                                                                 |
|------------------------------|----------------------------------------------------------------------|
| 불변성 보장 (`final`)             | 생성자에서 초기화된 필드는 `final`로 선언 가능 → 이후 변경 불가       |
| <mark>**필수 의존성 강제**</mark>                    | 의존성 누락 시 컴파일 또는 실행 시점에 즉시 오류 → 안정성 높음        |
| <mark>**순환 참조 조기 감지**</mark> | 객체 생성 시점에서 순환 의존성 발견 가능 → 런타임 오류 예방           |
| 테스트 용이성                      | 생성자 파라미터로 Mock 객체를 쉽게 주입 가능 → 단위 테스트 간편       |
| 명확한 의존성 명시                   | 생성자 시그니처만 봐도 어떤 의존성이 필요한지 명확히 드러남          |
| DI 프레임워크 의존도 낮음              | 순수 Java에서도 생성자 주입만으로 객체 구성 가능 → POJO 지향          |

## ✔️ 필드 주입 (Field Injection)
```java
@Service
public class OrderService {
    @Autowired
    private OrderRepository repo;
}
```
필드 주입은 접근 제어자에 제한 없이 동작하지만, 객체의 캡슐화와 안정성 확보를 위해 `private`을 쓰는 것이 권장됩니다.  
`final` 필드는 생성자에서만 초기화할 수 있고, 필드 주입은 객체가 생성된 이후 리플렉션으로 값을 주입하기 때문에 필드 주입은 `final`을 사용할 수 없습니다.
### ✅ 필드 주입을 권장하지 않는 이유
| 이유               | 설명                                             |
|--------------------|------------------------------------------------|
| 테스트 어려움      | 필드가 `private`이면 Mock 주입 시 리플렉션이 필요 → 테스트 코드 복잡 |
| 불변성 보장 불가    | `final` 사용 불가 → 런타임 중 필드 값 변경 가능성              |
| 명시적 의존성 표현 부족 | 생성자나 세터 없이 내부에서 갑자기 주입되므로 구조 파악이 어려움           |
| 의존성 누락 발견 지연 | 필드에 주입이 누락되어도 컴파일 타임에 오류 없음 → 런타임까지 오류 모름      |
| 프레임워크 강결합    | Spring 등의 DI 컨테이너 없이는 객체를 직접 생성할 수 없음          |

## ✔️ 메서드 주입 (Method Injection)
특정 메서드 호출 시점에 동적으로 의존성 주입을 받도록 하는 방식  
일반적으로 **지연 주입(lazy injection)** 이나 **동적 주입**이 필요한 경우 사용
```java
@Component
public class ExampleService {

    @Autowired
    public void init(MyDependency dep) {
        this.dep = dep;
    }
}
```

## ✔️ setter 주입 (Setter Injection)
객체 생성후 초기화(by 스프링 컨테이너) 시점에 1회 실행
```java
@Service
public class OrderService {
  private OrderRepository repo;

  @Autowired
  public void setRepo(OrderRepository repo) {
    this.repo = repo;
  }
}
```
### ✅ setter 주입을 권장하지 않는 이유
| 단점               | 설명                                                                 |
|--------------------|----------------------------------------------------------------------|
| 의존성 누락 허용     | 세터는 선택적 주입처럼 작동 → 주입 안 해도 컴파일/런타임 오류 없음      |
| 객체가 불완전한 상태로 생성 가능 | 의존성이 없는 상태로도 인스턴스화 가능 → NullPointerException 위험      |
| 불변성 위배        | 세터는 외부에서 주입값 변경 가능 → 객체의 상태가 변경될 수 있음        |
| 테스트 복잡성 증가    | 세터 호출 누락 시 테스트 실패 발생 가능 → 테스트 신뢰성 저하            |
| 캡슐화 약화        | 외부에서 의존성을 변경할 수 있으므로 객체 보호 약화                     |