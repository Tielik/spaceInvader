const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

//ustawienie canvasu
canvas.width = 1024;
canvas.height = 750;

//licznikk ile gridow zostało wykorzystane przed zwiekszeniem prekości gridu
let gridCounter = 0
//zmiena do zmiany szybkosci poruszania Invaderów
let invaderSpeedBoost = 0
//zmienna która ma wsobie aktualnie graną melodie
let audio = new Audio();
//lista piosenek
const musicSources = [
    'music/arcade-party.mp3',
    'music/byte-blast-8-bit-arcade-music-background-music-for-video.mp3',
    'music/music-for-arcade-style-game.mp3',
    'music/pixel-fight-8-bit-arcade-music-background-music-for-video.mp3'
];
/*  
nazwa funkcji: playRandomMusic
argumenty: none
typ zwracany:none
informacje: odtwarza losową piosenkę z musicSources
autor: 6173
*/
function playRandomMusic() {
    const randomIndex = Math.floor(Math.random() * musicSources.length);
    const musicSource = musicSources[randomIndex];
    audio = new Audio(musicSource);
    audio.volume = 0.3;
    audio.play();
}
/*  
nazwa klasy: Player
konstruktor: none
typ zwracany:none
informacje: klasa reprezentujaca statek gracza
autor: 6173
*/
class Player {
    constructor() {
        //obrazy i ich scala
        this.shipImage = new Image();
        this.shipImage.src = 'img/ship/ship.png';
        const scale = 0.8;
        this.width = this.shipImage.width * scale;
        this.height = this.shipImage.height * scale;

        this.opacity = 1
        this.shipImage.onload = () => {
            const scale = 0.8;
            this.width = this.shipImage.width * scale;
            this.height = this.shipImage.height * scale;
            //pozycja startowa na canvasie
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height
            }
        }
        //szerokość klatki  
        this.animationWidth = 128
        //spreetsheet tarczy statku i licznik framów
        this.shipShield = new Image();
        this.shipShield.src = 'img/ship/shield.png'
        this.shieldFrames = 0
        //spreetsheet silników statku i licznik framów
        this.shipEngine = new Image();
        this.shipEngine.src = 'img/ship/engine.png'
        this.engineFrames = 0
        //spreetsheet wybuchu statku i licznik framów
        this.shipDestruction = new Image();
        this.shipDestruction.src = 'img/ship/destruction.png'
        this.destructionFrames = 0

        //dzwięk gdy statek zostanie uderzony
        this.playerHit = new Audio();
        this.playerHit.src = 'sounds/playerHit.wav';
        this.playerHit.volume = 0.5
        //flaga gdy gracz zostanie pokonany
        this.deafeated = false;

        //predkosc i kierunek ruchu
        this.velocity = {
            x: 0,
            y: 0
        }

        //obrot statku
        this.rotation = 0;

        //sprawdza czy przyciski są wcisnięte
        this.keys = {
            left: {
                pressed: false
            },
            right: {
                pressed: false
            },
            shoot: {
                pressed: false
            }
        }

        //hp gracza
        this.hp = {
            value: 0,
        }
        this.hpImg = new Image();
        this.hpImg.src = 'img/hp.png'

