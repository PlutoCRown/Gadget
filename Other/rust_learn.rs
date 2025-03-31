use std::cell::Cell;
use std::cell::RefCell;
use std::ops::{Add, Mul, Sub};
use std::sync::{Arc, Mutex, RwLock};
use std::thread;

fn main() {
    let error = Err("Panic!");
    let processed = error.unwrap_or_else(|x| x);
    println!("{}", processed);
}

#[allow(dead_code)] // 你好世界
fn def_var() {
    print!("Hello, world!!");
    let a = 10;
    let b: i32 = 20;
    let c = a + b;
    println!("a = {}, b = {}, c = {}", a, b, c);
}

#[allow(dead_code)] // 基础语法
fn base_syntax() {
    fn mul2(x: i32) -> i32 {
        x * 2
    }
    let mut i = -2;
    loop {
        i += 1;
        println!("{}", mul2(i));
        if i > 2 {
            break;
        }
    }
}

#[allow(dead_code)] // 字符切片
fn str_or_string() {
    // 使用字符串字面量创建 str 类型
    let str_literal: &str = "Hello, Rust!";

    // 创建 String 类型
    let mut string: String = String::from("Hello");

    // 向 String 类型追加内容
    string.push_str(", Rust!");

    println!("str literal: {}", str_literal);
    println!("String: {}", string);
}

#[allow(dead_code)] // 格式输出
fn output() {
    print!("Hello");
    println!(" World!"); // 带换行
    let name = "Alice";
    let age = 24.2;
    println!("Hello, {}", name); // 变量占位
    println!("{1} is {0} year old.", age, name); // 调整顺序
    println!("{:.0}", age); // 小数点
    println!("{:20}", name); // 指定打印字段的最小宽度。例如，"{:<10}" 表示打印一个至少宽度为 10 的左对齐字段。
    println!("{:>20}", name); // 指定打印字段的最小宽度，并进行右对齐。
    println!("{:^20}", name); // 指定打印字段的最小宽度，并进行居中对齐。
                              //{:?}：用于以调试格式打印值。这会使用 Debug trait 来打印值，通常用于调试目的。
                              // {:#?}：类似于 {:?}，但以更美观的方式打印复杂类型的值，每个字段占据独立的行。
}

#[allow(dead_code)] // 输入方法
fn input() {
    use std::io;
    let mut input = String::new();
    println!("Please enter your name:");
    io::stdin()
        .read_line(&mut input)
        .expect("Failed to read line");
    println!("Hello, {}", input);
}

#[allow(dead_code)] // 容器操作
fn container_operate() {
    let mut v = vec![1, 2, 3];
    v.pop();
    println!("len: {:?}", v.len());
    v.push(4);
    println!("v: {:?}", v);
    for element in v.iter() {
        println!("Element: {}", element);
    }
}

#[allow(dead_code)] // 面向对象
fn struct_and_method() {
    struct Point {
        x: i32,
        y: i32,
    }
    impl Point {
        fn new(x: i32, y: i32) -> Point {
            Point { x, y }
        }
    }
    let p1 = Point::new(1, 2);
    println!("p1.x: {}", p1.x);
    println!("p1.y: {}", p1.y);
}

#[allow(dead_code)] // 内建方法
fn build_in_trait() {
    #[derive(Debug)] // 可调试输出
    struct Point<T> {
        x: T,
        y: T,
    }
    // 实现 Display trait，用于格式化输出
    impl<T: std::fmt::Display> std::fmt::Display for Point<T> {
        fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            write!(f, "({}, {})", self.x, self.y)
        }
    }

    // 运算符重载
    impl<T: PartialEq> PartialEq for Point<T> {
        fn eq(&self, other: &Self) -> bool {
            self.x == other.x && self.y == other.y
        }
    }
    impl<T: Add<Output = T>> Add for Point<T> {
        type Output = Self;

        fn add(self, other: Self) -> Self {
            Point {
                x: self.x + other.x,
                y: self.y + other.y,
            }
        }
    }
    impl<T> Clone for Point<T> {
        fn clone(&self) -> Self {
            Point {
                x: self.x,
                y: self.y,
            }
        }
    }
    // impl<T: std::fmt::Display> Drop for Point<T> {
    //     fn drop(&mut self) {
    //         println!("Dropping Point({}, {})", self.x, self.y);
    //     }
    // }
    impl<T> Iterator for Point<T> {
        type Item = (String, T);
        fn next(&mut self) -> Option<Self::Item> {
            match 0 {
                0 => Some((String::from("x"), self.x)),
                _ => None,
            }
        }
    }

    let p1 = Point { x: 2, y: 3 };
    let p2 = p1.clone(); // Clone Trait
    let p3 = p1; // Copy Trait
    std::mem::drop(p2); // 删除变量
}

#[allow(dead_code)] // 闭包特性
fn closure() {
    struct MyClosure {
        value: i32,
    }
    impl FnOnce<()> for MyClosure {
        type Output = i32;

        extern "rust-call" fn call_once(self, _: ()) -> i32 {
            self.value
        }
    }
    impl FnMut<()> for MyClosure {
        extern "rust-call" fn call_mut(&mut self, _: ()) -> i32 {
            self.value
        }
    }
    impl Fn<()> for MyClosure {
        extern "rust-call" fn call(&self, _: ()) -> i32 {
            self.value
        }
    }
    let mut closure = MyClosure { value: 42 };
    let result1 = (closure)();
    println!("Fn call: {}", result1);
    let result2 = (&mut closure)();
    println!("FnMut call: {}", result2);
    let result3 = core::mem::take(&mut closure)();
    println!("FnOnce call: {}", result3);
}

