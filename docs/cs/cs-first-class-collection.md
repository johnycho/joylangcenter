---
slug: cs-first-class-collection
title: 일급 컬렉션
tags: [ cs ]
---

# 일급 컬렉션(First-Class Collection)이란?
하나의 컬렉션을 감싸는 클래스를 만들고, 해당 클래스에서 컬렉션과 관련된 비즈니스 로직을 관리하는 패턴을 말합니다. 아래 코드 중에서 Order의 List 자료구조를 감싼 Orders가 일급 컬렉션의 예시입니다.
```java
// 일급 컬렉션
public class Orders {

    private final List<Order> orders;

    public Orders(List<Order> orders) {
        validate(orders); // 검증 수행
        ...
    }

    public void add(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }
        orders.add(order);
    }

    public List<Order> getAll() {
        return Collections.unmodifiableList(orders);
    }

    public double getTotalAmount() {
        return orders.stream()
                     .mapToDouble(Order::getAmount)
                     .sum();
    }
}
public class OrderService {

    private final Orders orders = new Orders();

    public void addOrder(Order order) {
        orders.add(order);
    }

    public Orders getOrders() {
        return orders;
    }

    // 추가 비즈니스 로직...
}
```

## ✔️ 일급 컬렉션을 사용해야하는 이유는 뭘까? 😀
일급 컬렉션 클래스에 로직을 포함하거나 비즈니스에 특화된 명확한 이름을 부여할 수 있습니다. 또한, 불필요한 컬렉션 API를 외부로 노출하지 않도록 할 수 있으며, 컬렉션을 변경할 수 없도록 만든다면 예기치 않은 변경으로부터 데이터를 보호할 수 있습니다.