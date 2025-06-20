---
slug: cs-functional-programming
title: 함수형 프로그래밍 (Functional Programming)
tags: [ cs ]
---

# 함수형 프로그래밍 (Functional Programming) 이란?
객체지향 패러다임과 마찬가지로 하나의 프로그래밍 패러다임으로서,
수학적 함수 개념을 기반으로 하며, 상태(데이터) 변경 없이 부수효과 없는 순수 함수들로 로직을 구성하는 프로그래밍 스타일입니다.

객체지향 프로그래밍은 움직이는 부분을 캡슐화하여 코드의 이해를 도우며, 함수형 프로그래밍은 움직이는 부분을 최소화하여 코드 이해를 돕습니다. 이 둘은 상충하는 개념이 아니며, 함께 조화되어 사용될 수 있습니다. 함수를 합성하여 복잡한 프로그램을 쉽게 만들고, 부수 효과를 공통적인 방법으로 추상화하는 것이 함수형 프로그래밍의 핵심 개념입니다.

## ✔️ 부수 효과 (Side Effect)
값을 반환하는 것 이외에 부수적으로 발생하는 일들을 의미합니다. 함수 외부의 변수를 수정하거나, I/O 작업 등이 해당됩니다. 사람이 한 번에 인지할 수 있는 작업은 한정되어 있습니다. 부수 효과가 많은 코드는 이해하고 결과를 예측하기 어려울 수 있습니다. 함수형 프로그래밍은 부수 효과를 추상화하고 분리하여 코드를 이해하기 쉽게 만들 수 있습니다.

함수형 프로그래밍은 함수를 합성하여 복잡한 프로그램을 쉽게 만듭니다. 함수는 입력이 들어오면 부수 효과의 발생과 함께 결과를 반환할 수 있습니다. 하지만, 부수 효과가 존재하는 함수는 합성하기가 까다롭습니다.

### 1) 전역 변수 변경
```java
public class Counter {
  private int count = 0;

  public void increment() {
    count++; // 🔥 외부 상태(count 필드)를 변경 → 부수효과 있음
  }

  public int getCount() {
    return count;
  }
}
```
increment()는 외부 상태(count)를 바꾸므로 부수효과가 있음

### 2) 콘솔 출력 (I/O)
```java
public void printMessage(String msg) {
    System.out.println(msg); // 🔥 콘솔 출력은 외부 환경에 영향 → 부수효과 있음
}
```

### 3) 현재 시간 사용 (외부 의존)
```java
public String getTimeGreeting() {
    int hour = LocalTime.now().getHour(); // 🔥 현재 시간에 의존 → 외부 상태 의존
    return hour < 12 ? "Good morning" : "Good afternoon";
}
```
시간은 매번 바뀌므로 동일한 입력에도 결과가 달라질 수 있음

### 4) 랜덤 값 사용
```java
public int rollDice() {
    return new Random().nextInt(6) + 1; // 🔥 랜덤성 → 예측 불가능 → 부수효과 있음
}
```

## ✔️ 순수 함수 (Pure Function)
같은 입력이 들어오면, 항상 같은 값을 반환하는 함수를 의미합니다. 순수 함수는 부수효과를 일으키지 않습니다. 함수형 프로그래밍에서 함수 합성은 순수 함수로 이뤄집니다.

```java
class FunctionCompositionTest {

    @Test
    @DisplayName("함수 합성")
    void fp() {
        System.out.println(sum()); 
        System.out.println(factorial(10));
    }

    // 1부터 100까지의 합
    private int sum() {
        return loop((a, b) -> a + b, 0, range(1, 100));
    }

    // 팩토리얼
    private int factorial(int n) {
        return loop((a, b) -> a * b, 1, range(1, n));
    }

    private int loop(BiFunction<Integer, Integer, Integer> fn, int sum, Queue<Integer> queue) {
        if (queue.isEmpty()) {
            return sum;
        }

        return loop(fn, fn.apply(sum, queue.poll()), queue);
    }

    private Queue<Integer> range(Integer start, Integer to) {
        return IntStream.rangeClosed(start, to)
                .boxed()
                .collect(Collectors.toCollection(LinkedList::new));
    }
}
```