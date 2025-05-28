import * as fetch from "./modules/fetch.js";
import * as pageElem from "./modules/class.js";
import * as prepare from "./modules/prepareLocation.js";

const timeout = 600;

let location = await fetch.jsonLoad("./json/locations.json");
let item = await fetch.jsonLoad("./json/items.json");
let dependency = await fetch.jsonLoad("./json/dependencies.json");
console.log("locations: ", location);
console.log("items: ", item);
console.log("dependencies: ", dependency);
let inventory = [];

// starting position
let posX = 4;
let posY = 7;

let playing = false;

let blinkingCursor = true;
setInterval(() => {
  if (blinkingCursor) {
    pageElem.blinkingCursor.element.style.backgroundColor = "black";
    blinkingCursor = false;
  } else {
    pageElem.blinkingCursor.element.style.backgroundColor = "white";
    blinkingCursor = true;
  }
}, 400);

// console.log(`current position: ${posX}${posY}`)

const audio = new Audio("./mp3/hejnal.mp3");
audio.play();

setTimeout(() => {
  pageElem.startImgOne.element.style.display = "none";
  audio.pause();
}, 36000);
setTimeout(() => {
  pageElem.startImgTwo.element.style.display = "none";
}, 51000);
setTimeout(() => {
  pageElem.startImgThree.element.style.display = "none";
  pageElem.input.element.value = "";
  playing = true;
}, 61000);

//focus on input
pageElem.input.element.addEventListener("keydown", (e) => {
  e.key == "Tab" ? e.preventDefault() : true;
});
pageElem.input.element.addEventListener("input", function () {
  pageElem.input.element.value = pageElem.input.element.value.toUpperCase();
  pageElem.inputValue.element.innerText = pageElem.input.element.value;
});
window.addEventListener("click", () => {
  pageElem.input.element.focus();
});

//ok counter
let done = 0;
let dragonKilled = false;

prepare.prepareLocation(`${posX}${posY}`, location, inventory, item);

let writing = true;

