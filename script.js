const points = document.querySelector("#proper");
const board = document.querySelector(".board");
const healthElem = document.querySelector(".health");
const speed = [17, 25, 35, 70, 90];
const initialSizeScore = points.innerText.length;
const userWindow = document.querySelector(".user");
const userNick = userWindow.querySelector("#nick");
const userNickOnBoard = board.querySelector(".yourNick > span");
const startButton = userWindow.querySelector(".startButton");
const highScoreWindow = document.querySelector(".highscore-window");
const leadersContainer = highScoreWindow.querySelector(".leaders-container");
const startAgainButton = highScoreWindow.querySelector(".startAgainButton");
const returnButton = highScoreWindow.querySelector(".returnButton")
const sign = board.querySelector("#sign");
const URL = "https://jsonblob.com/api/jsonBlob/1042868099266920448";
const positionsInHighscore = 7;
let zombieContainer = {};
let idCounter = 0;
let health = 3;
let spawning_zombies;
let cursorCont = {}; //kontener zawierajacy czerwoną kropke oraz bialy okrąg - bedzie stworzony przy wywolaniu funkcji startGame
let newValue = 0;

//CURSOR FUNCTIONS
const makeTargetCircle = () => {
  const circleTarget = document.createElement("div");
  const target = document.createElement("div");
  circleTarget.classList.add("circl");
  target.classList.add("targ");
  board.appendChild(circleTarget);
  board.appendChild(target);
  const obj = { circleTarget: circleTarget, target: target };
  return obj;
};
const removeTargetCircle = () => {
  if (cursorCont.circleTarget) cursorCont.circleTarget.remove();
  if (cursorCont.target) cursorCont.target.remove();
};
const makeFollowingCursorHandler = (e) => {
  if (cursorCont.circleTarget) {
    cursorCont.circleTarget.style.left = e.pageX + "px";
    cursorCont.circleTarget.style.top = e.pageY + "px";
  }
  if (cursorCont.target) {
    cursorCont.target.style.left = e.pageX + "px";
    cursorCont.target.style.top = e.pageY + "px";
  }
};

//ZOMBIE FUNCTIONS
const createZombie = (newScale, fromY) => {
  const zombie = document.createElement("div");
  zombie.classList.add("zombie");
  zombie.setAttribute("id", idCounter++);
  zombie.style.scale = newScale;
  zombie.style.left = 110 + "vw";
  zombie.style.top = 10 + fromY + "vh";
  zombie.addEventListener("click", shootZombieHandler);
  board.appendChild(zombie);
  return zombie;
};

const zombieMove = (fromY, time, newScale) => {
  let zombie = createZombie(newScale, fromY);
  let posBackground = 0;
  let positionX = 0;
  zombieContainer[zombie.id] = setInterval(() => {
    zombie.style.backgroundPositionX = posBackground + "%";
    posBackground = (posBackground - 200) % 2000;
    positionX -= 1;
    zombie.style.left = 110 + positionX + "vw";
    
    if (
      parseInt(window.getComputedStyle(zombie).left) + zombie.clientWidth <=
      -1 * leftBoundary()
    ) {
      zombie.remove();
      clearInterval(zombieContainer[zombie.id]);
      updateHealth(); //dodatkowo zmniejszamy ilosc serc
    }
  }, time);
};

function shootZombieHandler(e) {
  if (e.button === 0) {
    pointsConvertion(points, 18);  
    clearInterval(zombieContainer[this.id]);
    delete zombieContainer[this.id];
    this.remove();
  }
}


const shootBoardHandler = () => {
  pointsConvertion(points, -6);
};
const getRandomNum = (l, r) => Math.floor(Math.random() * (r - l + 1)) + l; 

const updateHealth = () => {
  health -= 1;
  healthElem.innerText = health;
  if (!health) endGame();
};
const pointsConvertion = (points, score) => {
  console.log(newValue);
  sign.innerText = "";
  if (sign.innerText === "-") {

    newValue += -1 * score; 
    if (newValue >= 0) sign.innerHTML = "";
  } else {
    
    newValue += score;
    if (newValue < 0) sign.innerHTML = "-";
  }

  diff = "0";
  valueString = String(Math.abs(newValue));

  if (valueString.length < initialSizeScore) {
    diff = diff.repeat(initialSizeScore - valueString.length);
    valueString = diff + valueString;
  }
  points.innerText = valueString;
};
const leftBoundary = () => {
  let width = board.clientWidth;
  return Math.floor((100 * 300) / width); v
};


