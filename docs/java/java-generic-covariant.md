---
slug: java-generic-covariant
title: 제네릭의 공변, 반공변, 무공변
tags: [ java ]
---

## ✔️ 무공변 (Invariant)
자바에서 <mark>**제네릭(Generic)은 기본적으로 무공변(Invariant)**</mark> 입니다. 무공변이란 타입 `S`, `T`가 있을 때 서로 관계가 없다는 것을 의미합니다. `S`와 `T`가 서로 상속 관계이면 공변성이 있지만 <mark>**제네릭은 상속 관계가 호환되지 않습니다.**</mark> 따라서 타입이 정확히 일치하지 않으면 컴파일 에러가 발생합니다.
```java
public class Animal {
}

public class Cat extends Animal {
}

List<Animal> animals = new ArrayList<Cat>(); // ❌ 컴파일 에러
List<Cat> cats = new ArrayList<Animal>();    // ❌ 컴파일 에러
```
자바에서 `List<T>`는 **제네릭 타입(Generic Type)** 입니다. 여기서 `T`는 타입 매개변수이고, 컴파일 시점에 구체 타입(`Animal`, `Cat` 등)으로 치환됩니다.

`List<Cat>`은 **`Cat` 타입 요소만 담을 수 있는 리스트**를 의미하며, `List<Animal>`은 **`Animal` 또는 그 하위 타입 요소를 담을 수 있는 리스트**를 의미합니다. 이 둘은 <mark>**타입 매개변수만 다를 뿐 동일한 제네릭 타입 (`List`)의 인스턴스**</mark>입니다.

자바 제네릭은 기본적으로 무공변입니다. 즉, `Cat`이 `Animal`의 하위 클래스라고 해서 `List<Cat>`이 `List<Animal>`의 하위 타입이 아닙니다.

이건 타입 안전성을 지키기 위한 디자인입니다. 만약 허용된다면 이런 코드도 가능해지기 때문입니다:
```java
List<Cat> cats = new ArrayList<>();
List<Animal> animals = cats; // 허용됐다고 가정
animals.add(new Dog());      // Cat 리스트에 Dog가 들어가게 됨
```
이런 걸 막기 위해 제네릭은 무공변으로 설계된 것입니다.

### 컬렉션 리스트는 무공변, 배열은 공변
공변이란 하위 타입의 객체를 상위 타입의 참조로 참조할 수 있는 성질을 말합니다. 그리고 대표적으로 자바에서는 배열이 공변(Convariance)적입니다. `String`은 `Object`의 하위 타입(서브 타입)이므로, `String`배열을 `Object`배열로 참조할 수 있습니다.
```java
String[] strings = new String[3];
Object[] objects = strings; // ✅ 가능(배열은 공변적)
```

무공변은 타입 안정성을 보장하지만 타입의 유연성이 부족하다는 단점이 있어, <mark>**자바에서는 와일드카드(`?`)와 `extends`, `super` 키워드로 공변과 반공변을 지원**</mark>합니다.

## ✔️ 공변 (Covariant)
`S`가 `T`의 하위 타입일 때, `List<S>`를 `List<? extends T>`로 볼 수 있다는 의미입니다.  
쓰기는 `null`만 허용하므로, <mark>**읽기 전용으로 사용하기에 적합**</mark>합니다.
```java
class Animal {}
class Dog extends Animal {}

List<Dog> dogs = new ArrayList<>();
List<? extends Animal> animals = dogs; // ✅ 가능
```
`Dog`는 `Animal`의 하위 타입이므로 `List<Dog>`는 `List<? extends Animal>`로 읽을 수 있습니다.
이게 바로 공변성 (Covariance) 입니다. (하위 타입을 상위 타입처럼 읽을 수 있는 것)

