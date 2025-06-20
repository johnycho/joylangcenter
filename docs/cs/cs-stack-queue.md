---
slug: cs-stack-queue
title: 스택(Stack) 자료 구조
tags: [ cs, data-structure, java ]
---

## ✔️ `스택 (Stack)`
후입선출(Last In First Out, 나중에 들어간 값이 먼저 나온다)이라는 개념을 가진 선형 자료구조입니다. 스택 자료구조에서 삭제(pop)는 가장 최상단(top)에서만 이루어집니다. 비어있는 스택에서 값을 추출하려고 시도하는 경우를 `스택 언더플로우`라고 하며, 스택이 넘치는 경우를 `스택 오버플로우`라고 합니다. 대표적인 활용 사례는 스택 메모리, 브라우저 뒤로가기 기능, 언두 기능, 수식 괄호 검사 등이 있습니다.

## ✔️ 자바에서 스택은 어떻게 사용할 수 있을까?
`Stack`이라는 클래스를 사용할 수 있습니다. 하지만, `Deque` 인터페이스 구현체를 사용하는 것이 권장됩니다. 왜냐하면, `Stack` 클래스는 내부적으로 `Vector`를 상속 받고 있기 때문입니다. `Vector`를 상속받은 `Stack`은 인덱스를 통한 접근, 삽입, 제거 등이 실질적으로 가능합니다. 이는 후입선출 특징에 맞지 않기 때문에 개발자가 실수할 여지가 있습니다.

또한, `Vector`의 메소드들은 `synchronized`로 구현되어 있어 멀티 스레드 환경에서는 동기화의 이점이 있으나, 단일 스레드 환경에서는 불필요한 동기화 작업으로 인해 성능 측면에서 좋지 않습니다. 반면에, `Deque` 인터페이스는 후입선출의 특성을 완전히 유지하면서도 동기화 작업을 가지는 구현체와 그렇지 않은 구현체를 선택할 수 있습니다. 이는 개발자가 필요에 따라 동기화 작업의 오버헤드를 회피하고 성능을 최적화할 수 있도록 합니다.

```java
public class Application {
    public static void main(String[] args) {
        Stack<String> stack = new Stack<>();
        stack.push("첫 번째 요소");
        stack.push("두 번째 요소");
        System.out.println(stack.pop());
    }
}   
// 실행 결과
// > Task :Application.main()
// 두 번째 요소
```

## ✔️ `큐 (Queue)`
선입선출(First In First Out, 먼저 들어간 값이 먼저 나온다) 자료구조를 구현한 자바의 인터페이스다. 인덱스로 요소에 접근이 불가능하다.

## ✔️ `Double-Ended Queue (양방향 큐)`
Queue 인터페이스를 확장한 인터페이스다. 자료의 입출력을 양 끝에서 할 수 있다. 인덱스로 요소에 액세스, 삽입, 제거를 허용하지 않는다.

```java
public class Application {
    public static void main(String[] args) {
        Deque<String> deque = new ArrayDeque<>();
        deque.addFirst("첫 번째 요소"); // "첫 번째 요소"
        deque.add("두 번째 요소"); // "첫 번째 요소", "두 번째 요소"
        deque.push("세 번째 요소"); // "세 번째 요소", "첫 번째 요소", "두 번째 요소"
        System.out.println(deque.pop());
        System.out.println(deque.pop());
    }
}
// 실행 결과
// > Task :Application.main()
// 세 번째 요소
// 첫 번째 요소
```
### `Deque` 인터페이스 구현체
- ArrayDeque
- LinkedList