const startGame = () => {
  let indexSpeed;
  let fromY;
  let newScale;
  userNickOnBoard.innerText = userNick.value;
  window.removeEventListener("keydown", startGame);
  board.addEventListener("click", shootBoardHandler);
  cursorCont = makeTargetCircle();
  board.addEventListener("mousemove", makeFollowingCursorHandler);
  let spawnTiming = getRandomNum(500, 2000);
  spawning_zombies = setInterval(() => {
    indexSpeed = getRandomNum(0, speed.length - 1);
    fromY = getRandomNum(0, 40);
    newScale = getRandomNum(8, 13) / 10;
    zombieMove(fromY, speed[indexSpeed], newScale);
    spawnTiming = getRandomNum(500, 2000);
  }, spawnTiming);
};

const endGame = () => {
  board.removeEventListener("click", shootBoardHandler);
  board.removeEventListener("mousemove", makeFollowingCursorHandler);
  removeTargetCircle(); //usuwanie kolka z punktem nadążającymi za kursorem
  clearInterval(spawning_zombies);
  for (let key in zombieContainer) {
    let elem = document.getElementById(`${key}`);
    if (elem) elem.remove();
    delete zombieContainer[key];
  }
  idCounter = 0;
  health = 3;
  healthElem.innerText = health;
  zombieContainer = {};
  points.innerText = "0".repeat(initialSizeScore);
  board.style.display = "none";
  highScoreWindow.style.display = "flex";
  sign.innerText = "";
 
  receiveHighscores();
};


const verifyingData = (e) => {
  e.preventDefault();
  if (!userNick.checkValidity()) return;
  startButton.removeEventListener("click", verifyingData);
  userWindow.style.display = "none";
  highScoreWindow.style.display = "none";
  board.style.display = "block";
  startGame(); 
};

const returnButtonHandler = (e) =>{
  e.preventDefault();
  highScoreWindow.style.display = "none";
  userWindow.style.display = "flex";
  userNick.value = "";
  sign.innerText = "";
  newValue = 0;
  points.innerText = "0".repeat(initialSizeScore);
  startButton.addEventListener("click", verifyingData);
  userNick.checkValidity();
}

const receiveHighscores = async () => {
    const URL = "https://zombie-game-2c70e-default-rtdb.firebaseio.com/zombies.json";
    const resp = await fetch(URL);
  
    if (resp.ok) {
      let data = await resp.json();
      if(!data) data = {};
      await highScoresUpdate(data);
    } else {
      console.error("Error fetching data:", resp.statusText);
    }
  };
  

const highScoresUpdate = async (data) => {
  leadersContainer.innerHTML = "";
  let actualDate = new Date();
  let day = actualDate.getDate();
  let month = actualDate.getMonth() + 1;
  let year = actualDate.getFullYear();
  let properDate = `${day}-${month}-${year}`;
  let userList = data.userList;
  if(!userList) userList = [];
   userList.push({
    nick: userNick.value,
    score: sign.innerText === "-" ? -1 * newValue : newValue,
    scoreDate: properDate,
  });
  newValue = 0;
  userList = userList.sort((first, sec) => {
    if (first.score < sec.score) return 1;
    else return -1;
  });
  data.userList = userList;
  //from userList we need to leave only 7 positions which are already sorted
  if (userList.length > positionsInHighscore) {
    let toRemove = userList.length - positionsInHighscore;
    userList.splice(positionsInHighscore, toRemove);
  }

  userList.forEach((user, ind) => {
    let newLi = document.createElement("li");
    newLi.innerText = `${ind + 1}. user: ${user.nick} | score: ${
      user.score
    } | date: ${user.scoreDate}`;
    newLi.classList.add("new-user");
    leadersContainer.appendChild(newLi);
  });
  await sendHighscores(data);
};

const sendHighscores = async (data) => {
    const URL = "https://zombie-game-2c70e-default-rtdb.firebaseio.com/zombies.json";
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  
    const resp = await fetch(URL, options);
    if (resp.ok) {
      console.log("Data sent successfully!");
    } else {
      console.error("Error sending data:", resp.statusText);
    }
  
    return resp.json();
  };
  
const startAll = () => {
  startButton.addEventListener("click", verifyingData);
  startAgainButton.addEventListener("click", verifyingData);
  returnButton.addEventListener("click", returnButtonHandler);
};

startAll();