        //czy sprite statku jest wyłączone
        this.disablePlayer = false


    }

    /*
    nazwa funkcji: draw
    argumenty: none
    typ zwracany:none
    informacje: rysuje statek na canvasie
    autor: 6173
    */
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        ctx.rotate(this.rotation);


        ctx.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);

        if (!this.disablePlayer) {
            ctx.drawImage(this.shipImage, this.position.x, this.position.y, this.width, this.height);
        }
        this.playerAnimations();

        ctx.restore();

        this.showHP();
    }

    /*
    nazwa funkcji: playerAnimations
    argumenty: none
    typ zwracany:none
    informacje: zajmuje się liczeniem i rysuje animację statku
    autor: 6173
    */
    playerAnimations() {
        if (game.active) {
            //liczy frame silnika jesli przekroczy to liczy odnowa
            if (!this.deafeated) {
                if (this.engineFrames < 12) {
                    ctx.drawImage(this.shipEngine, this.engineFrames * this.animationWidth, 0, 128, 128, this.position.x, this.position.y, this.width, this.height);
                    this.engineFrames++

                } else this.engineFrames = 0;
                //liczy frame tarczy
                if (hit) {
                    if (this.shieldFrames < 16) {
                        ctx.drawImage(this.shipShield, this.shieldFrames * this.animationWidth, 0, 128, 128, this.position.x, this.position.y, this.width, this.height);
                        this.shieldFrames++
                    }
                    else {
                        this.shieldFrames = 0
                    }

                }
            }



        }
        //jesli zostanie pokonany to wyswietla animację wybuchu i wywołuje funkcję reset
        if (this.deafeated) {
            if (this.destructionFrames < 14) {
                ctx.drawImage(this.shipDestruction, this.destructionFrames * this.animationWidth, 0, 128, 128, this.position.x, this.position.y, this.width, this.height);
                if (frames % 6 === 0) {
                    this.destructionFrames++
                    this.disablePlayer = true
                }
            }
            else {
                reset();
            }

        }

    }

    /*
    nazwa funkcji: showHP
    argumenty: none
    typ zwracany:none
    informacje: wyswietla hp gracza
    autor: 6173
    */
    showHP() {

        ctx.drawImage(this.hpImg, 0, this.hp.value * 16, 32, 16, 5, 30, 100, 50);

    }
    /*
    nazwa funkcji: hitTaker
    argumenty: none
    typ zwracany:none
    informacje: Zajmuje się stanem zycia gracza.
    autor: 6173
    */
    hitTaker() {
        soundsPlayer('playerHit');
        createParticles({
            object: player,
            color: 'red',
            fades: true
        })
        hit = true

        player.hp.value += 1
        //jezli gracz straci hp odpala się animacja wybuchu i koniec
        if (player.hp.value > 4) {
            game.over = true;
            player.deafeated = true
        }
        setTimeout(() => {
            hit = false
        }, 3000)
    }

    /*
 nazwa funkcji: shoot
 argumenty: none
 typ zwracany:none
 informacje: strzela pocisk z pozycji gracza do przodu
 autor: 6173
 */
    shoot() {
        projectiles.push(new Projectile({
            position: { x: player.position.x + player.width / 2, y: player.position.y },
            velocity: { x: 0, y: -5 }
        }));
        soundsPlayer('shoot');
        player.keys.shoot.pressed = true;
    }

    /*
   nazwa funkcji: update
   argumenty: none
   typ zwracany:none
   informacje: aktualizuje pozycję stateku i jego ruch i obrot
   autor: 6173
   */
    update() {
        this.position.x += this.velocity.x;
        if (this.keys.left.pressed && this.position.x > 0) {
            this.velocity.x = -5;
            this.rotation = -.20;

        } else if (this.keys.right.pressed && this.position.x < canvas.width - this.width) {
            this.velocity.x = 5;
            this.rotation = .20;
        } else {
            this.velocity.x = 0;
            this.rotation = 0;
        }
        this.showHP();
    }


}


/*
nazwa Klasy: Invader
konstruktor: <obiekt:float,float> - <pozycja startowa Invadera>
typ zwracany:none
informacje: klasaa reprezentujaca  Invadera
autor: 6173
*/
class Invader {
    constructor(position) {
        //zmiena zawierajaca obraz,wielkosc, wysokosc jak i skale
        this.image = new Image();
        this.image.src = 'img/Alien.png';
        this.scale = 0.3;
        this.width = 100 * this.scale;
        this.height = 100 * this.scale;

        //pozycja, predkosc i kierunek
        this.position = {
            x: position.x,
            y: position.y
        }

        this.velocity = {
            x: 0,
            y: 0
        }

    }


