const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
ctx.fillStyle = '#005';
ctx.fillRect(0, 0, canvas.width, canvas.height);

class Particle {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        this.vx = 0;
        this.vy = 0;
        this.jump = false;
        this.left = false;
        this.gravity = 0;

        this.gravitySpeed = 0.1;
    }
    draw() {
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    move() {
        this.x += this.vx;
        this.y += this.vy;
        // this.vy += 1;
        this.vy += this.gravity + this.gravitySpeed;
        // this.vy *= 0.5;
        // this.detectWalls();
    }
    detectWalls() {
        if (this.x + this.w > canvas.width) {
            this.vx -= 1;
        }
        if (this.x < 0) {
            this.vx += 1;
        }
        if (this.y < 0) {
            this.vy = 0;
        }
        if (this.y + this.h > canvas.height) {
            this.vy = 0;
        }
    }
    detectPlatform(platform) {
        if (this.y + this.h > canvas.height - platform.h) {
            this.vy = 0;
            this.jump = false;
        }
        else {
            this.jump = true;
        }
    }
}

function collision(a, b) {
    return a.x < b.x + b.w && 
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

const platform = {
    x: 0,
    y: canvas.height - 100,
    w: canvas.width,
    h: 100,
    c: '#557'
}

let limit;
let points = 0;
let particles = [];
let squares = [];
let particlesE = [];
const particle = new Particle(canvas.width / 2, canvas.height / 2, 25, 25, '#fff')

function randomC() {
    return `hsl(${Math.random() * 255}, 50%, 50%)`;
}
function spawnEnemies() {
    squares.push(new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height - (platform.y + platform.h),
        50,
        50,
        `hsl(${Math.random() * 255}, 100%, 100%)`
    ));
}

function spawnSquares() {
    squares.push(new Particle(
        Math.random() < 0.5 ? 0 : canvas.width - 10,
        platform.y - 30,
        10,
        30,
        randomC()
    ));
}

setInterval(() => {
    spawnSquares();
    side();
}, 2000)

function checkCollision() {
    for (const square of squares) {
        for (p of particles) {
            if (collision(p, square)) {
                points++;
                // squares.splice(squares.indexOf(square),1);
                square.h -= 10;
                square.w -= 1;
                effect(square);
                if (square.h < 10) {
                    squares.splice(squares.indexOf(square), 1);
                }
            }
        }
    }
}

function effect(square) {
    let number = 0;
    while (number <= 30) {
        particlesE.push(new Particle(
            square.x,
            square.y,
            2,
            2,
            randomC()
        ))
        number++;
    }
}
function side() {
    for (const square of squares) {
        if (square.x <= 0) {
            square.left = true;
        }
        if (square.x >= canvas.width - square.w) {
            square.left = false;
        }
    }
}

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function particleEffect() {
    for (p of particlesE) {
        p.draw();
        p.move();
        p.vx = randomIntFromRange(-5, 5);
        p.vy = randomIntFromRange(-5, 5);
    }
    if (particlesE.length > 20) {
        particlesE.shift()
    }
}
let blocks = [];

function createParticles() {
    let number = 0;
    while (number <= 30) {
        blocks.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * (canvas.height - platform.h),
            1,
            5,
            randomC()
        ))
        number++;
    } 
}
createParticles();

function animate() {
    limit--;
    ctx.fillStyle = 'rgba(0, 0, 100, .5)';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    particle.draw();
    particle.move();
    particle.detectPlatform(platform)
    ctx.fillStyle = platform.c;
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = "#ffffff"
    ctx.font = "25px arial";
    ctx.fillText("points: " +points, 50, 50);
    particles.forEach(p => {
        p.draw();
        p.move();
        if (particle.left) {
            p.vx -= 0.5;
        }
        else {
            p.vx += 0.5;
        }
        p.vy = 0.1;

        if (limit <= 0) {
            particles.splice(particles.indexOf(p), 1);
            limit = 50;
        }
    })
    particleEffect();
    squares.forEach(square => {
        square.draw();
        square.move();
        square.detectPlatform(platform)
        if (square.left) {
            square.vx = 1;
        }
        else {
            square.vx = -1;
        }
        if (squares.length > 10) {
            squares.shift();
        }
    })
    let f = requestAnimationFrame(animate);
    checkCollision();
    if (collided()) {
        cancelAnimationFrame(f);
    }
    blocks.forEach(block => {
        block.draw()
        block.move()
        block.vy = 1;
        if (block.y > canvas.height / 2 + 100) {
            block.y = 0;
        }
    })
}

animate();

function collided() {
    for (let square of squares) {
        if (collision(square, particle)) {
            return true;
        }
    }
    return false;
}

window.addEventListener('keydown', function(e) {
    const key = e.keyCode;
    if (key === 37)  {
        if (particle.jump) {
            particle.vx -= 25;
        }
        particle.vx -= 25;
        particle.vx *= 0.1;
        particle.left = true;
    }
    if (key === 39) {
        if (particle.jump) {
            particle.vx = 25;
        }
        particle.vx += 25;
        particle.vx *= 0.1;
        particle.left = false;
    }
    if (key === 38) {
        if (particle.jump) {
            return;
        }
        else {
            particle.vy = -5;
            particle.vy += 2;
        }
    }
    if (key === 40) particle.vy = 1;
    if (key === 13) {
        limit = 50;
        if (particles.length > 3) {
            particles.shift();
        }
        particles.push(new Particle(particle.x + (particle.w / 2), particle.y, 10, 2, randomC()));
    }
})
addEventListener('keyup', function(e) {
    particle.vx = 0;
})