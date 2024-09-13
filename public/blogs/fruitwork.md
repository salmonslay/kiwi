---
title: About fruitwork and its development
date: 2023-04-06T12:46:31+00:00
updated: 2024-09-13T12:46:31+00:00
draft: false
author: Sofia Lindgren
tags: [fruitwork, project, sdl, c++]
summary: fruitwork is a game engine I created in C++ using the Simple DirectMedia Layer (SDL) library. It was made during my C/C++ course at Stockholm University, and is built around the idea of components and scenes. It has support for physics, pixel-perfect collision and a lot of flexibility.
thumbnail: /img/fruitwork-1.webp
---

fruitwork is a game engine written in C++ using the Simple DirectMedia Layer (SDL) library. It took around a month to write and was made during my C/C++ course at Stockholm University. I've always enjoyed low-level programming and wanted to try my hand at making a game engine, so this was a great opportunity to do so!

## Features

Since I enjoy writing low-level code I spent a lot of time making sure that the game engine had a lot of flexibility and components were easy to extend, add and use.

### Scenes

One of the first things I implemented was the scene system. I knew that I would like to have different states in my game, so scenes were a natural choice. Scenes are essentially just a collection of components, and can be switched between using the Session class. The Session class also handles the main game loop, and is the only class that needs to be instantiated in order to run the game.

Having a solid scene system allowed me to easily create lots of testing scenes for my components which made development a lot easier. Below are two of my many test scenes; one for the ConfettiCannon component and one for the collision system. In these scenes, yellow banana means rectangle collision, and red banana means pixel-perfect collision.

<video width="40%" height="auto" autoplay loop controls>
    <source src="../img/fruitwork/confetti.mp4">
</video>

<video width="40%" height="auto" autoplay loop controls>
<source src="../img/fruitwork/collision.mp4">
</video>

### Components

fruitwork is built around the idea of components. Every single component has a position, rotation and scale, and can be added to a scene. Components can also be added to other components, allowing for a tree-like structure. This makes it easy to create complex components by combining simpler ones. Below is a list of all the components that are currently implemented.

- Component
    - Sprite
        - AnimatedSprite
        - CoveringSprite
        - ResponsiveSprite
    - Button
        - ImageButton
    - Shape
        - Circle
        - Rectangle
    - ConfettiCannon
    - InputField
    - Label
- Scene
    - TestScene

### Physics

Every single component can have a physics body attached to them, giving them both a collision body and the ability to be affected by gravity / other forces. Collision can either be done using a rectangle or pixel-perfect collision, where rectangle collisions support a threshold parameter to allow for some overlap, and pixel-perfect collisions support an alpha parameter to allow for some transparency.

<pre style="background-color: #22272e;">
<code class="language-cpp">
bool rectCollidesWith(const Sprite *other, int threshold = 0) const;

bool pixelCollidesWith(const Sprite *other, Uint8 alpha = 10) const;
</code>
</pre>

### Example implementation

To put my game engine to the test I decided to implement [osu!catch](https://osu.ppy.sh/home) in it, which is a rhythm game where you catch fruit that falls down the screen. My fruitwork implmentation has support for both osu! and osu!catch beatmaps (levels), and the source code can be found on [GitHub](https://github.com/salmonslay/yuzu-catch).

<iframe width="553" height="300" src="https://www.youtube.com/embed/iygYWxroH_8" title="Desktop 2023.01.02 - 12.45.10.08" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>