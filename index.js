const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.5;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 627,
    y: 119.5,
  },
  imageSrc: "./img/shop.png",
  scale: 2.8,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 125,
    y: 310,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/samuraiMack/idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: { x: 215, y: 155 },
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/samuraiMack/run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/samuraiMack/jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/samuraiMack/fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: { x: 80, y: 40 },
    width: 180,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 800,
    y: 310,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  color: "red",
  offset: {
    x: -100,
    y: 0,
  },
  imageSrc: "./img/kenji/idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: { x: 215, y: 171 },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/kenji/jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/kenji/fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/kenji/attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: { x: -170, y: 45 },
    width: 200,
    height: 50,
  },
});

enemy.draw();

console.log(player);

const Keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  num6: {
    pressed: false,
  },
  num4: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  // infinite loop, frame counter
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = "rgba(255,255,255,0.15)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player Movement

  if (Keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -6;
    player.switchSprite("run");
  } else if (Keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 8;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // enemy Movement
  if (Keys.num4.pressed && enemy.lastKey === "k") {
    enemy.velocity.x = -8;
    enemy.switchSprite("run");
  } else if (Keys.num6.pressed && enemy.lastKey === "l") {
    enemy.velocity.x = 6;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collisions player & enemy gets hit
  if (
    rectCollection({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit(150);
    player.isAttacking = false;

    gsap.to("#enemyHealth", {
      width: enemy.health,
    });
    console.log("OUCH");
  }
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }
  // detect for collisions enemy
  if (
    rectCollection({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit(150);
    enemy.isAttacking = false;

    gsap.to("#playerHealth", {
      width: player.health,
    });
    console.log("OUCHIE");
  }
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  //end game
  if (enemy.health <= 0 || player.health <= 0) {
    whoWins({ player, enemy, timerID });
    cancelTimeout(timerID);
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    // player
    switch (event.key) {
      case "d":
        Keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        Keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case " ":
        player.attack();
        break;
    }
  }
  if (!enemy.dead) {
    switch (event.key) {
      //enemy
      case "6":
        Keys.num6.pressed = true;
        enemy.lastKey = "6";
        break;
      case "4":
        Keys.num4.pressed = true;
        enemy.lastKey = "4";
        break;
      case "ArrowRight":
        enemy.attack();
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      Keys.d.pressed = false;
      break;
    case "a":
      Keys.a.pressed = false;
      break;
  }

  // enemy keys
  switch (event.key) {
    case "6":
      Keys.num6.pressed = false;
      break;
    case "4":
      Keys.num4.pressed = false;
      break;
  }
});