    /*
    nazwa funkcji: draw
    argumenty: none
    typ zwracany:none
    informacje: zajmuje się rysowaniem Invadera
    autor: 6173
    */
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    /*
    nazwa funkcji: shoot
    argumenty: <tablica:InvaderProjectile>
    typ zwracany:none
    informacje: funkcja zajmuje się dodaniem pocisku invaderia do tablicy invaderProjectiles
    autor: 6173
    */
    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: { x: this.position.x + this.width / 2, y: this.position.y },
            velocity: { x: 0, y: 5 }
        }));
    }

    /*
    nazwa funkcji: update
    argumenty: none
    typ zwracany:none
    informacje: zaktualizuje pozycję Invadera
    autor: 6173
    */
    update(velocity) {
        this.position.x += velocity.x;
        this.position.y += velocity.y;
        this.draw();

    }

}

/*
nazwa Klasy: Grid
konstruktor: none
typ zwracany:none
informacje: klasaa reprezentujaca grida gdzie znajduja się invaderi
autor: 6173
*/
class Grid {

    constructor() {
        //pozycja starttowa 
        this.position = {
            x: 0,
            y: 0
        }

        //predkosc i kierunek
        this.velocity = {
            x: 3 + invaderSpeedBoost,
            y: 0
        }

        //tablica z invaderami
        this.invaders = [];

        // ilości kolumn i wierszy
        const columns = Math.floor(Math.random() * 5 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);

        //określenie szerokości grida
        this.width = columns * 35;

        //zapełnia tablice z invaderami
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    x: x * 35,
                    y: -y * 35
                }));
            }
        }

    }
    /*
    nazwa funkcji: changeDirection
    argumenty: none
    typ zwracany:none
    informacje: zmienia kierunek grida
    autor: 6173
    */
    changeDirection() {
        this.velocity.x = -this.velocity.x;
        this.velocity.y = 35;
    }

    /*
    nazwa funkcji: update
    argumenty: none
    typ zwracany:none
    informacje: zaktualizuje pozycję grida
    autor: 6173
    */
    update() {
        this.position.x += this.velocity.x;
        this.velocity.y = 0;

        //jeśli dotknie krawędzi canvasu to spada i zmienia kierunek na osi x
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.changeDirection();
        }
    }
}

/*
nazwa funkcji: GridChanger
argumenty: grid z tablicy grids
typ zwracany:none
informacje: zmienia rozmiary konkretnego grida
autor: 6173
*/
function GridChanger(grid) {
    const firstInvader = grid.invaders[0];
    const lastInvader = grid.invaders[grid.invaders.length - 1];
    grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width + 10;
    grid.position.x = firstInvader.position.x;
}

/*
nazwa funkcji: gridCreator
argumenty: none
typ zwracany:none
informacje: tworzy gridam jeśli są spełnione warunki
autor: 6173
*/
function gridCreator() {
    if (frames > changeToSpawn) {
        gridCounter++;

        grids.push(new Grid());
        frames = 0;
        if (game.dificulty === 'hard') {
            changeToSpawn = Math.floor(Math.random() * (1400 - 1000 + 1) + 1000);

            if (gridCounter > 3) {
                gridCounter = 0;
                invaderSpeedBoost += 1;
            }
        }
        else {
            changeToSpawn = Math.floor(Math.random() * (1700 - 1300 + 1) + 1300);


            if (gridCounter > 5) {
                gridCounter = 0;
                invaderSpeedBoost += 1;
            }

        }
    }
}

/*
nazwa Klasy: Projectile
konstruktor: <obiekt{float,float},obiekt{float,float}> - <{pozycja startowa pocisk},{kierunek pocisku}}>
typ zwracany:none
informacje: klasaa reprezentujaca pocisk gracza
autor: 6173
*/
class Projectile {

    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    /*
    nazwa funkcji: draw
    argumenty: none
    typ zwracany:none
    informacje: zajmuje się rysowaniem pocisku
    autor: 6173
    */
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }

    /*
    nazwa funkcji: update
    argumenty: none
    typ zwracany:none
    informacje: zaktualizuje pozycję pocisku
    autor: 6173
    */
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    remover(projectile) {
        if (projectile.position.y < 0 || projectile.position.y > canvas.height) {
            projectiles.splice(projectiles.indexOf(projectile), 1);
        }
    }

}