#[allow(dead_code)] // 完美处理
fn option_and_result() {
    let v = vec![1, 2, 3];
    // type Option<T> = Some<T> | None
    if let Some(element) = v.get(1) {
        println!("Element at index 1: {}", element); // 2
    }
    // type Result<T,E> = Ok(T) | Err(E)
    fn divide(a: i32, b: i32) -> Result<i32, String> {
        if b != 0 {
            Ok(a / b)
        } else {
            Err(String::from("Division by zero"))
        }
    }
    match divide(10, 2) {
        Ok(result) => println!("Result: {}", result),
        Err(error) => panic!("Error: {}", error),
    }
    // Option.unwrap | Result.unwrap 可以不处理错误情况，但是直接触发Panic
    let right = Some(2);
    let two = right.unwrap();

    // 可以有默认值或者传入函数处理错误
    let error = Err("Panic!");
    let default = error.unwrap_or("Default Value");
    let processed = error.unwrap_or_else(|x| x);
    error.expect("手动触发Panic");
    ()
}

#[allow(dead_code)] // 持有关系
fn owner_ship() {
    let s1 = String::from("Hello");
    fn takeover(some_string: String) {
        println!("Received ownership: {}", some_string);
    }
    takeover(s1);
    // 以下代码将无法编译通过，因为s2的所有权已在上一行中转移
    // println!("s1: {}", s1);
}

#[allow(dead_code)] // 智能指针
fn auto_pointer() {
    let boxed_value: Box<i32> = Box::new(42);
    // 注意上面这个东西他不可变
    println!("Value: {}", boxed_value);
    let mut new_boxed_value = boxed_value;
    *new_boxed_value += 1;
    println!("Value: {}", new_boxed_value);
    let const_value = new_boxed_value;
    // 当然，不可变引用和可变引用是双向可变的！
    println!("Value: {}", const_value);
}

#[allow(dead_code)] // 内部可变
fn interior_mutable() {
    let cell = Cell::new(5);
    let value = cell.get();
    println!("Initial value: {}", value);
    cell.set(10);
    let new_value = cell.get();
    println!("New value: {}", new_value);

    // cell.update(|x| x + 1); // 闭包方法修改
    let updated_value = cell.get();
    println!("Updated value: {}", updated_value);
}

#[allow(dead_code)] // Rust精髓
fn refcell() {
    // 同时还有 Arc => Async Ref Cell 保证多线程问题
    let ref_cell = RefCell::new(5);
    let value = ref_cell.borrow();
    println!("Initial value: {}", *value);
    let mut mutable_value = ref_cell.borrow_mut(); // 可变借用
    *mutable_value = 10;
    // 必须丢了之前的才能用
    drop(mutable_value);
    let new_value = ref_cell.borrow(); // 不可变借用
    println!("New value: {}", *new_value);


    // 偷变量？不可能
    use std::cell::{RefCell, RefMut};
    fn main() {
        let pa = RefCell::new(42);
        mut_pa(&pa);
        // pb已死
        println!("pa = {}", *pa.borrow());
    }

    fn mut_pa (pa: &RefCell<i32>) -> (){
        let mut pb = pa.borrow_mut();
        *pb += 1;
        // pb未死，不可以
        log_pa(pa);
        log_pb(pb);
    }
    fn log_pb(pb: RefMut<'_, i32>) -> () {
        println!("pb = {}", *pb);
    }
    fn log_pa(pa: &RefCell<i32>) -> () {
        println!("steal pb = {}", *pa.borrow());
    }
}

#[allow(dead_code)] // 生命周期
fn life_cycle() {
    let s1 = String::from("hello");
    let result;
    {
        let s2 = String::from("world");
        result = longest(&s1, &s2);
    }
    println!("Longest string: {}", result);

    fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
        if x.len() > y.len() {
            x
        } else {
            y
        }
    }
}

#[allow(dead_code)] // 并发安全
fn async_programming() {
    // 使用 Mutex 共享计数器
    let counter_mutex = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..5 {
        let counter_mutex = Arc::clone(&counter_mutex);
        let handle = thread::spawn(move || {
            let mut counter = counter_mutex.lock().unwrap(); // 获取 Mutex 的锁
            *counter += 1; // 修改共享计数器
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Mutex Counter: {}", *counter_mutex.lock().unwrap()); // 输出 Mutex 计数器的值

    // 使用 RwLock 共享数据结构
    let data_rwlock = Arc::new(RwLock::new(vec![1, 2, 3]));
    let mut read_handles = vec![];
    let mut write_handles = vec![];

    for _ in 0..3 {
        let data_rwlock = Arc::clone(&data_rwlock);

        let read_handle = thread::spawn(move || {
            let data = data_rwlock.read().unwrap(); // 获取读锁
            println!("Read Data: {:?}", *data); // 读取共享数据
        });

        read_handles.push(read_handle);
    }

    for _ in 0..2 {
        let data_rwlock = Arc::clone(&data_rwlock);

        let write_handle = thread::spawn(move || {
            let mut data = data_rwlock.write().unwrap(); // 获取写锁
            data.push(4); // 修改共享数据
            println!("Write Data: {:?}", *data);
        });

        write_handles.push(write_handle);
    }

    for read_handle in read_handles {
        read_handle.join().unwrap();
    }

    for write_handle in write_handles {
        write_handle.join().unwrap();
    }
}
