const score = document.querySelector(".score");
const startScreen = document.querySelector(".startScreen");
const gameArea = document.querySelector(".gameArea");
const fuel = document.querySelector(".fuel");
const fuel_valor = document.querySelector(".fuel_valor");
const speed = document.querySelector(".speed");
const progress = document.querySelector(".progress");
const carGame = document.querySelector(".carGame");

const opening = new Audio('./music/Race Start.mp3');
const GameOver = new Audio('./music/Game Over.mp3');
const win = new Audio('./music/Finish Line.mp3');
const explosion = new Audio('./music/explosion.mp3');
const oil = new Audio('./music/oil.wav');
const fondo = new Audio('./music/fondo.mp3')

let car;
let helped = false;
let progressValue = 0;

startScreen.addEventListener("click", start);

let game = {
  state: "idle",
  driftDirection: 0,
};

let player = { speed: 6.5, score: 0, fuel: 15, start: false };
let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  x: false,
  c: false,
};

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(e) {
  e.preventDefault();
  keys[e.key] = true;
}
function keyUp(e) {
  e.preventDefault();
  keys[e.key] = false;
}

function isCollide(a, b) {
  let aRect = a.getBoundingClientRect();
  let bRect = b.getBoundingClientRect();

  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function moveLines() {
  let lines = document.querySelectorAll(".lines");
  lines.forEach(function (item) {
    if (item.y >= 650) {
      item.y -= 740;
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function endGame(crashed = false) {

  fondo.pause();
  if (crashed) {
    game.state = "car-crashed";
    car.classList.add("is-crashed");

    GameOver.play();
    player.start = false;
    startScreen.classList.remove("hide");
    startScreen.innerHTML =
    `<br>
    <br>
    <br>
    <br>
    <h1>¡Game Over!</h1>
    <br>
    <h2>¡Tu carro ha sido destruido!</h2>
    <h3>Lograste sobrevivir por muy poco<h3>
    <h3>Pero con el se fueron todos tus ahorros...<h3>
    <h3>Solo te queda ser programador...<h3>
    <br>
    <h3>Tu puntuacion: ${Math.round(player.score)} </h3>
    <br>
    <br>Pulsa de nuevo para volver a empezar`;
    startScreen.style.justyfyContent = "center";
    startScreen.style.color = randomColor();

    startScreen.addEventListener("click", () => window.location.reload());
  }

  else if(progressValue >= 84){
    win.play();
    player.start = false;
    startScreen.classList.remove("hide");
    startScreen.innerHTML =
    `<img src="img/goal.png" alt="fuel" width="500px" height="300px">
    <br>
    <br>
    <h1>Congratulations!</h1>
    <br>
    <h2>¡Llegaste a la meta!</h2>
    <h3>Ganaste la carrera campeon.  <h3>
    <h3>La gloria y una botella de champagne te esperan.<h3>
    <h3>Creer en ti mismo ha dado sus frutos<h3>
    <br>
    <h3>tu puntuacion:${Math.round(player.score)}  </h3>
    <br>Pulsa de nuevo para volver a empezar`;
    startScreen.style.justyfyContent = "center";
    startScreen.style.color = randomColor();

    startScreen.addEventListener("click", () => window.location.reload());

  }
  else if (player.fuel<=0){
    game.state = "car-crashed";
    car.classList.add("is-crashed");

    GameOver.play();
    player.start = false;
    startScreen.classList.remove("hide");
    startScreen.innerHTML =
    `<br>
    <br>
    <br>
    <br>
    <h1>¡Game Over!</h1>
    <br>
    <h2>¡Te haz quedado sin gasolina!</h2>
    <h4>Has perdido la carrera, pero tu dignidad y auto estan intactos<h4>
    <h4>Siempre habra una segunda oportunidad<h4>
    <h3>Mientras tengas deseos de luchar...<h3>
    <br>
    <h3>Tu puntuacion: ${Math.round(player.score)} </h3>
    <br>
    <br>Pulsa de nuevo para volver a empezar`;
    startScreen.style.justyfyContent = "center";
    startScreen.style.color = randomColor();

    startScreen.addEventListener("click", () => window.location.reload());
    
  }
}

function moveEnemy(car) {
  let enemy = document.querySelectorAll(".enemy");
  enemy.forEach(function (item) {
    if (isCollide(car, item)) {
      explosion.play();
      game.state = 'car-crashed';
      car.classList.add("is-crashed");
      item.classList.add("is-crashed");
      
      setTimeout(() => {
        endGame(true);
      }, 800)
      
    }
    if (item.y >= 750) {
      setInitialItemPosition(item);
      item.style.backgroundImage = getRandom('car',3);
    }
    
    item.y += player.speed;
    item.style.top = item.y + "px";
  });

}

function moveHelp(car) {
  let help = document.querySelectorAll(".help");
  help.forEach(function (item) {

    if (isCollide(car, item)) {
      oil.play();
      player.fuel+= 10;
      player.score += 500;

      if(player.fuel > 100){
        player.fuel = 100;
      }
      item.remove();

      setTimeout(() => {
        helped= true;
        generateEntities()      
      }, 5000);
    }

    if (item.y >= 750) {
      setInitialItemPosition(item);
    }
    
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function moveSuper() {
  let superK = document.querySelectorAll(".super");
  superK.forEach(function (item) {
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function meta() {
  let meta = document.querySelectorAll(".meta");
  meta.forEach(function (item) {
      if (isCollide(car, item)) {
        setTimeout(() => {
          generateEntities() 
        }, 2000)    
      }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function moveOil(car) {
  let oil = document.querySelectorAll(".oil");
  oil.forEach(function (item) {
    if (isCollide(car, item)) {
      game.state = 'drift'
      car.classList.add("is-drift");

      if (!car.driftDirection) {
        car.driftDirection = game.driftDirection;
        car.style.setProperty('--direction', `${car.driftDirection}`);
      }
      setTimeout(() => {
        car.classList.remove("is-drift");
        car.driftDirection = 0;
        car.style.removeProperty('--direction')
        game.state = 'playing'
      }, 500)
    }

    if (item.y >= 750) {
      setInitialItemPosition(item);
      item.style.backgroundImage = getRandom('oil',2);
    }
    
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function gamePlay() {
  let road = gameArea.getBoundingClientRect();

  setProgress();
  if (player.start && game.state !== "car-crashed") {
    moveLines();
    moveEnemy(car);
    moveOil(car);
    moveHelp(car);
    moveSuper();
    if (progressValue >= 84) {
      meta();
    }

    if (keys.x && player.speed <= 11) {
      player.speed += 0.1;
    }
    if (keys.c && player.speed > 6.5) {
      player.speed -= 0.05;
    }
    if (keys.ArrowUp && player.y > road.top + 70) {
      player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < road.bottom - 85) {
      player.y += player.speed;
    }
    if (keys.ArrowLeft && player.x > 0 && game.state !== 'drift') {
      game.driftDirection = -1;
      player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < road.width - 50 && game.state !== 'drift') {
      game.driftDirection = 1;
      player.x += player.speed;
    }
    car.style.top = player.y + "px";
    car.style.left = player.x + "px";

    window.requestAnimationFrame(gamePlay);
  }
}

const scores = () => {
  setInterval(() => {
    player.score += player.speed / 2;
    let playerScoreRound = Math.round(player.score);
    let cadenaNumerica = "000000";
    let resultado = cadenaNumerica + playerScoreRound;
    resultado = resultado.substring(resultado.length - cadenaNumerica.length);

    score.innerText = resultado;
  }, 100);
};

function setProgress() {
  progressValue += player.speed / 200;

  if (progressValue >= 90) {
    endGame();
  }
  progress.setAttribute("style", `--progress: ${progressValue}%;`);
}

function speeds() {
  setInterval(() => {
    speed.innerText = Math.round(Math.pow(player.speed, 2.3)) + " km/h";
  }, 1000);
}

const vaciarFuel = () => {
  let totalfuel = setInterval(() => {
    if (player.fuel > 0) {
      player.fuel-= 2;
    }
    if (player.fuel === 0) {
      endGame();
      clearInterval(totalfuel);
    }
    //agregar imagen de fuel
    fuel.innerHTML = `<img src="img/fuel.png" alt="fuel" width="100px" height="50px">`;
    fuel_valor.innerHTML = `0${Math.round(player.fuel)}`;
  }, 500);
};

//iniciar juego

function start() {

  opening.play();

  setTimeout(() => {
    startScreen.classList.add("hide");
    gameArea.innerHTML = "";
    player.start = true;
    player.fuel = 100;
    player.speed = 6.5;
    player.score = 0;
    helped= false;
    window.requestAnimationFrame(gamePlay);
    scores();
    speeds();
    setProgress();

    fondo.play();
  
    for (let x = 0; x < 5; x++) {
      let roadLine = document.createElement("div");
      roadLine.setAttribute("class", "lines");
      roadLine.y = x * 150;
      roadLine.style.top = roadLine.y + "px";
      gameArea.appendChild(roadLine);
    }
  
    car = document.createElement("div");
    car.setAttribute("class", "car");
  
    gameArea.appendChild(car);
  
    player.x = car.offsetLeft;
    player.y = car.offsetTop;
  
    generateEntities()
  
    vaciarFuel();
  
    game.state = "playing";
  }, 1000);
 
}

function generateEntities() {

    if(helped === false){
      setTimeout(() => {  
      for (let x = 0; x < 3; x++) {
        let entity = document.createElement("div");
        entity.setAttribute("class", "enemy");
        entity.index = x;
        setInitialItemPosition(entity);
        gameArea.appendChild(entity);
     }
    }, 10);
  
      setTimeout(() => {  
        for (let x = 0; x < 1; x++) {
          let entity = document.createElement("div");
          entity.setAttribute("class", "oil");
          entity.index = x;
          setInitialItemPosition(entity);
          gameArea.appendChild(entity);
        }
      }, 1000);
    }
  
    setTimeout(() => {  
      for (let x = 0; x < 1; x++) {
        let entity = document.createElement("div");
        entity.setAttribute("class", "help");
        entity.index = x;
        setInitialItemPosition(entity);
        gameArea.appendChild(entity);
      }
    }, 4000);
  
    setTimeout(() => {
      for (let x = 0; x < 1; x++) {
        let entity = document.createElement("div");
        entity.setAttribute("class", "super");
        entity.index = x;
        setInitialItemPosition(entity);
        carGame.appendChild(entity);
      }
    }
    , 5000);
    
    setTimeout(() => {
      for (let x = 0; x < 1; x++) {
        let entity = document.createElement("div");
        entity.setAttribute("class", "meta");
        entity.index = x;
        setInitialItemPosition(entity);
        gameArea.appendChild(entity);
      }
    }
    , 3000);   
  
}
    
function setInitialItemPosition(item) {
  let position = {
    y: (item.index + 1) * 350 * -1,
    x: Math.floor(Math.random()+ Math.random() * 50)
  };

  item.y = position.y;
  item.style.top = `${position.y}px`;
  item.style.left = `calc(${position.x}vh - ${position.x > 8 ? item.offsetWidth : 0}px)`;
}

function getRandom(tipo,max) {
  return `url("./img/${tipo}-${Math.ceil(Math.random() * max)}.png")`;
}

function randomColor() {
  function c() {
    let hex = Math.floor(Math.random() * 256).toString(16);
    return ("0" + String(hex)).substr(-2);
  }
  return "#" + c() + c() + c();
}