pageElem.input.element.addEventListener("keydown", function (e) {
  if (e.key == "Enter" && writing && playing) {
    let command = pageElem.input.element.value.split(" ")[0].toLowerCase();
    let thing = pageElem.input.element.value.split(" ")[1];
    if (pageElem.input.element.value.split(" ")[2]) {
      thing =
        pageElem.input.element.value.split(" ")[1] +
        " " +
        pageElem.input.element.value.split(" ")[2];
    }
    pageElem.input.element.value = "";
    let position = `${posX}${posY}`;
    if (command == "n" || command == "north") {
      if (location[position]["n"]) {
        pageElem.doing.element.innerText = "You are going north...";
        posX -= 1;
      } else {
        pageElem.doing.element.innerText = "You can't go that way";
      }
    } else if (command == "e" || command == "east") {
      if (location[position]["e"]) {
        pageElem.doing.element.innerText = "You are going east...";
        posY += 1;
      } else {
        pageElem.doing.element.innerText = "You can't go that way";
      }
    } else if (command == "s" || command == "south") {
      if (location[position]["s"]) {
        pageElem.doing.element.innerText = "You are going south...";
        posX += 1;
      } else {
        pageElem.doing.element.innerText = "You can't go that way";
      }
    } else if (command == "w" || command == "west") {
      if (position == "42" && !dragonKilled) {
        pageElem.doing.element.innerText = "You can't go that way...";
      } else if (location[position]["w"]) {
        pageElem.doing.element.innerText = "You are going west...";
        posY -= 1;
      } else {
        pageElem.doing.element.innerText = "You can't go that way";
      }
    } else if (command == "t" || command == "take") {
      let locationItems = {};
      for (let i = 0; i < location[position]["items"].length; i += 1) {
        locationItems[item[location[position]["items"][i]].name] =
          location[position]["items"][i];
      }
      if (!Object.keys(locationItems).includes(thing)) {
        pageElem.doing.element.innerText =
          "There isn't anything like that here";
      } else if (
        Object.keys(locationItems).includes(thing) &&
        inventory.length == 1
      ) {
        pageElem.doing.element.innerText = "You are carrying something";
      } else if (!item[locationItems[thing]].take) {
        pageElem.doing.element.innerText = "You can't carry it";
      } else {
        pageElem.doing.element.innerText = `You are taking ${
          item[locationItems[thing]].name
        }`;
        location[position]["items"].splice(
          location[position]["items"].indexOf(locationItems[thing]),
          1
        );
        inventory.push(locationItems[thing]);
      }
    } else if (command == "d" || command == "drop") {
      if (inventory.length == 0) {
        pageElem.doing.element.innerText = "You are not carrying anything";
      } else if (item[inventory[0]].name != thing) {
        pageElem.doing.element.innerText = "You are not carrying it";
      } else if (location[position]["items"].length == 3) {
        pageElem.doing.element.innerText = "You can't store any more here";
      } else {
        pageElem.doing.element.innerText = `You are about to drop ${
          item[inventory[0]].name
        }`;
        location[position]["items"].push(item[inventory[0]].id);
        inventory = [];
      }
    } else if (command == "v" || command == "vocabulary") {
      writing = false;
      pageElem.main.element.style.display = "none";
      pageElem.vocabulary.element.style.display = "block";
    } else if (command == "g" || command == "gossips") {
      writing = false;
      pageElem.main.element.style.display = "none";
      pageElem.gossips.element.style.display = "block";
    } else if (command == "u" || command == "use") {
      console.log(inventory[0]);
      if (inventory[0] == 36) {
        console.log("gratulacje");
      } else if (inventory[0] == 33 && position == "43" && dragonKilled) {
        pageElem.doing.element.innerText = "You cut a piece of dragon's skin";
        inventory = [34];
      } else if (inventory[0] == 37 && position == "43") {
        pageElem.doing.element.innerText = "The dragon noticed your gift...";
        inventory = [];
        location[position]["items"].push(30);
        dragonKilled = true;
        location[position].img = "dragon.bmp";
      } else if (inventory.length == 0 || item[inventory[0]].name != thing) {
        pageElem.doing.element.innerText =
          "You aren't carrying anything like that";
      } else if (
        !dependency[inventory[0]] ||
        dependency[inventory[0]].localization != position
      ) {
        console.log(dependency[inventory[0]]);
        pageElem.doing.element.innerText = "Nothing happened";
      } else if (item[dependency[inventory[0]].reward].take) {
        pageElem.doing.element.innerText = dependency[inventory[0]].info;
        inventory = [dependency[inventory[0]].reward];
      } else {
        pageElem.doing.element.innerText = dependency[inventory[0]].info;
        location[position]["items"].push(dependency[inventory[0]].reward);
        inventory = [];
        done += 1;
        if (done == 6) {
          pageElem.doing.element.innerText =
            "Your fake sheep is full of poison and ready to be eaten by the dragon";
          inventory = [];
          const sheepParts = [13, 17, 20, 23, 26, 29];
          for (let i = 0; i < sheepParts.length; i += 1) {
            location[position]["items"].splice(
              location[position]["items"].indexOf(sheepParts[i]),
              1
            );
          }
        }
      }
    } else {
      pageElem.doing.element.innerText = "Try another word or V for vocabulary";
    }
    // console.log(`current position: ${posX}${posY}`)
    // console.log(`inventory: ${inventory}`)
    pageElem.dialog.element.style.display = "none";
    pageElem.input.element.style.display = "none";
    pageElem.blinkingCursor.element.style.display = "none";
    pageElem.inputValue.element.style.display = "none";
    if ((command == "u" || command == "use") && thing == "PRIZE") {
      const audio2 = new Audio(
        "./mp3/hejnal.mp3"
      );
      audio2.play();
      pageElem.game.element.style.display = "none";
      pageElem.endText.element.style.display = "block";
    } else if (
      (command == "u" || command == "use") &&
      position == "11" &&
      thing == "SPADE"
    ) {
      setTimeout(() => {
        pageElem.doing.element.innerText = "and digging...";
      }, 1 * timeout);
      setTimeout(() => {
        pageElem.doing.element.innerText = "That's enough sulphur for you";
      }, 2 * timeout);
      setTimeout(() => {
        prepare.prepareLocation(`${posX}${posY}`, location, inventory, item);
        pageElem.doing.element.innerText = "";
        pageElem.dialog.element.style.display = "block";
        pageElem.input.element.style.display = "block";
        pageElem.blinkingCursor.element.style.display = "block";
        pageElem.inputValue.element.style.display = "block";
        pageElem.inputValue.element.innerText = pageElem.input.element.value;
        pageElem.input.element.focus();
      }, 3 * timeout);
    } else if (
      (command == "u" || command == "use") &&
      position == "43" &&
      thing == "SHEEP"
    ) {
      setTimeout(() => {
        pageElem.doing.element.innerText =
          "The dragon ate your sheep and died!";
      }, 1 * timeout);
      setTimeout(() => {
        prepare.prepareLocation(`${posX}${posY}`, location, inventory, item);
        pageElem.doing.element.innerText = "";
        pageElem.dialog.element.style.display = "block";
        pageElem.input.element.style.display = "block";
        pageElem.blinkingCursor.element.style.display = "block";
        pageElem.inputValue.element.style.display = "block";
        pageElem.inputValue.element.innerText = pageElem.input.element.value;
        pageElem.input.element.focus();
      }, 2 * timeout);
    } else if (
      (command == "w" || command == "west") &&
      position == "42" &&
      !dragonKilled
    ) {
      setTimeout(() => {
        pageElem.doing.element.innerText = "The dragon sleeps in a cave!";
      }, 1 * timeout);
      setTimeout(() => {
        prepare.prepareLocation(`${posX}${posY}`, location, inventory, item);
        pageElem.doing.element.innerText = "";
        pageElem.dialog.element.style.display = "block";
        pageElem.input.element.style.display = "block";
        pageElem.blinkingCursor.element.style.display = "block";
        pageElem.inputValue.element.style.display = "block";
        pageElem.inputValue.element.innerText = pageElem.input.element.value;
        pageElem.input.element.focus();
      }, 2 * timeout);
    } else {
      setTimeout(() => {
        prepare.prepareLocation(`${posX}${posY}`, location, inventory, item);
        pageElem.doing.element.innerText = "";
        pageElem.dialog.element.style.display = "block";
        pageElem.input.element.style.display = "block";
        pageElem.blinkingCursor.element.style.display = "block";
        pageElem.inputValue.element.style.display = "block";
        pageElem.inputValue.element.innerText = pageElem.input.element.value;
        pageElem.input.element.focus();
      }, timeout);
    }
  }
});

let clicksNum = 0;
window.addEventListener("keydown", function (e) {
  if (!writing) {
    clicksNum += 1;
    if (clicksNum == 2) {
      pageElem.vocabulary.element.style.display = "none";
      pageElem.gossips.element.style.display = "none";
      pageElem.main.element.style.display = "block";
      writing = true;
      clicksNum = 0;
      pageElem.input.element.focus();
    }
  }
});