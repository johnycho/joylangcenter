---
slug: java-object-copy
title: 객체 복사 방식
tags: [ java ]
---

# Java의 객체 복사 방식
Java에서 객체를 복사할 때 **얕은 복사**와 **깊은 복사**라는 두 가지 방식이 있습니다. 먼저 Book과 Author라는 두 클래스를 사용해서 예제를 살펴볼게요. Book은 책의 이름(name)과 저자(author) 정보를 가지고 있고, Author는 저자의 이름을 가지고 있습니다.

```java
class Book {

    private String name; // 책 이름
    private Author author; // 저자

    public Book(String name, Author author) {
        this.name = name;
        this.author = author;
    }

    public Book shallowCopy() { // 얕은 복사
        return new Book(this.name, this.author);
    }

    public Book deepCopy() { // 깊은 복사
        Author copiedAuthor = new Author(this.author.getName());
        return new Book(this.name, copiedAuthor);
    }

    public void changeAuthor(String name) { // 저자 이름 변경
        author.setName(name);
    }

    @Override
    public String toString() {
        return "Book name : " + name + ", " + author;
    }

    static class Author {

        private String name; // 저자 이름

        public Author(String name) {
            this.name = name;
        }

        public String getName() { // 저자 이름 반환
            return name;
        }

        public void setName(String name) { // 저자 이름 변경
            this.name = name;
        }

        @Override
        public String toString() {
            return "Author : " + name;
        }
    }

    public static void main(String[] args) {
        Author author1 = new Author("조슈아 블로크");
        Book book1 = new Book("이펙티브 자바", author1);

        // 얕은 복사 후 변경
        Book shallowCopyBook = book1.shallowCopy();
        shallowCopyBook.changeAuthor("Joshua Bloch");

        // 얕은 복사 결과 출력
        System.out.println("After shallow copy and change:");
        System.out.println("Original book1: " + book1);
        System.out.println("Shallow copied book: " + shallowCopyBook);

        Author author2 = new Author("마틴 파울러");
        Book book2 = new Book("리팩터링", author2);

        // 깊은 복사 후 변경
        Book deepCopyBook = book2.deepCopy();
        deepCopyBook.changeAuthor("Martin Fowler");

        // 깊은 복사 결과 출력
        System.out.println("After deep copy and change:");
        System.out.println("Original book2: " + book2);
        System.out.println("Deep copied book: " + deepCopyBook);
    }
}
```
## ✔️ 얕은 복사(Shallow Copy)
`shallowCopy()` 메서드는 새로운 Book 객체를 만들지만, 내부의 Author 객체는 원본과 동일한 객체를 참조합니다. 즉, Book 객체는 새로 만들었지만, Author 객체는 새로 만들지 않고 기존의 것을 그대로 사용합니다. 예를 들어, book1에서 `shallowCopyBook`을 만든 후, `shallowCopyBook`의 저자 이름을 “Joshua Bloch”로 바꾸면 book1의 저자 이름도 “Joshua Bloch”로 바뀝니다. 둘이 같은 Author 객체를 공유하고 있기 때문에 두 Book 객체의 Author가 동시에 변경되는 거죠.
## ✔️ 깊은 복사(Deep Copy)
`deepCopy()` 메서드는 Book 객체와 Author 객체 모두 새로운 객체로 만들어줘요. 그래서 book2에서 `deepCopyBook`을 만들고 `deepCopyBook`의 저자 이름을 “Martin Fowler”로 바꾸어도, book2의 저자 이름은 여전히 “마틴 파울러”로 남아 있어요. `deepCopyBook`과 book2가 서로 다른 Author 객체를 참조하고 있기 때문이에요.

출력 결과를 보면,
```text
After shallow copy and change:
Original book1: Book name : 이펙티브 자바, Author : Joshua Bloch
Shallow copied book: Book name : 이펙티브 자바, Author : Joshua Bloch
```
얕은 복사에서 `shallowCopyBook`과 book1이 같은 Author를 공유하니까, `shallowCopyBook`의 저자 이름을 바꾸면 book1의 저자 이름도 바뀐 거예요.
```text
After deep copy and change:
Original book2: Book name : 리팩터링, Author : 마틴 파울러
Deep copied book: Book name : 리팩터링, Author : Martin Fowler
```
깊은 복사한 `deepCopyBook`과 book2는 서로 다른 Author 객체를 참조하니까, `deepCopyBook`의 저자 이름을 바꿔도 book2는 영향을 받지 않습니다.