/*
nazwa Klasy: InvaderProjectile
konstruktor: <obiekt{float,float},obiekt{float,float}> - <{pozycja startowa pocisk},{kierunek pocisku}}>
typ zwracany:none
informacje: klasaa reprezentujaca pocisk invadera
autor: 6173
*/
class InvaderProjectile {

    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 10;
    }


    /*
    nazwa funkcji: draw
    argumenty: none
    typ zwracany:none
    informacje: zajmuje się rysowaniem pocisku
    autor: 6173
    */
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, 20);
    }

    /*
    nazwa funkcji: update
    argumenty: none
    typ zwracany:none
    informacje: zaktualizuje pozycję pocisku
    autor: 6173
    */
    update() {
        this.draw();
        this.position.y += this.velocity.y;
    }
    checker(invaderProjectile) {
        if (invaderProjectile.position.y < canvas.height) {
            invaderProjectile.update();
        }
        else {
            invaderProjectiles.splice(invaderProjectiles.indexOf(invaderProjectile), 1);
        }
    }

}

/*
nazwa Klasy: Particle
konstruktor: <obiekt{float,float},obiekt{float,float},float,string,float> - <{pozycja startowa pocisk},{kierunek pocisku},promien ,barwa ,czy znika>
typ zwracany:none
informacje: klasaa reprezentujaca particla
autor: 6173
*/
class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    /*
    nazwa funkcji: draw
    argumenty: none
    typ zwracany:none
    informacje: zajmuje się rysowaniem particla
    autor: 6173
    */
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    /*
    nazwa funkcji: update
    argumenty: none
    typ zwracany:none
    informacje: zaktualizuje pozycję particla i jeśli ma znikać to też przezroczystość
    autor: 6173
    */
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.fades == true) {   //jeśli particl ma znikać to per frame robi się bardziej przezroczysty        
            this.opacity -= 0.01;
        }
    }
}

//zmienna zawierająca punkty i funkcje do rysowania punktów
let score = {
    value: 0,
    /*
    nazwa funkcji: draw
    argumenty: none
    typ zwracany:none
    informacje: zajmuje się rysowaniem zdobytych punktów na canvasie
    autor: 6173
    */
    draw() {
        ctx.fillStyle = 'white';
        ctx.font = '30px Public Pixel';
        ctx.fillText(`Score: ${score.value}`, 10, 30);
    }
};

//zmienna zawierająca klasę Player
let player = new Player();
//array zawierająca pociski
let projectiles = [];
//array zawierająca gridy
let grids = [new Grid()];
//array zawierająca invadery
let invaderProjectiles = [];
//array zawierająca particles
let particles = [];

//licznik klatek
let frames = 0;
//licznik klatek do spawnu
let changeToSpawn = 1200;
//zmienna booleana informujaca o trafieniu w gracza
let hit = false
//zmienna informujaca o stanie gry
let game = {
    over: false,
    active: false, //if false then is main menu tryb
    dificulty: 'easy'
}
//zmienna informujaca o stanie instrukcji
let instructionShow = false
//zmienna informujaca o stanie pause
let pause = false


//zmienna zajmująca się wyswietlania menu
let showStartBtn = true
//zmienna informujaca o wybranym elemencie z menu
let menuOption = 0;
//zmienna zawierająca obrazek do instrukcji
const instructions = new Image();
instructions.src = 'img/instruction/keyboard.png';


/*
nazwa funkcji: soundsPlayer
argumenty: <string> - <nazwa audio>
typ zwracany:none
informacje: zajmuje się odtawiając dzwieki
autor: 6173
*/
function soundsPlayer(src) {
    switch (src) {
        case 'shoot':
            const shoot = new Audio();
            shoot.src = 'sounds/shoot.wav';
            shoot.volume = 0.4;
            shoot.play();
            break;
        case 'invaderDie':
            const invaderDie = new Audio();
            invaderDie.src = 'sounds/invaderDie.wav';
            invaderDie.volume = 0.3;
            invaderDie.play();
            break;
        case 'playerHit':
            player.playerHit.play(); //playerHit jest zdefiniowany w klasie Player, gdyż dzwięk hitu niepowinien się powtarzać
            break;
    }
}

