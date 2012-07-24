/*
 * Copyright (c) 2012 by Aleksandar Palic, Blog http://skripted.ruhoh.com
 * Released under MIT license
 */

(function() {
    
    /**
     * Main Constructor for the engine - usage: new Engine(param1, param2)
     */
    function Engine2 (name, config) {
        this.gameName = typeof name != 'string' ? 'default_name' : name;
        
        if(typeof config == 'object') 
            this.gameConfig = config;
        else 
            throw new Error("An invalid config-object has been given."); 
    }

    /**
     * Executable function: Creates the main viewport which holds all the
     * important game content
     */
    Engine2.prototype.addViewport = function (pa, vp) { 
        var wrapper = document.getElementById(pa);
        
        if(wrapper == null)
            wrapper = document.body;
        
        // create elements and assign them attributes
        this.viewPort = document.createElement('div');
        this.viewPort.id = vp;
        this.viewPort.background = 1;
        
        // assign styles from game config
        this.viewPort.style.width = this.gameConfig.viewport.x + 'px';
        this.viewPort.style.height = this.gameConfig.viewport.y + 'px';
        this.viewPort.style.border = this.gameConfig.viewport.border + 'px #888 solid';
        this.viewPort.className = this.gameConfig.viewport.bgClassName + this.viewPort.background;
        
        // add viewport to the given wrapper
        wrapper.appendChild(this.viewPort);
    };
    
    /**
     * Internal function: Removes all children from the current viewport
     */
    Engine2.prototype.clearViewport = function () {
        while(this.viewPort.firstChild)
            this.viewPort.removeChild(this.viewPort.firstChild);
    };
    
    /**
     * Executable function: Sets the event listener for the button. You can
     * also assign it a custom value
     */
    Engine2.prototype.addStartButton = function (sb, value) {
        this.checkForViewport();
        
        // create elements and assign them attributes
        this.startBtn = document.createElement('input');
        this.startBtn.id = sb;
        this.startBtn.type = 'button';
        this.startBtn.className = 'button';
        this.startBtn.value = value;
        
        // add the button to the viewport
        this.viewPort.appendChild(this.startBtn);

        // add eventlistener for the start game button
        this.startBtn.addEventListener('click', this, false); 
    };
    
    /**
     * Executable function: Creates an introduction image and places it
     * before or after the start button
     */
    Engine2.prototype.addIntroductionImage = function (imageSrc) {
        this.checkForViewport();
        
        this.introImg = document.createElement('img');
        this.introImg.src = imageSrc;
        
        this.viewPort.appendChild(this.introImg);
    };

    /**
     * Internal function: Checks if no viewport exists and throws an error
     */
    Engine2.prototype.checkForViewport = function () {
        if(this.viewPort == null)
            throw new Error("A viewport has to be created first.");
    };
    
    /**
     * Internal function: Checks if a start button exists and returns true
     */
    Engine2.prototype.checkForStartButton = function () {
        if(this.startBtn != null)
            return true;
        else
            return false;
    };
    
    /**
     * Internal function: Function triggered when start button  is clicked
     */
    Engine2.prototype.click = function (e) {
        e.preventDefault();
        
        // launch main start game function
        this.startGame();
    };
    
    /**
     * Internal function: Triggers all important functions for game start
     */
    Engine2.prototype.startGame = function () {
        // initiate important attributes
        this.gameStarted = true;
        this.gameCounter = 0;
        
        this.elevatorStarted = false;
        this.elevatorCounter = 0;
        this.elevatorStep = 1;
        
        this.blockColor = 1;
        
        // run some mandatory functions and prepare game environment
        this.clearViewport();
        this.addCanvas();
        this.addPlayer();
        this.addBlocks();
        
        // initiate additional attributes for the player
        this.player.flying = false;
        this.player.flyingTime = 0;
        
        this.player.jumping = false;
        this.player.jumpable = true;
        this.player.jumpingTime = 0;
        
        this.blockActive = this.canvas.childNodes[1];

        // initiate the main loop of the game
        if(this.gameStarted) {
            
            // declare some variables for game handling
            this.keyLeft = null;
            this.keyRight = null;
            this.keySpace = null;
            
            // declare thread variable
            this.loopStarted = false;
            
            // cache the current instance of the engine
            window.cEngine = this;
            
            // set event handler to check for pressed keys
            window.onkeydown = function (event) {
                switch(event.keyCode) {
                    case window.cEngine.gameConfig.handle.keyLeft:window.cEngine.keyLeft = true;break;
                    case window.cEngine.gameConfig.handle.keyRight:window.cEngine.keyRight = true;break;
                    case window.cEngine.gameConfig.handle.keySpace:window.cEngine.keySpace = true;break;
                }
            };
    
            // set event handler to check for released keys
            window.onkeyup = function (event) {
                switch(event.keyCode) {
                    case window.cEngine.gameConfig.handle.keyLeft:window.cEngine.keyLeft = false;break;
                    case window.cEngine.gameConfig.handle.keyRight:window.cEngine.keyRight = false;break;
                    case window.cEngine.gameConfig.handle.keySpace:window.cEngine.keySpace = false;break;
                }
            };
            
            // call the requestAnimationFrame api loop
            (function gameThread() {
                requestAnimFrame(gameThread);
                // call main game loop from cached instance
                window.cEngine.startGameLoop();
            })();
            
            // set main thread boolean variable to true
            window.cEngine.loopStarted = true;
            
            // display thread status
            console.log('Game Thread Status: Running');
        }
    };
    
    /**
     * Internal function: Main game function which get's triggered in a loop
     */
    Engine2.prototype.startGameLoop = function () {
        if(this.loopStarted) {
            
            // initiate important attributes
            var newOffsetX = null;
            var newOffsetY = null;
            var collision = null;

            // start elevator on block 2 and generate new blocks if necessary
            if(this.blockActive == this.canvas.childNodes[2])
                this.elevatorStarted = true;

            if(this.elevatorStarted) {
                this.moveElevator();
                this.checkCreateNewBlocks();
                this.checkDeleteOldBlocks();
            }

            // if player falling render falling animation
            if(this.player.flying) {
                this.makePlayerFall();
            }

            // check for the pressed left arrow key
            if(this.keyLeft && !this.keyRight) {
                newOffsetX = this.player.offsetLeft - this.gameConfig.player.speed;
                collision = this.collisionDetection(newOffsetX, parseInt(this.player.style.bottom));

                this.collisionHandler(collision, newOffsetX, parseInt(this.player.style.bottom));
                this.player.className = 'left';
            }

            // check for the pressed right arrow key
            if(this.keyRight && !this.keyLeft) {
                newOffsetX = this.player.offsetLeft + this.gameConfig.player.speed;
                collision = this.collisionDetection(newOffsetX, parseInt(this.player.style.bottom));

                this.collisionHandler(collision, newOffsetX, parseInt(this.player.style.bottom));
                this.player.className = 'right';
            }

            // check for the pressed space key
            if(this.keySpace && !this.player.jumping) {
                if(!this.player.flying && this.player.jumpable) {
                    this.player.jumping = true;
                    this.player.jumpable = false;
                    this.makePlayerJump();
                }
            }
            // if the player is still jumping move on with jump animation
            else if(this.player.jumping) {
                this.player.jumping = true;
                this.player.jumpable = false;
                this.makePlayerJump();
            }
            // finished jumping
            else
                this.player.jumpable = true;

            // if no key is pressed reset player sprite
            if(!this.keyLeft && !this.keyRight && !this.keySpace)
                this.makePlayerIdle();

            // check for background counter reset
            if(this.viewPort.background > this.gameConfig.viewport.backgrounds) {
                this.viewPort.background = 1;
                this.viewPort.className = this.gameConfig.viewport.bgClassName + this.viewPort.background;
            }

            // check for game over
            this.checkGameOver();

            this.gameCounter ++;
        }
    };
    
    /**
     * Internal function: Responsible for checking if the game is over
     */
    Engine2.prototype.checkGameOver = function () {
        if(this.player.offsetTop > 1500) {
            window.cEngine.loopStarted = false;
            window.cEngine.viewPort.removeChild(window.cEngine.canvas);
            
            var gameOverDiv = document.createElement("div");
            gameOverDiv.id = "game_over";
            gameOverDiv.appendChild(document.createTextNode("Game Over!"));
            
            var gameScore = document.createElement("div");
            gameScore.id = "score";
            gameScore.appendChild(document.createTextNode(Math.floor(window.cEngine.elevatorCounter) + " Points"));
            gameOverDiv.appendChild(gameScore);

            var retryBtn = document.createElement('input');
            retryBtn.id = 'retry_button';
            retryBtn.type = 'button';
            retryBtn.className = 'button';
            retryBtn.value = 'Try Again';
            retryBtn.setAttribute("onclick", "window.location.href = 'index.html';");
            
            window.cEngine.viewPort.appendChild(gameOverDiv);
            window.cEngine.viewPort.appendChild(retryBtn);
        }
    }
    
    /**
     * Internal function: Core method which checks for collision with blocks
     * or the walls
     */
    Engine2.prototype.collisionDetection = function (newOffsetX, newOffsetY) {
        var wallLeft = this.canvas.offsetLeft;
        var wallRight = this.canvas.offsetLeft + this.canvas.offsetWidth - this.gameConfig.player.x;
    
        // check for collision on walls
        if(newOffsetX < wallLeft || newOffsetX > wallRight) 
            return 0;
        
        // check for end of block - start of falling
        else if (!this.player.flying && !this.player.jumping && (this.player.offsetLeft + this.player.offsetWidth < this.blockActive.offsetLeft || 
            this.player.offsetLeft > this.blockActive.offsetLeft + this.blockActive.offsetWidth)) {
            
            return 1;
        }
        // check for new blocks to land
        else if (this.player.flying) {        
            var blocks = [];
        
            for(var i = 0; i < this.canvas.childNodes.length-1; i++) {
                blocks[i] = this.canvas.childNodes[i+1];
            }
            
            for(var i in blocks) {
                if((this.player.offsetLeft + this.player.offsetWidth > blocks[i].offsetLeft && 
                    this.player.offsetLeft < blocks[i].offsetLeft + blocks[i].offsetWidth) &&
                    (this.player.offsetTop + this.gameConfig.player.x >= (blocks[i].offsetTop - this.gameConfig.block.size / 3) && 
                    this.player.offsetTop + this.gameConfig.player.x <= blocks[i].offsetTop)) {

                    this.blockActive = blocks[i];
                    
                    return 2;
                }
            }
        }
        
        return 3;
    };
    
    /**
     * Internal function: Get's the return value from the collision detection
     * and handles further actions
     */
    Engine2.prototype.collisionHandler = function (ret, newOffsetX, newOffsetY) {
        switch(ret) {
            case 0:
                console.log("Event: Wall reached. Movement blocked.");
                break;
            case 1:
                this.player.flying = true;
                this.player.flyingTime = 0;
                this.player.jumpable = false;
                console.log("Event: Lost platform. Started flying.");
                break;
            case 2:
                this.player.flying = false;
                this.player.flyingTime = 0;

                // regulate and place player on block
                this.player.style.bottom = parseInt(this.blockActive.style.bottom) + this.gameConfig.block.size + 'px';
                
                console.log("Event: Stopped flying. Found platform.");
                break;
            default:
                this.player.style.left = Math.floor(newOffsetX) + 'px';
                this.player.style.bottom = Math.floor(newOffsetY) + 'px';
        }
    };
    
    /**
     * Internal function: Changes the player sprite to idle (not walking)
     */
    Engine2.prototype.makePlayerIdle = function () {
        this.player.className = 'idle';
    };
    
    /**
     * Internal function: Responsible for the player jumping animations
     */
    Engine2.prototype.makePlayerJump = function () {
        var jumpFactor = Math.floor(2 * Math.pow(1.5, 11 - this.gameConfig.physics.gravity));
        this.player.jumpingTime ++;
        
        // if the maximal jumping time is reachead stop jumping, start flying
        if(this.player.jumpingTime >= jumpFactor) {
            this.player.jumping = false;
            this.player.jumpingTime = 0;
            
            this.player.flying = true;
        }
        // else generate animation and move the player to the top
        else {
            this.player.style.bottom = parseInt(this.player.style.bottom) + 
                (Math.floor((jumpFactor / 2) / this.player.jumpingTime * this.gameConfig.player.jumpPower)) + 'px';
        }
    };
    
    /**
     * Internal function: Core method which checks the collision with blocks
     */
    Engine2.prototype.makePlayerFall = function () {
        if(this.player.flyingTime <= 30)
            this.player.flyingTime ++;
        
        var collision = this.collisionDetection(this.player.offsetLeft, parseInt(this.player.style.bottom));
        var newOffsetY = parseInt(this.player.style.bottom) - (this.gameConfig.physics.gravity + Math.floor(this.player.flyingTime / 10));
        
        this.collisionHandler(collision, this.player.offsetLeft, newOffsetY);
    };
    
    /**
     * Internal function: Checks if new blocks have to be created to jump on
     */
    Engine2.prototype.checkCreateNewBlocks = function () {   
        if(this.canvas.lastChild.offsetTop + this.canvas.offsetTop >= 0) {
            this.addBlocks();
            console.log("Event: New Blocks added");
        }
    };
    
    /**
     * Internal function: Checks if old blocks have to be deletet from canvas
     */
    Engine2.prototype.checkDeleteOldBlocks = function () {
        if(this.canvas.childNodes[1].offsetTop + (this.canvas.offsetTop * 2) > 0) {
            this.canvas.removeChild(this.canvas.childNodes[1]);
            console.log("Event: Old Block deleted");
        }
    }
    
    /**
     * Internal function: Moves the game canvas constantly to the bottom
     * and is responsible for the movement increase of the elevator
     */
    Engine2.prototype.moveElevator = function () {
        this.elevatorCounter += this.gameConfig.elevator.speed / this.gameConfig.elevator.brake;
        this.canvas.style.bottom = '-' + Math.floor(this.elevatorCounter) + 'px';
        
        if(this.gameCounter % (500 * this.elevatorStep) == 0) {
            if(this.elevatorStep % 3 == 0)
                this.gameConfig.elevator.brake += 0.6;
            
            this.gameConfig.elevator.speed ++;
            this.elevatorStep ++;
            this.blockColor ++;
            
            this.gameCounter = 0;
        }
    };
    
    /**
     * Internal function: Creates the game-level-canvas into the viewport
     */
    Engine2.prototype.addCanvas = function () {
        // create elements and assign them attributes
        this.canvas = document.createElement('div');
        this.canvas.id = 'canvas';
        
        // assign styles from game config
        this.canvas.style.width = this.gameConfig.viewport.x + 'px';
        
        // add viewport to the given wrapper
        this.viewPort.appendChild(this.canvas);
    };
    
    /**
     * Internal function: Fills the game canvas with blocks to jump on
     */
    Engine2.prototype.addBlocks = function () {
        var maxBlocks = Math.floor(this.gameConfig.viewport.x / this.gameConfig.block.paddingY) + 2;
        
        for(var i = 0; i < maxBlocks; i++) {
            // create block element and determine width and offsetX
            var block = document.createElement('div');
            var blockWidth = this.getRandom(this.gameConfig.block.minGroup, this.gameConfig.block.maxGroup) * this.gameConfig.block.size;
            var blockOffsetX = this.getRandom(0,(this.gameConfig.viewport.x - blockWidth));
            
            // if the offset left is smaller than allowed set to minimum
            if(blockOffsetX < this.gameConfig.block.paddingX)
                blockOffsetX = this.gameConfig.block.paddingX;
            
            block.style.left = blockOffsetX + 'px';
            
            // if offset right is smaller than allowed set to minimum
            if((this.gameConfig.viewport.x - (blockWidth + blockOffsetX)) < this.gameConfig.block.paddingX)
                block.style.left = blockOffsetX - (this.gameConfig.block.paddingX - (this.gameConfig.viewport.x - (blockWidth + blockOffsetX))) + 'px';

            // settings for the game before start
            if(!this.loopStarted) {
                if(i == 0) {
                    blockWidth = this.gameConfig.viewport.x;
                    blockOffsetX = 0;
                    block.style.left = blockOffsetX + 'px';
                    this.blockOffsetY = 0;
                }
                else
                    this.blockOffsetY = i * (this.gameConfig.block.paddingY);
            }
            // settings for the game while looping
            else
                this.blockOffsetY = this.blockOffsetY + ((this.gameConfig.block.paddingY));

            // check if block colors exceeded
            if(this.blockColor > this.gameConfig.block.colors) {
                this.blockColor = 1;
                this.viewPort.background ++;
                this.viewPort.className = this.gameConfig.viewport.bgClassName + this.viewPort.background;
            }

            // set styles
            block.style.width = blockWidth + 'px';
            block.style.height = this.gameConfig.block.size + 'px';
            block.style.bottom = this.blockOffsetY + 'px';
            block.className = 'block ' + this.gameConfig.block.colorsClassName + this.blockColor;
            
            // append the block to the game canvas
            this.canvas.appendChild(block);
        }
        
        this.canvas.style.height = this.blockOffsetY + (this.gameConfig.viewport.x);
    };
    
    /**
     * Internal function: Determines the spawnpoint and generates player
     */
    Engine2.prototype.addPlayer = function () {        
        // determine spawnpoints
        var spawnpointX = (parseInt(this.gameConfig.viewport.x) / 2) - parseInt(this.gameConfig.player.x / 2);
        var spawnpointY = parseInt(this.gameConfig.block.size);
        
        // create player node and assign styles and spawnpoints
        this.player = document.createElement('div');
        this.player.id = 'player';
        this.player.className = 'idle';
        this.player.style.width = this.gameConfig.player.x + 'px';
        this.player.style.height = this.gameConfig.player.y + 'px';
        this.player.style.left = spawnpointX + 'px';
        this.player.style.bottom = spawnpointY + 'px';
        
        // append to wrapper
        this.canvas.appendChild(this.player);
        
        console.log('Player Spawnpoint: ' + spawnpointX + 'px', spawnpointY + 'px');
    };
    
    /**
     * Internal function: Returns a random integer value from min to max
     */
    Engine2.prototype.getRandom = function (min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    /**
     * Internal function: Main Event handler
     */
    Engine2.prototype.handleEvent = function (e) {
        if (typeof(this[e.type]) === 'function' ) {
            return this[e.type](e);
        }
        else
            return false;
    };
    
    /**
     * Executable function: Overrides the gravity set in the configuration
     */
    Engine2.prototype.setGravity = function (val) {
        this.gameConfig.physics.gravity = val;
    }
    
    /**
     * Executable function: Overrides the player speed set in the configs
     */
    Engine2.prototype.setPlayerSpeed = function (val) {
        this.gameConfig.player.speed = val;
    }
    
    /**
     * Executable function: Overrides the elevator speed set in the configs
     */
    Engine2.prototype.setElevatorSpeed = function (val) {
        this.gameConfig.elevator.speed = val;
    }

    /**
     * Internal function: Small api for optimized and smoother animations
     */
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function( callback ){
                window.setTimeout(callback, 1000 / window.cEngine.gameConfig.animation.fps);
                };
    })();

    // public function
    window.Engine2 = Engine2;
    
})();