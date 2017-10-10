//levels are created with arrays of strings to make a 2D grid
/*
the level and sprite will be rendered seperately.
the level will be rendered first, and then the sprite will
be rendered on top of it

iteraction will be programmed in when the sprite's coordinates
and the level's 'special character' coordinates overlap
*/
var simpleLevelPlan = [
  "                      ",
  "                      ",
  "  x              = x  ",
  "  x         o o    x  ",
  "  x @      xxxxx   x  ",
  "  xxxxx            x  ",
  "      x!!!!!!!!!!!!x  ",
  "      xxxxxxxxxxxxxx  ",
  "                      "
];



function Level(plan) { //takes an array of strings representing a level
  this.invincible = false;
  this.shrunk = false;
  this.godMode = false;
  this.lives = 3;
  this.width = plan[0].length; //level width is the horizontal length of one of the strings in the plan array
  this.height = plan.length; //level height is the number of strings in the plan array 
  this.grid = [];
  this.actors = []; //creates empty array that will track position and state of the dynamic elements in the level
  //each Actor object will have a pos property (that contains a position), a size property that gives its size, and a
  //type property that identifies the element

  for (var y = 0; y < this.height; y++) {
    var line = plan[y], gridLine = [];
    for (var x = 0; x < this.width; x++) {
      var ch = line[x], fieldType = null;
      var Actor = actorChars[ch];
      if (Actor)
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch == "x")
        fieldType = "wall";
      else if (ch == "!")
        fieldType = "lava";
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }
  //populates grid
  /*
  iterates through each string in the plan array
  in an inner for loop, iterates through each character of each string
  finds if character is blank or if special character
  if special character is the sprite, creates a new vector object + Actor object
  if special character is wall or lava, sets 'fieldtype' variable to wall/lava

  Outside of for loops, all characters are added to the grid array
  */

  this.player = this.actors.filter(function(actor) {
    return actor.type == "player";
  })[0];
  //extract 'player' actor object
  this.status = this.finishDelay = null;
  //status tracks if the player has won or lost
}

Level.prototype.extraLives = function() {
  console.log(`Alpha HP Activated: You have 100 lives`);
  this.lives = 100;
}

Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};
//called when the player wins/loses, controls death/victory animation

function Vector(x, y) {
  this.x = x; this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};
/*
Vector constructor is used to store the coordinates of our sprite
our vector objects will have functions to change their coordinates
*/
var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava, "|": Lava, "v": Lava
};
/*
key used to convert special characters in the plan array to string form
these 'source characters' will be used to make special objects
*/

function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";
/*
special object constructor for Player type
tracks current position, current speed, and size
because the player sprite is 1 and a half squares high, its initial position is 
set to be half a square above the position where the @ character appears
*/

function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    this.speed = new Vector(0, 2);
  } else if (ch == "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos; //dripping lava will reset after each 'drip'
  }
}
Lava.prototype.type = "lava";
/*
dynamic Lava object
object is initialized differently depending on the character it is based on
all lava objects will have a position coordinate passed in and a size of 1x1
(represented by a 1x1 Vector object)

*/

function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";

/*
coin objects are given a 'wobble' animation for fun
animation changes their position slightly each cycle
*/



var simpleLevel = new Level(simpleLevelPlan);

/*
the encapsulation of the drawing code is done by defining a display objec t, which displays a given level. 
We call the display function "Domdisply" because it uses simple DOM elements to render the level.
A style sheet is used to describe colors and other fized properties that are set on the elements that make
up the game.
It is possible to assign these styles directly with js, but it's generally a better practice to include an
external css style sheet
*/

function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
}
/*
elt is a helper function that creates an element (name) and assigns it a class (classname) and then returns the element
*/


function DOMDisplay(parent, level) { //pass in parent object and level object
  this.wrap = parent.appendChild(elt("div", "game")); //div of class 'game' is created and appended to 'parent' object
  //div is also stored on the calling object as the 'wrap' property
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  /*
  the level's background is drawn once and the actors (special objects) are redrawn over the background as needed
  */
  this.actorLayer = null;
  /*
  actorLayer is used to track the lement that holds the actors so that they can be removed/replaced
  */
  this.drawFrame();

}

/*
The display is created by giving it a parent element to which it should append itself and a level object


*/

var scale = 20;
  /*
  The coordinates and sizes are tracked in units relative to the grid size, where a size or distance of 1 means 1 grid unit. 
  In order to actually draw the game, we must scale this up
  The 'scale' variable will be the ratio by which we scale the game up
  */