### 쓰기는 null만 가능
`<? extends T>`는 `T`의 하위 타입이면 뭐든 OK라는 의미인데, 어떤 구체적인 타입인지 알 수 없기 때문에, 그 컬렉션에 값을 쓸 수 없습니다 (단, `null`은 가능).
```java
List<? extends Animal> animals = new ArrayList<Dog>();
animals.add(new Dog());    // ❌ 컴파일 에러
animals.add(new Animal()); // ❌ 컴파일 에러
animals.add(null);         // ✅ 가능
```
`animals`가 실제로 `List<Dog>`일지 `List<Cat>`일지 알 수 없기 때문에, 컴파일러는 타입 안전을 위해 어떤 하위 타입의 인스턴스도 허용하지 않습니다.
하지만 `null`은 모든 참조 타입에 할당 가능하므로 허용됩니다.

### 읽기는 가능
```java
Animal animal = animals.get(0); // ✅ OK
```
`animals`는 최소한 `Animal`의 하위 타입이므로, `Animal`로 읽는 건 안전합니다.

## ✔️ 반공변 (Contravariant)
`S`가 `T`의 하위 타입일 때, `List<T>`를 `List<? super S>`로 볼 수 있다는 의미입니다.  
단, `S`또는 `S`의 하위 타입만 `add()`할 수 있습니다.  
읽기는 `Object` 타입으로만 가능하므로, <mark>**쓰기 전용으로 사용하기에 적합**</mark>합니다.

### 쓰기는 가능
```java
List<? super Cat> list = new ArrayList<Animal>();
list.add(new Cat());    // ✅ 가능 (Cat은 Cat의 상위 타입에도 넣을 수 있음)
list.add(new Animal()); // ❌ 불가능 (Animal은 Cat이 아님)
list.add(new Object()); // ❌ 불가능 (Object는 Cat이 아님)
```
컴파일러는 `list`의 정확한 타입을 모릅니다.  
`List<? super Cat>`는 `List<Cat>`, `List<Animal>`, `List<Object>`중에 하나일 수 있는데, `List<Cat>`일 경우 `Object`를 넣으면 타입 안전성(type safety)이 깨지므로 Java는 컴파일 타임에 이걸 막습니다.

#### ❗️왜 상위를 하위에 못 넣을까?
타입 안정성(type safety) 문제 때문입니다. `Cat`은 `Animal`보다 더 많은 기능(`meow()` 등)을 가지므로, `Animal`은 `Cat`가 될 수 없습니다.
자바 컴파일러는 `Cat` 타입으로 접근하려는 메서드나 필드가 실제로 `Animal`에 존재하지 않는 걸 알기 때문에, 컴파일 에러 또는 런타임 오류(`ClassCastException`)를 발생시킵니다.

### 읽기는 `Object` 타입으로만 가능
읽을 때는 타입이 정확하지 않으므로, `Object`로 밖에 받을 수 없습니다.
```java
Object obj = list.get(0); // ✅ 가능
Cat cat = list.get(0);    // ❌ 컴파일 에러
```

## ✔️ PECS (Producer Extends, Consumer Super)
제네릭에서 와일드카드의 상위 또는 하위 경계를 설정할 때 사용하는 가이드라인입니다. 객체를 생산할 때는 `<? extends T>`를 사용하고, 소비할 때는 `<? super T>`를 사용합니다.
```java
public void produce(List<? extends Animal> animals) { // animals가 생산자 역할
    for (Animal a : animals) {
        System.out.println(a);
    }
}

public void consume(List<? super Cat> cats) { // cats가 소비자 역할
    cats.add(new Cat());
}
```

## ✔️ `<?>`와 `<Object>`의 차이점은 뭘까?
`<?>`와 `<Object>`는 모든 타입을 수용하는 것처럼 보이지만 동작 방식에 차이가 있습니다.  

`<?>`는 모든 타입을 메서드 인자로 받을 수 있지만 `null` 외에는 값을 추가할 수 없기 때문에 <mark>**읽기 전용으로 사용**</mark>됩니다.  
`<Object>`는 `<Object>`외의 타입을 메서드 인자로 받을 수 없지만 모든 객체를 추가할 수 있기 때문에 <mark>**읽기, 쓰기 모두 가능**</mark>합니다.