/*
nazwa funkcji: createStars
argumenty: none
typ zwracany:none
informacje: tworzy particle, które wykorzystuje się do tworzenia gwiazd
autor: 6173
*/
function createStars() {
    for (let i = 0; i < 100; i++) {
        particles.push(
            new Particle({
                position: {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height
                },
                velocity: {
                    x: 0,
                    y: 0.1
                },
                radius: Math.random() * 3,
                color: 'white',
                fades: false // dzięki temu particl nie zniknie
            })
        )
    }
}
function starReposition(particle) {
    if (!particle.fades && particle.position.y > canvas.height) {
        particle.position.x = Math.random() * canvas.width
        particle.position.y = -particle.radius
    }
}
createStars()

/*
nazwa funkcji: createParticles
argumenty: <object,string,boolean> - <obiekt któremy tworzyć particle effetct,kolor,jeżeli ma zniknąć>
typ zwracany:none
informacje: tworzy particle, które wykorzystuje się do tworzenia particle effect
autor: 6173
*/
function createParticles({ object, color, fades }) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color || '#BAA0DE',
            fades: fades
        }))
    }
}
function particleDeleter(particle) {
    if (particle.opacity <= 0) {
        setTimeout(() => {
            particles.splice(particles.indexOf(particle), 1);
        }, 0)
    }
}


/*
nazwa funkcji: clear
argumenty: none
typ zwracany:none
informacje: wyczyszcza canvas
autor: 6173
*/
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/*
nazwa funkcji: reset
argumenty: none
typ zwracany:none
informacje: resetuje gre
autor: 6173
*/
function reset() {
    //wyczyscza zmienne globalne
    player = new Player();
    projectiles = [];
    grids = [new Grid()];
    invaderProjectiles = [];
    particles = [];


    frames = 0;
    changeToSpawn = 1200;

    hit = false

    game = {
        over: false,
        active: false,
        dificulty: 'easy'
    }

    instructionShow = false



    gridCounter = 0
    invaderSpeedBoost = 0

    createStars();
    //zapisuje poprzedni wynik
    const oldScores = score.value
    score.value = 0

    pause = false


    displayMainMenu(oldScores);

}


/*
nazwa funkcji: pointGiver
argumenty: none
typ zwracany:none
informacje: przyznaje punkty w zaleznosci od wybranego poziomu trudnosci
autor: 6173
*/
function pointGiver() {
    if (game.dificulty === 'easy') {
        score.value += 50
    }
    else if (game.dificulty === 'hard') {
        score.value += 100
    }
}

/*
nazwa funkcji: displayMainMenu
argumenty: none
typ zwracany:none
informacje: wyswietla menu glowne
autor: 6173
*/
function mainMenuText() {
    ctx.font = '15px Public Pixel';
    ctx.fillText('Press SPACE click M-to play music', canvas.width / 2 - 200, canvas.height / 2 + 200);

    ctx.font = '20px Public Pixel';

    if (showStartBtn || menuOption != 0)
        ctx.fillText('Start', canvas.width / 2 - 200, canvas.height / 2 + 50);
    if (showStartBtn || menuOption != 1)
        ctx.fillText(`Change difficulty ${game.dificulty}`, canvas.width / 2 - 200, canvas.height / 2 + 100);
    if (showStartBtn || menuOption != 2)
        ctx.fillText('Instructions', canvas.width / 2 - 200, canvas.height / 2 + 150);
}
/*
nazwa funkcji: instructions
argumenty: none
typ zwracany:none
informacje: wyswietla instrukcje
autor: 6173
*/
function instructionsPanel() {
    ctx.font = '20px Public Pixel';
    ctx.fillText('ESC while in game to pause', canvas.width / 2 - 350, canvas.height / 2 + 300);

    ctx.fillText('Press SPACE to go back to main menu', canvas.width / 2 - 350, canvas.height / 2 + 50);

    ctx.fillText('Objective: Survive you have 5 hp', canvas.width / 2 - 350, canvas.height / 2 + 80);

    ctx.fillText('Arrow keys( <-  ->) to move, space to shoot', canvas.width / 2 - 350, canvas.height / 2 + 100);


    ctx.drawImage(instructions, 0, 320, instructions.width, instructions.height, canvas.width / 2 - 200, canvas.height / 2 + 130, 300, 300);
}
/*
nazwa funkcji: displayMainMenu
argumenty: <int> - <liczba punktów z poprzedniego meczu>
typ zwracany:none
informacje: wyswietla menu gry
autor: 6173
*/
function displayMainMenu(score) {
    clear();
    if (game.active) return
    particles.forEach(particle => particle.update());
    //jeśli score nie jest pusty wyswietla go
    if (score != null) {
        ctx.font = '20px Public Pixel';
        ctx.fillText(`Last game Score: ${score}`, canvas.width / 2 - 200, canvas.height / 2 - 100);
    }

    //wyświetla tytuł gry
    ctx.fillStyle = 'white';
    ctx.font = '40px Public Pixel';
    ctx.fillText('Space Invaders', canvas.width / 2 - 350, canvas.height / 2);

    if (!instructionShow) {
        mainMenuText();
    }
    else {
        instructionsPanel();
    }

    setTimeout(() => {
        if (showStartBtn)
            showStartBtn = false
        else
            showStartBtn = true
        displayMainMenu(score)
    }, 200)
}