DOMDisplay.prototype.drawBackground = function() {
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function(row) {
    var rowElt = table.appendChild(elt("tr"));
    rowElt.style.height = scale + "px";
    row.forEach(function(type) {
      rowElt.appendChild(elt("td", type));
    });
  });
  return table;
};
/*
We will be drawing the background as a html table element
This corresponds to the structure of the grid property, whereas each row of the grid is turned into a table row (<tr> element)
Each string in the grid are used as class names for each table row's cell element (<td>)
We will include CSS styling for the table we use
*/
DOMDisplay.prototype.drawActors = function() {
  var wrap = elt("div");
  this.level.actors.forEach(function(actor) {
    var rect = wrap.appendChild(elt("div",
                                    "actor " + actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};
/*
We draw each actor by creating a DOM element for it and setting that element's position and size based on the actor's properties
The values are multipled by the 'scale' value ad converted into 'px' pixels.


*/

DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer)
    this.wrap.removeChild(this.actorLayer);
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game " + (this.level.status || ""); //adds a victory/death class if the player has won/died
  /*
  This means we check if a victory/lose condition has been achieved each game cycle
  */
  this.scrollPlayerIntoView();
};
/*
The frawFrame function updates the display by removing the old actor graphics and redrawing them with the actor object's
new coordinates

Reminder: The background (and all static characters) is only drawn once. The dynamic characters are redrawn every game cycle
This function deals specifically with our character sprite

Note: It's possible to reuse the DOM elements for actors, but it would require a significant greater amount of code
It only makes sense to do in situations where redrawing the element is very expensive (which it's not here)


*/


DOMDisplay.prototype.scrollPlayerIntoView = function() {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft, right = left + width;
  var top = this.wrap.scrollTop, bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5))
                 .times(scale);

  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};

/*
The DOMDDisplay prototype uses the scrollPlayerIntoView method
to ensure that the sprite is centered in the viewport. Otherwise the
sprite would simply walk off-screen

Function finds the sprite's current position and updates the wrapping element's scroll position. The scroll position is modified by changing
the element's scrollLeft and scrollTop properties when the player is too close to the edge.

We find the sprite's center by adding its position (its coordinates on the page starting from the top-left corner of the sprite)
to half of it's size, which gets us to the true center of the sprite.

We convert this into pizel coordinates bu miultiplying the resulting vector by our display scale.
Next, we implement checks to make sure that the sprite isn't outside of the allowed range of coordinates.
*/

DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};

/*
Clears displayed level
*/




Level.prototype.obstacleAt = function(pos, size) {
  var xStart = Math.floor(pos.x); //get current position (left)
  var xEnd = Math.ceil(pos.x + size.x); //get current position (right)
  var yStart = Math.floor(pos.y); //get current position (top)
  var yEnd = Math.ceil(pos.y + size.y); //get current position (bottom)

  if (xStart < 0 || xEnd > this.width || yStart < 0) //treat outside of level like a wall
    return "wall";
  if (yEnd > this.height) //treats bottom of level like lava
    return "lava";
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x]; //search through grid and find if we're about to collide with a special character
      if (fieldType) return fieldType; //return special character if it exists
    }
  }
};
/*
Tests if sprite is about to move into a wall or lava
if true, prevent movement (stop for a wall, bounce back for lava)


*/


Level.prototype.actorAt = function(actor) {
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (other != actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y > other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y)
      return other;
  }
};

/*
iterates through array of actors, looks for acor that overlaps with parameter actor
function will be called with character sprite as an argument, so this function will
check if the sprite has collided with any other dynamic character
*/

var maxStep = 0.05; //max step time allowed

Level.prototype.animate = function(step, keys) {
  if (this.status != null)
    this.finishDelay -= step;
    //status property will only not equal null if the player has won/lost
    //starts post-win/lose countdown to show victory/death animation
  while (step > 0) {
    var thisStep = Math.min(step, maxStep); //reduces step speed
    this.actors.forEach(function(actor) {
      actor.act(thisStep, this, keys); //Actor.prototype.act(timeStep, levelObject, keysObject)

    }, this);
    step -= thisStep;
  }
};
/*
allows all actors to move
step parameter determines how frequently they will move (in seconds)
keys parameter is an objecting containing information about what key the user has pressed
(will be used to determine the direction in which the sprite will move)
*/

Lava.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
        /*
      computes new position by adding the product of the time step and current speed to the old position
      newPosition = oldPosition * timeStep

      If no obstacle blocks the new position, the actor movies to the new position
      If there is an obstacle, the behavior is determined by the object's type
      (which is contained as a property of the keys object)
      Dripping lava has a repeatPos property, which tells the lava object to return to its start position once it
      collides with an obstacle
      Bouncing lava reverses directions when it collides with an obstacle
      */
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};

var wobbleSpeed = 8, wobbleDist = 0.07;

