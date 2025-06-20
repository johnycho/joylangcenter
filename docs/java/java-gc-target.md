---
slug: java-gc-target
title: JVM에서 GC 대상 객체를 판단하는 기준
tags: [ java ]
---

`GC(Garbage Collection)`는 자바의 메모리 관리 방법의 하나이며, `JVM`의 힙 영역에서 동적으로 할당했던 메모리 중에서 필요 없어진 객체를 주기적으로 제거하는 것을 의미합니다. `GC`는 특정 객체가 사용 중인지 아닌지 판단하기 위해서 <mark>**도달 가능성(Reachability)**</mark> 라는 개념을 사용하는데요. 특정 객체에 대한 참조가 존재하면 도달할 수 있으며, 참조가 존재하지 않는 경우에 도달할 수 없는 상태로 간주합니다. 이때, <mark>**도달할 수 없다는 결론을 내린다면 해당 객체는 `GC`의 대상**</mark>이 됩니다.

## ✔️ 도달 가능성은 어떻게 판단할까? 🤔
힙 영역에 있는 객체에 대한 참조는 4가지 케이스가 존재합니다.

### 1) 힙 내부 객체 간의 참조
힙에 있는 객체 A가 또 다른 객체 B를 내부 필드로 참조하는 경우
```java
class Engine {
    String model = "V8";
}

class Car {
    Engine engine = new Engine(); // 👉 힙 안의 Car가 또 다른 힙 객체 Engine을 참조
}
```
* `Car` 객체와 `Engine` 객체는 둘 다 힙에 생성됨
* `Car` 객체 내부의 `engine` 필드는 다른 힙 객체(`Engine`) 를 참조

### 2) 스택 영역의 변수에 의한 참조
메서드 안의 지역 변수가 힙 객체를 참조하는 경우
```java
public class Main {
    public static void main(String[] args) {
        Car car = new Car(); // 👉 스택 영역의 지역변수 car가 힙 객체를 참조
    }
}
```
* `car` 변수는 `main` 메서드의 스택 프레임에 위치
* 실제 `Car` 객체는 힙에 생성됨 → `car`는 힙 객체를 참조

### 3) JNI에 의해 생성된 객체에 대한 참조(네이티브 스택 영역)
C/C++ 같은 네이티브 코드에서 Java 객체를 참조할 수 있음
```java
public class NativeExample {
    public native void nativeMethod(MyObject obj);

    public static void main(String[] args) {
        MyObject obj = new MyObject();
        new NativeExample().nativeMethod(obj); // 👉 JNI에서 obj를 참조
    }

    static {
        System.loadLibrary("native-lib"); // C에서 obj 접근 가능
    }
}
```
```c
// native-lib.c (JNI C 코드)
JNIEXPORT void JNICALL Java_NativeExample_nativeMethod(JNIEnv *env, jobject thisObj, jobject obj) {
    // obj는 Java 힙 객체를 참조 → JNI Global/Local Reference
}
```
* C 코드에서 넘어온 `jobject`는 `JVM` 힙 객체를 참조함
* 이건 `JNI Local/Global Reference`로 `Root Set`에 포함됨

### 4) 메서드 영역의 정적 변수에 의한 참조
static 변수는 클래스가 로딩될 때 메서드 영역에 올라가며, 힙 객체를 참조할 수 있음
```java
class MyClass {
    static Car SHARED_CAR = new Car(); // 👉 메서드 영역의 static 필드가 힙 객체 참조
}
```
* `MyClass` 클래스는 클래스 로딩 시 메서드 영역에 로드됨
* `SHARED_CAR`는 `static` 이므로 `메서드 영역(Class Metadata)`에 존재
* `new Car()`는 힙에 생성됨 → `static` 필드가 참조 (`GC Root`로 부터 참조됨)

📌 `1) 힙 내부 객체 간의 참조`를 제외한 나머지를 <mark>**`Root Set`(현재 살아있는 객체인지 여부를 판단하기 위해, 가비지 컬렉터가 탐색을 시작하는 루트 객체들의 집합)**</mark>이라고 합니다.

`Root Set`으로부터 시작한 참조 사슬에 속한 객체들은 도달할 수 있는 객체이며, 이 참조 사슬과 무관한 객체들은 도달하기 어렵기 때문에 `GC` 대상이 됩니다.

## ✔️ 개발자가 `GC` 대상 판단에 관여할 수는 없을까? 🤔
```java
Origin o = new Origin();
WeakReference<Origin> wo = new WeakReference<>(o);
```
자바에서는 `java.lang.ref` 패키지의 `SoftReference`, `WeakReference` 클래스를 통해 개발자가 `GC` 대상 판단에 일정 부분 관여할 수 있습니다. 해당 클래스들의 객체(reference object)는 원본 객체(referent)를 감싸서 생성하는데요. 이렇게 생성된 객체는 `GC`가 특별하게 취급합니다. `SoftReference` 객체에 감싸인 객체는 `Root Set`으로부터 참조가 없는 경우에, 남아있는 힙 메모리의 크기에 따라서 `GC` 여부가 결정됩니다. 반면, `WeakReference` 객체에 감싸인 객체는 `Root Set`으로부터 참조가 없는 경우, 바로 `GC` 대상이 됩니다.