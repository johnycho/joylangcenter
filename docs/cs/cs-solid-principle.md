---
slug: cs-solid-principle
title: 객체지향 설계 5원칙(SOLID)
tags: [ cs ]
---

SOLID 원칙은 객체지향 설계 5원칙이라고도 불리며, 각 원칙의 앞 글자를 따서 만들어졌습니다. 객체지향설계의 핵심 중 하나는 의존성을 관리하는 것인데요. 의존성을 잘 관리하기 위해서는 SOLID 원칙을 준수해야 합니다.

## ✔️ 단일 책임 원칙(Single Responsibilty Principle)
클래스가 오직 하나의 목적이나 이유로만 변경되어야 한다는 것을 강조합니다. 여기서 “책임”이란 단순히 메서드의 개수를 뜻하지 않고, 특정 사용자나 기능 요구사항에 따라 소프트웨어의 변경 요청을 처리하는 역할을 의미합니다.

즉, 클래스는 한 가지 변화의 이유만 가져야 하며, 이를 통해 변경이 발생했을 때 다른 기능에 영향을 덜 미치도록 설계됩니다. 이렇게 하면 유지보수가 쉬워지고 코드가 더 이해하기 쉬워집니다.

## ✔️ 개방 폐쇄 원칙(Open-Closed Principle)
확장에는 열려있고, 변경에는 닫혀 있어야 함을 강조합니다. 이때 확장이란 새로운 타입을 추가함으로써 새로운 기능을 추가하는 것을 의미하며, 폐쇄란 확장이 일어날 때 상위 레벨의 모듈이 영향을 받지 않아야 함을 의미합니다. 이를 통해서 모듈의 행동을 쉽게 변경할 수 있습니다. 모듈이란 크기와 상관없이 클래스, 패키지, 라이브러리와 같이 프로그램을 구성하는 임의의 요소를 의미합니다.

## ✔️ 리스코프 치환 원칙(Liskov Substitution Principle)
서브 타입은 언제나 상위 타입으로 교체할 수 있어야 합니다. 즉, 서브 타입은 상위 타입이 약속한 규약을 지켜야 함을 강조합니다. 이 원칙은 부모 쪽으로 업 캐스팅하는 것이 안전함을 보장하기 위해 존재합니다. 상위 타입에 대해 기대되는 역할과 행동 규약이 있는데 이를 벗어나면 안 됩니다. 만약, 하위 타입이 상위 타입에 기대되는 역할을 만족하지 않는다면, 상위 타입을 사용하는 클라이언트 코드에서는 하위 타입이 누구인지 물어봐야 하는데, 이는 OCP를 달성하기 어렵게 합니다. LSP를 위반하는 대표적인 사례로는 Rectangle 예제가 있습니다.

### 왜 Rectangle과 Square의 상속관계가 LSP를 위반할까?
```java
class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) {
        this.width = width;
    }
    
    public void setHeight(int height) {
        this.height = height;
    }

    public int getArea() {
        return width * height;
    }
}

class Square extends Rectangle {

    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width;  // 정사각형이므로 높이도 너비와 같아야 함
    }

    @Override
    public void setHeight(int height) {
        this.height = height;
        this.width = height;  // 정사각형이므로 너비도 높이와 같아야 함
    }
}
```
- Rectangle은 width와 height가 독립적으로 변경 가능합니다.
- Square는 width와 height가 항상 같아야 하므로 독립적인 변경이 불가능합니다.
- Square를 Rectangle 타입으로 대체하여 사용하면 예상치 못한 행동(부작용)이 발생합니다.

즉, 하위타입(Square)이 상위타입(Rectangle)과 **행동적 계약(behavioral contract)** 을 제대로 지키지 못합니다.

```java
void resizeRectangle(Rectangle rectangle) {
    rectangle.setWidth(5);
    rectangle.setHeight(10);
    System.out.println(rectangle.getArea());  // 기대값: 50
}

public static void main(String[] args) {
    Rectangle rect = new Rectangle();
    resizeRectangle(rect);  // 정상적으로 동작: 출력값 50

    Rectangle square = new Square();
    resizeRectangle(square);  // 잘못된 동작: 출력값 100 (예상값은 50)
}
```
- resizeRectangle() 메서드는 너비와 높이를 독립적으로 설정할 수 있다고 가정합니다.
- 하지만 정사각형(Square)은 너비와 높이를 독립적으로 설정할 수 없습니다. 이로 인해 원하지 않는 부작용이 발생합니다.
- 즉, 하위 타입(Square)이 상위 타입(Rectangle)을 완전히 대체하지 못하고, 사용자의 기대를 깨트림으로써 LSP를 위반한 것입니다.

### 어떻게 하면 LSP를 만족시킬 수 있을까?
이 예제를 올바르게 설계하려면 상속 대신 인터페이스나 합성을 활용해야 합니다.
```java
// 공통 인터페이스 정의
interface Shape {
    int getArea();
}

class Rectangle implements Shape {
  private int width;
  private int height;

  public Rectangle(int width, int height) {
    this.width = width;
    this.height = height;
  }

  public void setWidth(int width) {
    this.width = width;
  }

  public void setHeight(int height) {
    this.height = height;
  }

  @Override
  public int getArea() {
    return width * height;
  }
}

// 합성 사용
class Square implements Shape {
  private Rectangle rectangle;

  public Square(int side) {
    this.rectangle = new Rectangle(side, side);
  }

  public void setSide(int side) {
    rectangle.setWidth(side);
    rectangle.setHeight(side);
  }

  public int getSide() {
    return rectangle.getArea() / rectangleWidth();
  }

  private int rectangleWidth() {
    // 사각형의 width를 가져오는 내부 메서드
    // (실제 프로젝트에선 getter를 추가하여 사용하는 것이 일반적)
    return rectangle.getArea() / rectangleHeight();
  }

  private int rectangleHeight() {
    return rectangleWidth(); // 정사각형이므로 width == height
  }

  @Override
  public int getArea() {
    return rectangle.getArea();
  }
}
```
실무에서는 내부 Rectangle의 getter/setter를 직접 제공하거나 간소화해서 사용

## ✔️ 인터페이스 분리 원칙(Interface Segregation Principle)
클라이언트 입장에서 인터페이스를 분리해야 함을 강조합니다. 사용하지 않지만 의존성을 가지고 있다면 해당 인터페이스가 변경되는 경우 영향을 받습니다. 따라서, 독립적인 개발과 배포가 불가합니다. 사용하는 기능만 제공하도록 인터페이스를 분리해 변경의 여파를 최소화할 수 있습니다.

## ✔️ 의존성 역전 원칙(Dependency Inversion Principle)
상위 수준의 모듈은 하위 수준의 모듈에 의존해서는 안 되며, 모두 추상화에 의존해야 함을 강조합니다. SOLID는 서로 연관이 있는데요. 의존성 역전 원칙을 통해서 하위 레벨의 모듈은 개방 폐쇄 원칙을 준수하면서 새로운 타입이 추가 가능합니다.