Coin.prototype.act = function(step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

// var playerXSpeed = 15; //amount by which the sprite's location will be increased/decreased

/*
the sprite movement methods are divided into two methods, each of which independently handles
vertical vs horizontal movement. This allows us to stop one plane of movement without affecting
the other plane, which more accurately resembles real world physics
*/



Player.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= gameStats.playerXSpeed;
  if (keys.right) this.speed.x += gameStats.playerXSpeed;
  if (keys[1]) cheatCodes.restoreDefault();
  else if (keys[2]) cheatCodes.reverseGravity();
  else if (keys[3]) cheatCodes.zeroGravity();
  else if (keys[4]) cheatCodes.sprint()
  else if (keys[5]) cheatCodes.megaJump();
  else if (keys[6]) cheatCodes.walk();
  else if (keys[7]) cheatCodes.tinyJump();
  else if (keys[8]) cheatCodes.reduceGravity();
  else if (keys[9]) console.log(`Gravity Reversed`);
  else if (keys[0]) level.extraLives();

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle)
    level.playerTouched(obstacle);
  else
    this.pos = newPos;
};

const gameStats = {
  gravity: 30,
  jumpSpeed: 17,
  playerXSpeed: 15
}

const cheatCodes = {
  restoreDefault: function() {
    console.log("Default Settings Restored");
    gameStats.gravity = 30;
    gameStats.playerXSpeed = 15;
    gameStats.jumpSpeed = 20;    
  },
  reverseGravity: function() {
    console.log(`Gravity Reversed`);
    gameStats.gravity = -25;
  },
  zeroGravity: function() {
    console.log(`Zero Gravy`);
    gameStats.gravity = 0;
  },
  sprint: function() {
    if (gameStats.playerXSpeed < 75) {
      gameStats.playerXSpeed = 40;
      console.log(`Speed Increased`);
    } else console.log("Max Speed Reached")
  },
  megaJump: function() {
    if (gameStats.jumpSpeed < 75) {
      console.log(`Mega Jump Activated`);      
      gameStats.jumpSpeed = 40;
    } else console.log("Max Jump Reached");    
  },
  walk: function() {
    if (gameStats.playerXSpeed > 5) {
      gameStats.playerXSpeed = 10;
      console.log(`Slow Walk Activated`);
    } else console.log('Slowest Walk Possible');
  },
  tinyJump: function() {
    if (gameStats.jumpSpeed > 5) {
      gameStats.jumpSpeed = 10;
      console.log(`Tiny Jump Activated`);
    }
    else console.log('Tiniest Jump Possible');    
  },
  reduceGravity: function() {
    if (gameStats.gravity > 1) {
      gameStats.gravity = 1;
      console.log(`Gravity Reduced`);
    } else console.log("Gravity is at a minimum");
  }

}


/*
Horizontal motion is computed based on the state of the left and right arrow keys. When a motion causes the player to hit something,
the level's playerTouched method is called, and the player wins/loses/etc. If the motion won't cause the sprite to hit anything,
the sprite location of the sprite is updated to the new location.
*/


// var gravity = 20;
// var jumpSpeed = 25;
//gravity controls the rate at which the sprite descends, jumpSpeed controls the rate at which the sprite ascends on a jump

Player.prototype.moveY = function(step, level, keys) {
  this.speed.y += step * gameStats.gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if (keys.up && this.speed.y > 0)
      this.speed.y = -gameStats.jumpSpeed;
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};

Player.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);

  // Losing animation
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};

Level.prototype.playerTouched = function(type, actor) {
  if (type == "lava" && this.lives > 0) {
    console.log('life lost');
    console.log(`Live Remaining: ${this.lives}`)
    this.lives--;
  } else if (type == "lava" && this.lives == 0 && this.status == null) {
    this.status = "lost";
    console.log("Game Over!")
    this.finishDelay = 1;
  } else if (type == "coin") {
    this.actors = this.actors.filter(function(other) {
      return other != actor;
    });
    if (!this.actors.some(function(actor) {
      return actor.type == "coin";
    })) {
      this.status = "won";
      this.finishDelay = 1;
    }
  }
};

var arrowCodes = {37: "left", 38: "up", 39: "right", 40: "down"};
for (let i = 0; i <= 9; i++) {
  arrowCodes[i+48] = i;
}


function trackKeys(codes) {
  var pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);

function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);
  runAnimation(function(step) {
    level.animate(step, arrows);
    display.drawFrame(step);
    if (level.isFinished()) {
      display.clear();
      if (andThen)
        andThen(level.status);
      return false;
    }
  });
}

function runGame(plans, Display) {
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function(status) {
      if (status == "lost")
        startLevel(n);
      else if (n < plans.length - 1)
        startLevel(n + 1);
      else
        console.log("You win!");
    });
  }
  startLevel(0);
}
