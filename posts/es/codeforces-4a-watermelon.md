---
title: "Cómo resolver el ejercicio 4 “A” de Codeforces"
date: "2026-01-23"
description: "Una guía detallada para principiantes sobre el ejercicio Watermelon, el 'Hello World' de la programación competitiva"
---

# Cómo resolver el ejercicio 4 “A” de Codeforces

> 🔗 **Problema oficial:** [**Codeforces 4A - Watermelon**](https://codeforces.com/problemset/problem/4/A)

Hace unas semanas comencé a tomarme a la programación competitiva como un hobby serio. Un e-sport de fin de semana. Hago sesiones de 2 o 3 horas los fines de semana, en las que resuelvo [**ejercicios de dificultad 1000**](https://codeforces.com/problemset?order=BY_SOLVED_DESC&tags=1000-1000). Lo que me permite *vibecodear* con la conciencia despierta y tranquila.

El ejercicio **Watermelon** (o Sandía, en su traducción al español), es el *Hello World* de Codeforces. **[Fue resuelto por más de 650.000 (seiscientos cincuenta mil) usuarios de la plataforma](https://codeforces.com/problemset?order=BY_SOLVED_DESC).** Y, sobre que es fácil, en este post te voy a ayudar a resolverlo sí o sí. Por lo que no hay excusa para no hacerlo. Si Pepito lo pudo resolver desde el lugar más recóndito de África gracias a un satélite de Starlink, vos con este post también vas a poder. 

### ¿Qué vas a necesitar?
*   Un **editor de código**.
*   Conocimientos básicos de **matemática y algoritmos**.
*   Conocimientos básicos de un **lenguaje de programación**.

Para programar en mi día a día uso el editor [**Antigravity de Google**](https://antigravity.google/), pero para los ejercicios de Codeforces uso [**Sublime Text**](https://www.sublimetext.com/), ya que me ayuda a concentrarme mejor. Y como lenguaje elegí Python, ya que quiero usarlo regularmente para crear scripts que automaticen tareas de ciberseguridad. Si querés aprender o reforzar sus bases te recomiendo esta [**clase magistral del CS50 de Harvard**](https://youtu.be/Rl0ludWTLxs).

> ⭐ **Recomendación:** [**CS50's Introduction to Programming with Python**](https://youtu.be/nLRL_NcnK-4)

Si usás un sistema operativo como Linux o MacOS y ya tenés cancha con la terminal, te recomiendo usarla para testear tus soluciones. Si tenés Windows, te recomiendo usar un editor con terminal integrada como Antigravity o [**Visual Studio Code**](https://code.visualstudio.com/). Si todavía no te sentís cómodo/a con la terminal creo que deberías dejar de leer este post y enfocarte en lograr ese estado de comodidad, ya que es una skill fundamental.

---

## El Análisis del Problema

Cuando resolví este ejercicio [**me tiré directamente a la pileta**](https://codeforces.com/profile/ciberportero). Lo hice como pude, sin seguir ninguna metodología. Arranqué haciendo un script básico de Python y le pedí a ChatGPT que me guiara sin llegar a darme la respuesta. Hoy, luego de haber resuelto varios ejercicios y de haber participado en competencias, entiendo que **los problemas deben reducirse a un modelo matemático simple**.

### 1. Extracción de datos clave
El problema dice:
*“After that the watermelon was weighed, and the scales showed **w kilos**.”*  
**💡 Lo importante:** Vamos a trabajar con una variable `w` que representa los kilos.

Luego agrega:
*“...divide the watermelon in such a way that each of the two parts weighs **even number of kilos**, at the same time it is not obligatory that the parts are equal.”*  
**💡 Lo importante:** Hay que averiguar si es posible dividir el peso en dos partes, donde ambas sean pares.

### 2. Especificaciones de Entrada (Input)
*“The first (and the only) input line contains integer number **w (1 ≤ w ≤ 100)**”*  
Esto significa que vamos a recibir un número entero entre 1 y 100.

En Python, lo capturamos así:
```python
w = int(input())
```
**Nota:** Usamos `int()` porque la función `input()` en Python siempre devuelve lo que el usuario escribe como un **string**. Por lo cual, para poder hacer cálculos matemáticos con ese número, necesitamos convertirlo explícitamente a un **entero**.

### 3. Especificaciones de Salida (Output)
*“Print **YES**, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and **NO** in the opposite case.”*

---

## La Lógica Detrás de la Solución

Necesitamos que el peso `w` se divida en dos números pares.  
*   Si `w = 8`, podemos dividirlo en `4 + 4` o `2 + 6`. Ambos son pares -> **YES**.
*   Si `w = 7`, cualquier división (`1+6`, `2+5`, `3+4`) tendrá al menos un impar -> **NO**.

Usamos el operador de módulo `%` para saber si un número es par (`w % 2 == 0`).  
**Ojo con la excepción:** El número `2`. Aunque es par, su única división posible es `1 + 1`, y el 1 es impar. Por lo tanto, para `w=2` la respuesta es **NO**.

[![Watermelon Codeforces](/codeforces-watermelon.png)](https://codeforces.com/problemset/problem/4/A)

### El Código Final
```python
w = int(input())

if w > 2 and w % 2 == 0:
    print("YES")
else:
    print("NO")
```

---

## Testeando nuestra solución

Para estar seguros, corremos los tests en nuestra terminal:

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

Si todo devuelve lo esperado, ya podés subir tu código a Codeforces. No te frustres si falla al principio, el error es parte del aprendizaje.

[![Codeforces Submit](/codeforces-submit.png)](https://codeforces.com/problemset/problem/4/A)

¡Espero que esto te ayude a dar tu primer paso en la programación competitiva! 😎


Escrito con 💛 por [**Gonza**](https://github.com/gonzagramaglia)

---

> 📚 **Bibliografía [1]:** [**How to read problem statements**](https://codeforces.com/blog/entry/62730) - Um_nik