/*
nazwa funkcji: displayPause
argumenty: none
typ zwracany:none
informacje: wyswietla menu pauzy
autor: 6173
*/
function displayPause() {

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px Public Pixel';
    ctx.fillText('Pause', canvas.width / 2 - 100, canvas.height / 2);

    ctx.font = '20px Public Pixel';
    ctx.fillText('Press SPACE to resume game', canvas.width / 2 - 200, canvas.height / 2 + 50);
    ctx.fillText('Press ESC to return to main menu', canvas.width / 2 - 200, canvas.height / 2 + 80);

}
//gra zaczyna się w main menu
displayMainMenu();

/*
nazwa funkcji: gameLoop
argumenty: none
typ zwracany:none
informacje: Głowny loop gry
autor: 6173
*/
function gameLoop() {
    //jesli gra nie jest aktywna to zatrzymuje loop
    if (!game.active) return;
    requestAnimationFrame(gameLoop);
    clear();
    score.draw();//wyświetla punkty gracza
    particles.forEach(particle => {
        particleDeleter(particle);
        starReposition(particle);
        particle.update();
    })
    //rysuje i update pozycje gracza
    player.draw();
    player.update();

    invaderProjectiles.forEach(InvaderProjectile => {
        InvaderProjectile.checker(InvaderProjectile);

        //collision detection with player
        if (
            player.position.y + 5 <= InvaderProjectile.position.y &&
            player.position.y + 5 + player.height - 15 >= InvaderProjectile.position.y &&
            player.position.x + 20 + player.width - 40 >= InvaderProjectile.position.x &&
            player.position.x + 20 <= InvaderProjectile.position.x + InvaderProjectile.width

        ) {

            if (!hit) {
                player.hitTaker();
            }

        }
    })


    //rysuje i update pozycje przeciwników
    projectiles.forEach(projectile => {
        projectile.update();
        projectile.remover(projectile);
    })

    //literuje przez gridy w array grids
    grids.forEach(grid => {
        grid.update();
        grid.invaders.forEach(invader => {
            //update invader position
            invader.update({
                x: grid.velocity.x,
                y: grid.velocity.y
            });

            projectiles.forEach(projectile => {
                //kolizja czy gracz trafił
                if (projectile.position.y < invader.position.y + invader.height
                    && projectile.position.x > invader.position.x
                    && projectile.position.x < invader.position.x + invader.width) {
                    //tworzy particle effect dla invadera
                    createParticles({
                        object: invader,
                        color: 'white',
                        fades: true
                    })
                    //odtwarza dzwięk śmierci invadera
                    soundsPlayer('invaderDie');

                    //podaruje punkty dla gracza
                    pointGiver();
                    //usuwa invadera
                    setTimeout(() => {
                        grid.invaders.splice(grid.invaders.indexOf(invader), 1);
                    })

                    //usuwa pocisk z array
                    projectiles.splice(projectiles.indexOf(projectile), 1);

                    //sprawdza czy grid nie jest pusty
                    if (grid.invaders.length > 0) {
                        GridChanger(grid);
                    } else {
                        grids.splice(grids.indexOf(grid), 1);
                    }
                }
            })
            //jeśli invader dojdzie do poziomu gracza koniec gry
            if (invader.position.y >= player.position.y) {
                game.over = true;
                player.deafeated = true
            }

        })
    })
    //wybiera który invader z grida powinien strzelac
    grids.forEach(grid => {
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }
    })

    //jeśli frames jest wieksze od zmiennej changeToSpawn to tworzy nowy grid
    //szansa na kolejny zalezy od poziomu trudności 
    gridCreator();
    frames++;

}

