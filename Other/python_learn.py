"""
人 ==操作=> 程序 ==保存=> 文件
           ⬇️⬆️
         更新状态
"""
# 注释
number = 42  # 0x123
string = "名字"  # '123'
boolean = True  # False

array = [number, string, boolean]
object = {"年龄": number, string: boolean}
print(array)
print(object)


range(10)
for i in array:  # enumerate zip
    print(i)

if 1 == 2:  # < > <= >= !=
    print("unreachable")

number * 4  # +-*/% ** += -= *= /= %= << >> & | ^

string + "555"  # + *

not boolean  # not and or

op_list = [1, 2, 3]
op_list.pop(1)
op_list.append(5)
op_list.__len__()
op_list.reverse()
op_list.sort()
op_list.extend([7, 8, 9])
op_list.insert(4, 0)

object["年龄"]
object.keys()
object.values()
object.items()
object.get("年龄")
object.__setitem__("其他", "888")


def fn():
    print("Repeating")
    print("Repeating")
    print("Repeating")
    print("Repeating")


fn()
print("other")
fn()


def f(x):
    return x**2


f(9)

import math


class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def length(self):
        return math.sqrt(self.x**2 + self.y**2)


point1 = Point(1, 2)
point1.x
point1.length()

print(f"Hello World")
print(
    """
好多行
好多行
好多行
"""
)

import os

# input()
# pip
# open()

# pandas matplotlib
# requests bs4 seleium
# numpy OpenCV PyTorch
# Flask Django
