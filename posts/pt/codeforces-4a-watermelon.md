---
title: "Como resolver o exercício 4 “A” do Codeforces"
date: "2026-01-23"
description: "Um guia detalhado para iniciantes sobre o exercício Watermelon, o 'Hello World' da programação competitiva"
---

# Como resolver o exercício 4 “A” do Codeforces

> 🔗 **Problema oficial:** [**Codeforces 4A - Watermelon**](https://codeforces.com/problemset/problem/4/A)

Algumas semanas atrás, comecei a levar a programação competitiva como um hobby sério. Um e-sport de fim de semana. Faço sessões de mais de 1 hora, tanto no sábado quanto no domingo, nas quais resolvo exercícios de dificuldade baixa-média. Eles me permitem *vibecodear* com a consciência desperta e tranquila.

O exercício **Watermelon** (ou Melancia, em português), é o *Hello World* do Codeforces. **Foi resolvido [por mais de 650.000 (seiscentos e cinquenta mil) usuários da plataforma](https://codeforces.com/problemset?order=BY_SOLVED_DESC).** E, além de ser fácil, neste post vou te ajudar a resolvê-lo sim o sim. Por isso, não há desculpa para não o fazer. Se alguém conseguiu resolvê-lo do lugar mais remoto da África graças a um satélite Starlink, você com este post também vai conseguir.

### O que você vai precisar?
*   Um **editor de código**.
*   Conhecimentos básicos de **matemática**.
*   Conhecimentos básicos de uma **linguagem de programação**.

Para programar sério, uso o editor [**Antigravity do Google**](https://antigravity.google/), mas para os exercícios uso o [**Sublime Text**](https://www.sublimetext.com/), pois me ajuda a concentrar melhor. E como linguagem escolhi Python, já que eventualmente quero usá-lo para criar scripts que automatizem tarefas de cibersegurança. Se você quer aprender ou reforçar as bases, recomenda-se esta [**aula magistral do CS50 de Harvard**](https://youtu.be/Rl0ludWTLxs).

> ⭐ **Recomendação:** [**CS50's Introduction to Programming with Python**](https://youtu.be/nLRL_NcnK-4)

Se você usa um sistema operacional como Linux ou MacOS e já tem experiência com o terminal, recomendo usá-lo para testar suas soluções. Se você tem Windows, recomendo usar um editor com terminal integrado como o Antigravity ou o [**Visual Studio Code**](https://code.visualstudio.com/). Se você ainda não se sente confortável com o terminal, acho que você deveria parar de ler este post e focar em alcançar esse estado de conforto, pois é uma habilidade fundamental.

---

## A Análise do Problema

Quando resolvi este exercício, [**pulei direto na piscina**](https://codeforces.com/profile/ciberportero). Fiz como pude, sem metodologia. Comecei fazendo um script básico de Python e pedi orientação ao ChatGPT sem que ele me desse a resposta. Hoje, após vários exercícios e participar de competições, entendo que **os problemas devem ser reduzidos a um modelo matemático simples**.

### 1. Extração de dados fundamentais
O problema diz:
*“After that the watermelon was weighed, and the scales showed **w kilos**.”*  
**💡 O importante:** Vamos trabalhar com uma variável `w` que representa os quilos.

Depois acrescenta:
*“...divide the watermelon in such a way that each of the two parts weighs **even number of kilos**, at the same time it is not obligatory that the parts are equal.”*  
**💡 O importante:** Temos que descobrir se é possível dividir o peso em duas partes, onde **ambas sejam pares**.

### 2. Especificações de Entrada (Input)
*“The first (and the only) input line contains integer number **w (1 ≤ w ≤ 100)**”*  
Isso significa que receberemos um número inteiro entre 1 e 100.

Em Python, capturamos assim:
```python
w = int(input())
```
**Nota:** Usamos `int()` porque a função `input()` no Python sempre retorna o que o usuário digita como uma **string (texto)**. Para realizar cálculos matemáticos com esse número, precisamos convertê-lo explicitamente para um **inteiro**.

### 3. Especificações de Saída (Output)
*“Print **YES**, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and **NO** in the opposite case.”*

---

## A Lógica Por Trás da Solução

Precisamos que o peso `w` seja divisível em dois números pares.
*   Se `w = 8`, podemos dividi-lo em `4 + 4` ou `2 + 6`. Ambos são pares -> **YES**.
*   Se `w = 7`, qualquer divisão (`1+6`, `2+5`, `3+4`) terá pelo menos um ímpar -> **NO**.

Usamos o operador de módulo `%` para saber se um número é par (`w % 2 == 0`).  
**Cuidado com a exceção:** O número `2`. Embora seja par, sua única divisão possível é `1 + 1`, e o 1 é ímpar. Portanto, para `w = 2` a resposta é **NO**.

[![Watermelon Codeforces](/codeforces-watermelon.png)](https://codeforces.com/problemset/problem/4/A)

### O Código Final
```python
w = int(input())

if w > 2 and w % 2 == 0:
    print("YES")
else:
    print("NO")
```

---

## Testando nossa solução

Para ter certeza, rodamos os testes no nosso terminal:

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

Se tudo retornar o esperado, você já pode enviar seu código para o Codeforces. Não se frustre se falhar no início, o erro faz parte do aprendizado.

[![Codeforces Submit](/codeforces-submit.png)](https://codeforces.com/problemset/problem/4/A)

Espero que isso te ajude a dar o seu primeiro passo na programação competitiva! 😎

Escrito com 💛 por [**Gonza**](https://github.com/gonzalogramagia)

---

> **📚 Bibliografia [1]:** [**How to read problem statements**](https://codeforces.com/blog/entry/62730) - Um_nik
