---
title: "How to solve exercise 4 “A” from Codeforces"
date: "2026-01-23"
description: "A detailed beginner's guide to solving the Watermelon exercise, the 'Hello World' of competitive programming"
---

# How to solve exercise 4 “A” from Codeforces

> 🔗 **Official Problem:** [**Codeforces 4A - Watermelon**](https://codeforces.com/problemset/problem/4/A)

A few weeks ago, I started taking competitive programming as a serious hobby. A weekend e-sport. I do sessions of 2 to 3 hours on weekends, where I solve [**difficulty 1000 exercises**](https://codeforces.com/problemset?order=BY_SOLVED_DESC&tags=1000-1000). They allow me to *vibecode* with an awake and calm conscience.

The **Watermelon** exercise is the *Hello World* of Codeforces. **[It has been solved by more than 650,000 users on the platform](https://codeforces.com/problemset?order=BY_SOLVED_DESC).** And since it's easy, in this post I'm going to help you solve it no matter what. There is no excuse not to do it. If someone could solve it from the most remote place in Africa thanks to a Starlink satellite, you can too with this post.

### What will you need?
*   A **code editor**.
*   Basic **math and algorithms** knowledge.
*   Basic knowledge of a **programming language**.

For serious programming, I use the [**Antigravity editor by Google**](https://antigravity.google/), but for these exercises, I use [**Sublime Text**](https://www.sublimetext.com/) because it helps me concentrate better. I chose Python as my language because eventually, I want to use it to create scripts that automate cybersecurity tasks. If you want to learn or reinforce the basics, I recommend this [**CS50 masterclass from Harvard**](https://youtu.be/Rl0ludWTLxs).

> ⭐ **Recommendation:** [**CS50's Introduction to Programming with Python**](https://youtu.be/nLRL_NcnK-4)

If you use an operating system like Linux or MacOS and already have experience with the terminal, I recommend using it to test your solutions. If you have Windows, I recommend using an editor with an integrated terminal like Antigravity or [**Visual Studio Code**](https://code.visualstudio.com/). If you still don't feel comfortable with the terminal, I think you should stop reading this post and focus on achieving that state of comfort, as it is a fundamental skill.

---

## Problem Analysis

When I first solved this exercise, [**I jumped straight into the deep end**](https://codeforces.com/profile/ciberportero). I did it as best as I could, without a methodology. I started with a basic Python script and asked ChatGPT for guidance without giving me the answer. Today, after several exercises and participating in competitions, I understand that **problems must be reduced to a simple mathematical model**.

### 1. Extracting Key Data
The problem states:
*“After that the watermelon was weighed, and the scales showed **w kilos**.”*  
**💡 The key:** We will work with a variable `w` representing the weight.

Then it adds:
*“...divide the watermelon in such a way that each of the two parts weighs **even number of kilos**, at the same time it is not obligatory that the parts are equal.”*  
**💡 The key:** We need to find out if it is possible to divide the weight into two parts where **both are even**.

### 2. Input Specifications
*“The first (and the only) input line contains integer number **w (1 ≤ w ≤ 100)**”*  
This means we will receive an integer between 1 and 100.

In Python, we capture it like this:
```python
w = int(input())
```
**Note:** we use `int()` because the `input()` function in Python always returns whatever the user types as a **string**. To perform mathematical calculations with that number, we need to explicitly convert it to an **integer**.

### 3. Output Specifications
*“Print **YES**, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and **NO** in the opposite case.”*

---

## The Logic Behind the Solution

We need the weight `w` to be divisible into two even numbers.
*   If `w = 8`, we can divide it into `4 + 4` or `2 + 6`. Both are even -> **YES**.
*   If `w = 7`, any division (`1+6`, `2+5`, `3+4`) will have at least one odd number -> **NO**.

We use the modulo operator `%` to check if a number is even (`w % 2 == 0`).  
**Watch out for the exception:** The number `2`. Although it is even, its only possible division is `1 + 1`, and 1 is odd. Therefore, for `w = 2`, the answer is **NO**.

[![Watermelon Codeforces](/codeforces-watermelon.png)](https://codeforces.com/problemset/problem/4/A)

### Final Code
```python
w = int(input())

if w > 2 and w % 2 == 0:
    print("YES")
else:
    print("NO")
```

---

## Testing our solution

To be sure, we run the tests in our terminal:

```bash
echo 8 | python3 watermelon.py
# >> YES

echo 2 | python3 watermelon.py
# >> NO

echo 77 | python3 watermelon.py
# >> NO

echo 100 | python3 watermelon.py
# >> YES
```

If everything returns the expected result, you can now upload your code to Codeforces. Don't be frustrated if it fails at first; mistakes are part of the learning process.

[![Codeforces Submit](/codeforces-submit.png)](https://codeforces.com/problemset/problem/4/A)

I hope this helps you take your first step into competitive programming! 😎

Written with 💛 by [**Gonza**](https://github.com/gonzagramaglia)

---

> **📚 Bibliography [1]:** [**How to read problem statements**](https://codeforces.com/blog/entry/62730) - Um_nik