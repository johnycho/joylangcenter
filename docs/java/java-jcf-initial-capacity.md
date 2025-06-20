---
slug: java-jcf-initial-capacity
title: JCF 자료 구조의 초기 용량
tags: [ java, data-structure ]
---

<mark>**`ArrayList`의 기본 용량(capacity)은 10**</mark>이며, 용량이 가득 차면 기존 크기의 1.5배(`oldCapacity + (oldCapacity >> 1)`) 로 증가합니다.

예를 들어, `MAX = 5,000,000`일 때 기본 설정으로 리스트를 생성하면 여러 번의 리사이징이 발생해 최종 capacity가 `6,153,400`까지 증가하고, 약 70MB의 메모리를 사용합니다.

반면, `new ArrayList(MAX)`로 초기 용량을 설정하면 불필요한 리사이징 없이 `5,000,000` 크기로 고정되며, 약 20MB의 메모리만 사용하게 됩니다.

```java
public class Main {

    private static final int MAX = 5_000_000;

    public static void main(String[] args) {
        MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
        printUsedHeap(1, memoryMXBean);

        List<String> arr = new ArrayList<>();
        for (int i = 0; i < MAX; i++) {
            arr.add("a");
        }

        printUsedHeap(2, memoryMXBean);
        printUsedHeap(3, memoryMXBean);
    }

    private static void printUsedHeap(int logIndex, MemoryMXBean memoryMXBean) {
        MemoryUsage heapUsage = memoryMXBean.getHeapMemoryUsage();
        long used = heapUsage.getUsed();
        System.out.println("[" + logIndex + "] " + "Used Heap Memory: " + used / 1024 / 1024 + " MB");
    }
}
```
JCF에서 가변 크기의 자료 구조를 사용하는 경우, <mark>**초기 용량을 설정하면 리사이징을 줄이고 메모리와 연산 비용을 절약**</mark>할 수 있습니다.

## ✔️ 로드 팩터 (Load Factor)
특정 크기의 자료 구조에 <mark>**데이터가 어느 정도 적재되었는지 나타내는 비율**</mark>입니다.  
가변적인 크기를 가진 자료구조에서 크기를 증가시켜야 하는 `임계점(Threshold)`을 계산하기 위해서 사용됩니다.

예를 들어, JCF에서 <mark>**`HashMap`의 경우에는 내부적으로 배열을 사용하며, 초기 사이즈는 16**</mark>입니다. 이때, `HashMap`의 기준 로드 팩터는 0.75이므로 임계점은 12(`capacity * load factor = threshold`) 입니다. 만약, `HashMap` 내부 배열의 사이즈가 12를 넘는 경우 내부 배열의 크기를 2배 늘리고, 재해싱을 수행합니다.