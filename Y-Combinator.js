
// 推导 I 阶乘
(()=>{
    // 定义一个递归的函数
    const factorial = (num) => num == 0 ? 1 : factorial(num-1)*num;
    console.log(factorial(5)); // 120
});

// 推导 II 调用自身
(()=>{
    // 假设存在一个self引用，可以不用定义变量实现递归
    ((num) => num == 0 ? 1 : self(num-1)*num)(5);
    // 把他参数化，也就是假装外面有一个函数可以让我们获得这个引用
    ((self) =>(num) => num == 0 ? 1 : self(num-1)*num)(/* SomeThing */)(5);
    // 实际上上一行不能运行，因为现在函数本身已经是有两个参数了，因此我们调用前应该先传入self
    ((self) =>(num) => num == 0 ? 1 : self(self)(num-1)*num)(/* SomeThing */)(5);
    // 其实我们只需要复制一份这个函数，让前一份函数的self有相同的代码内容就可以了
        ((self) =>(num) => num == 0 ? 1 : self(self)(num-1)*num)
        ((self) =>(num) => num == 0 ? 1 : self(self)(num-1)*num)(5);
}); // 不可运行

// 推导 III 抽象
(()=>{
    // 上面的我们已经实现了一个纯匿名函数的递归
    console.log(
        ( self=>num=> num == 0 ? 1 : self(self)(num-1)*num )
        ( self=>num=> num == 0 ? 1 : self(self)(num-1)*num )
        (5)
    ); // 120
    // 如果函数很长，复制一份并不优雅
    // 假设存在一个函数，他可以这样 Y(F) => F(Y(F))
    let Y = (recuiseFunction) => {/* Some Work */}  
    // 然后他就会自身无限递归 => F(F(F(F(F(F(...Y(F)...))))))
    // 参数 F 是我们的原函数 ,他的签名是 F = (self) => (realparams) => SomeWork
    // F 有两个参数 , 所以只是传入第一个参数 Y(F) , 函数并不会产生一次递归
    // 当传入第二个参数, F会真正的执行逻辑 ，并产生下一个Y(F), 并且会自带传入第一个参数（也就是Y(F)）...
    // 也许你会想，复制两次，只需使用这个函数就行
    Y = (g=>g(g));
    const raw = (self) => num => num == 0 ? 1 : self(self)(num-1)*num;
    // 实际上他可用，但是self居然要先传入self函数才能用👆？我们不能无感知把他真正的当作自身使用
    const Factorial = Y(raw);
    console.log(Factorial(5)); // Assert is 120
});

// 推导 IV 设计 Y 函数
(()=>{
    // y 必须返回一个函数 ,并且有2个独立的参数，并且提前传入了一个（自身代码）
    Y = (origin) => ( (params1) => (params2) => {/*SomeWork*/} );
    // 我们明确了参数,看起来这样的代码可用(确实可以)，但是这样和g=>g(g)有什么区别呢
    Y = (origin) => ( (self) => (realParams) => origin(self)(realParams) );
    // 实际上我们不应该让origin 执行2次，Origin只应该有一个参数，我们应该将可执行两次的操作封装到self里
    // 下面的做法让Origin调用时只传入一个参数，那么用户拿到的self必然不是真实的self，只是将提前闭包在里面的origin调用的过程
    Y = (origin) => ( (self) => origin(realParams => self(self)(realParams)) );
    // 当self传入 ，立刻执行origin, 按道理origin应该直接执行，
    // 但是我们给origin传入的是另一个函数，他需要接受一个参数才能真正的执行
    // 这样 在下一步中，我们将复制一份这样的函数，让前面的self持有本身，此时执行origin，函数变为一个等待realParams的状态
    // 当realParams传入，origin的真实执行结果将返回，并且self仍然是self
    // 复制一份
    Y = (origin) => ( (self) => origin(realParams => self(self)(realParams)) )
                    ( (self) => origin(realParams => self(self)(realParams)) );
    // 使用 g=>g(g)
    Y =  origin => (g=>g(g)) ((self) => origin(params => self(self)(params))); // right
});

// 推导 V 什么是Y组合子
(()=>{
    // 注意到
    Y(F) == F(Y(F))
    // 其中 Y(F) 是 F 的函数， 设为 x
    x == F(x)
    // 漂亮的等式，在数学上我们称为不动点
    // Y-Combinator 可以找到函数的不动点
}); // 不可运行 

// 推导 VI 应用案例
(()=>{
    console.log(
        (g=>g(g))
        (self => num => num == 0 ? 1 : self(self)(num-1)*num)
        (5)
    ); // 不优雅的阶乘
    console.log(
        (g=>g(g))
        (self => num => (num == 1 || num == 2) ? 1 : self(self)(num-1)+self(self)(num-2))
        (7)
    ); // 不优雅的斐波那契
    // use Y
    console.log(
        ((f) => (g=>g(g))((x) => f((y) => x(x)(y))))
        (self => num => num == 0 ? 1 : self(num-1)*num)
        (5)
    ); // 优雅的阶乘
    console.log(
        ((f) => (g=>g(g))((x) => f((y) => x(x)(y))))
        (self => num => (num == 1 || num == 2) ? 1 : self(num-1)+self(num-2))
        (7)
    ); // 优雅的阶乘
});

// Test Function
(()=>{
    console.log("End")
})()