/*
nazwa funkcji: pauseKeyBinding
argumenty: none
typ zwracany:none
informacje: Funkcja obsługuje wcisniecie klawisza w menu pauzy
autor: 6173
*/
function pauseKeyBinding(event) {
    switch (event) {
        case 'Space':
            pause = false
            game.active = true
            gameLoop();
            return
        case 'Escape':
            if (pause) {
                reset();
                return
            }
            break;
    }
}
function changeDificulty() {
    if (game.dificulty === 'easy')
        game.dificulty = 'hard'
    else
        game.dificulty = 'easy'
}
function startGame() {
    game.active = true
    player.hp.value = 0
    gameLoop();
}
function instructionpPanelShow() {
    if (instructionShow) instructionShow = false
    else instructionShow = true

}

/*
nazwa funkcji: mainMenuKeyBinding
argumenty: none
typ zwracany:none
informacje: Funkcja obsługuje wcisniecie klawisza w menu głości
autor: 6173
*/
function mainMenuKeyBinding(event) {
    switch (event) {
        case 'Space':
            if (menuOption === 0) {
                startGame()

            }
            if (menuOption === 1) {
                changeDificulty();
            } else {
                instructionpPanelShow();

            }
            break;
        case 'ArrowDown':
            if (menuOption < 2)
                menuOption += 1;
            break;
        case 'ArrowUp':
            if (menuOption > 0)
                menuOption -= 1;
            break;
    }
}

/*
nazwa funkcji: pausePanelShow
argumenty: none
typ zwracany:none
informacje: Funkcja wyswietla panel pauzy
autor: 6173
*/
function pausePanelShow() {
    game.active = false
    pause = true
    displayPause();
}

/*
nazwa funkcji: pasuePanelDisapear
argumenty: none
typ zwracany:none
informacje: Funkcja zmienia zmienna pause by móc zamknąć panel pauzy
autor: 6173
*/
function pasuePanelDisapear() {
    if (pause) {
        pause = false
    }
}

/*
nazwa funkcji: mainGameKeyBinding
argumenty: none
typ zwracany:none
informacje: Funkcja obsługuje wcisniecie klawisza w głownej grze
autor: 6173
*/
function mainGameKeyBinding(event) {
    switch (event) {
        case 'ArrowLeft':
        case 'KeyA':
            player.keys.left.pressed = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            player.keys.right.pressed = true;
            break;
        case 'Space':
            //shoot
            if (player.keys.shoot.pressed) return
            player.shoot();
            pasuePanelDisapear();
            break;
        case 'Escape':
            pausePanelShow();
            break;
    }
}

//słucha kiedy gracz wcisnie klawisz
addEventListener('keydown', (event) => {
    //muzyka
    if (event.code === 'KeyM') {
        if (audio.paused) {
            playRandomMusic();

        } else {
            audio.pause();
        }
    }
    //pauza input taker
    if (pause) {
        pauseKeyBinding(event.code)
    }
    //main menu input taker
    if (!game.active && !game.over) {
        mainMenuKeyBinding(event.code)
    }
    //main game input taker
    if (game.active && !game.over) {
        mainGameKeyBinding(event.code)
    }
})
//słucha kiedy gracz puści konkretny przycisk na klawiaturze
addEventListener('keyup', (event) => {
    if (!game.active) return
    switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
            player.keys.left.pressed = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            player.keys.right.pressed = false;
            break;
        case 'Space':
            //shoot
            player.keys.shoot.pressed = false;
            break;
    }
})