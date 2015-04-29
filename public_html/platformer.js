            //character graphics adapted from a character from Smack!
            //by creek23.  original file released via creative commons
            //and available at http://opengameart.org/users/creek23

            var score, stats, scene, menuScreen, character, ghost, fairLass,
                    blocks, background, bgHeight, bgWidth, bgArray, bgIndex,
                    timer, HitMarker, QuickScope, backgroundMusic, onMenu,
                    deathText, menuText, howToText, menuSelected, previousKeys,
                    menuItems;

            function Character() {
                tCharacter = new Sprite(scene, "images/MaleBase.png", 30, 50);
                tCharacter.direction = "none";
                tCharacter.jumping = false;
                tCharacter.setSpeed(0);
                tCharacter.setBoundAction(CONTINUE);
                tCharacter.setPosition(blocks[0].x, blocks[0].y - 60)
                tCharacter.falling = true;
                tCharacter.alive = true;
                // Controls 
                tCharacter.checkKeys = function () {
                    // A moves character to left.
                    if (keysDown[K_LEFT]) {
                        this.direction = "left";
                        if (this.dx > -5)
                            this.dx -= 0.5;
                    } else if (keysDown[K_RIGHT]) {
                        this.direction = "right";
                        if (this.dx < 5)
                            this.dx += 0.5;
                    } else {
                        if (!this.jumping)
                            this.direction = "none";
                        if (this.dx < -0.5)
                            // 0.1 and 0.4 provide reasonalbe slow down rate
                            this.dx += 0.1 + 0.4 * !this.falling;
                        else if (this.dx > 0.5)
                            this.dx -= 0.1 + 0.4 * !this.falling;
                        else
                            this.dx = 0;

                    }
                    // W makes the character jump.
                    if (keysDown[K_UP]) {

                        if (this.falling == false) {
//                            this.setImage("MaleUp.png");
                            this.jumping = true;
                            this.y -= 12;
                            this.falling = true;
                            this.addVector(0, 10);
                        } // end if
                    } else {
                        checkFalling();
                    }// end if
                } // end checkKeys

                tCharacter.updateImage = function () {
                    if (this.jumping) {
                        if (this.direction === "left")
                            this.setImage("images/MaleUpLeft.png");
                        else //if (this.direction === "right")
                            this.setImage("images/MaleUp.png");
                    } else {
                        if (this.direction === "right")
                            this.setImage("images/MaleRight.png");
                        else if (this.direction === "left")
                            this.setImage("images/MaleLeft.png");
                        else
                            this.setImage("images/MaleBase.png");
                    }
//                    ghost.setImage(this.image.src);
//                    ghost.image.style.opacity = "0.1";
//                    console.log(ghost.image.style)
                }

                tCharacter.checkGravity = function () {
                    if (this.falling) {
                        this.addVector(180, 0.3);
                    } // end if
                } // end checkGravity

                return tCharacter;
            } // end character def

            // The Ghost class can be used for motion blur
            function Ghost() {
                tGhost = new Sprite(scene, "images/MaleBase.png", 30, 50);
                tGhost.setSpeed(0);
                tGhost.setBoundAction(CONTINUE);

                return tGhost;
            }

            function FairLass() {
                tFairLass = new Sprite(scene, bgArray[1], 80, 60);
                tFairLass.setSpeed(0);
                tFairLass.setBoundAction(CONTINUE);
                // Sets the goal to the top right of the screen
                tFairLass.setPosition(750, 50);
                return tFairLass;
            }

            function Block() {
                tBlock = new Sprite(scene, "images/block.png", 100, 50);

                tBlock.setSpeed(1);
                // Spawns block at bottom left of the screen
                tBlock.setPosition(200, 560);
                tBlock.setBoundAction(CONTINUE);
                tBlock.checkLanding = function () {
                    //see if the character has landed on me
                    if (this.collidesWith(character)) {
                        bTop = this.y - (this.height / 2.5);
                        cBottom = character.y + (character.height / 2);

                        if (this.x + this.width/2 > character.x - 10 && this.x - this.width/2 < character.x + 10) {
                            if (this.y > character.y - character.height - 10 && this.y < character.y && character.falling === true) {
                                character.dy = 0;
                                character.y += 10;// = this.y + 60;
                            } else if (this.y - 15 < character.y) {
                                if (this.x < character.x) {
                                    // 15 keeps character form bouncing excessivelyy
                                    // or clipping through the platform
                                    character.x = this.x + this.width/2 + 15;
                                    character.dx = 0;
                                }
                                else {
                                    character.x = this.x - this.width/2 - 15;
                                    character.dx = 0;
                                }
                            } else {
                                if (cBottom >= bTop) {
                                    character.falling = false;
                                    character.jumping = false;
//                                    character.dy = 5;//Math.abs(this.dy);
                                    character.dy = this.dy;
                                    // 5 provides maximal smoothness
                                    character.y = this.y - this.height + 5;
                                    character.x += this.dx;
                                    //back up 
                                    //this.setPosition((this.x - this.dx * 3), (this.y - this.dy));
                                } // end if
                            }
                        }
                    } else {
                        //character.falling = true;   
                    }// end if
                } // end checkLanding

                tBlock.checkDrag = function () {
                    //allow the block to be draggable
                    if (this.isClicked()) {
                        this.setPosition(scene.getMouseX(), scene.getMouseY());
                    } // end if

                } // end checkDrag

                return tBlock;
            } // end block def

            function makeBlocks() {
                bWidth = 100;
                bHeight = 50;
                blocks = new Array(3);
                for (i = 0; i < blocks.length; i++) {
                    blocks[i] = new Block();
                    blocks[i].setSpeed(i + 2);
                    blocks[i].setPosition(scene.width/8 + (scene.width - scene.width/8) / 
                            blocks.length * i,
                        scene.height - 100 - ((scene.height - scene.height/3) / blocks.length * i)
                            + Math.random() * scene.height/6 - scene.height/12);

                } // end for loop
            } // end makeBlocks

            function updateBlocks() {
                for (i = 0; i < blocks.length; i++) {
                    blocks[i].checkLanding();
//                    blocks[i].checkDrag();
                    // i + 2 provies the optium circular motion
                    blocks[i].changeMoveAngleBy(i + 2);
                    // 4 and 10 provide fast yet followable stretch modulation
                    blocks[i].width += 4 * Math.sin(timer.getElapsedTime() * 10);
                    blocks[i].update();
                } // end for
            } // end checkLanding

            function checkFalling() {
                //if not touching any of the blocks, set falling to true;
                character.falling = true;
                for (i = 0; i < blocks.length; i++) {
                    if (character.collidesWith(blocks[i])) {
                        character.falling = true;
                    } // end if
                } // end for
            } // end checkFalling

            function checkWin() {
                if (character.collidesWith(fairLass)) {
                    QuickScope.play();
                    score++;
//                    document.location.href = "";
                    background.setImage(bgArray[bgIndex++]);
                    if (bgIndex >= bgArray.length)
                        bgIndex = 0;
                    fairLass.setImage(bgArray[bgIndex]);
                    makeBlocks();
                    character.setPosition(blocks[0].x, blocks[0].y - 60);

                }
            }

            function checkDie() {
                if (character.y > 650) {
                    HitMarker.play();
                    character.alive = false;
                    document.getElementById("deathScore").innerHTML = score;
                    menuScreen.style.display = "block";
                    menuText.style.display = "none";
                }
            }

            function waitForInput() {
                if (keysDown[K_ESC]) {

                }
                if (keysDown[K_DOWN]) {
                    reset();
                }
            }

            function updateStats() {
                stats.innerHTML = "Score: " + score;
            }

            function menuSelector(e) {
                switch (e.keyCode) {
                    case K_DOWN:
                        menuSelected++;
                        menuSelected = menuSelected % menuItems;
                        break;
                    case K_UP:
                        menuSelected--;
                        if (menuSelected < 0) menuSelected = menuItems - 1;
                        break;
                    default:
                }
            }

            function menu() {
                menuScreen.style.display = "block";
                menuText.style.display = "block";
                deathText.style.display = "none";
                
                
                menuStart.style.color = "rgb(150,150,150)";
                menuStart.style.textShadow = "";
                menuHowTo.style.color = "rgb(150,150,150)";
                menuHowTo.style.textShadow = "";
                switch (menuSelected) {
                    case 0:
                        menuStart.style.color = "#fff";
                        menuStart.style.textShadow = "0 0 5px #fff";
                        break;
                    case 1:
                        menuHowTo.style.color = "#fff";
                        menuHowTo.style.textShadow = "0 0 5px #fff";
                        break;
                    default:
                        
                }
            }

            function init() {
                stats = document.getElementById("stats");
                menuScreen = document.getElementById("menuScreen");
                menuText = document.getElementById("menuText");
                deathText = document.getElementById("deathText");
                menuStart = document.getElementById("menuStart");
                menuHowTo = document.getElementById("menuHowTo");
                document.addEventListener("keydown", menuSelector, false);
                

                previousKeys = keysDown;
                onMenu = true;
                menuItems = 2;
                menuSelected = 0;
                score = 0;
                bgHeight = 800+400;
                bgWidth = 600+400;
                
                scene = new Scene();
                
                backgroundMusic = new Sound("audio/Dama-May.mp3");
                backgroundMusic.play();
                bgArray = [
                    "images/bg1.jpg",
                    "images/bg2.jpg",
                    "images/bg3.jpg",
                    //"images/bg4.jpg",
                    "images/bg5.jpg",
                ]
                scene.setSize(800, 600);
                scene.setPos(0, 0);
                menuScreen.style.left = document.getElementsByTagName("canvas").left
                bgIndex = 0;
                background = new Sprite(scene, bgArray[bgIndex++], bgWidth, bgHeight);
                background.setPosition(400, 300);
                background.setSpeed(0);
                fairLass = new FairLass();
                ghost = new Ghost();
                makeBlocks();
                character = new Character();
                timer = new Timer();
                scene.start();
                HitMarker = new Sound("audio/HitMarker.mp3");
                QuickScope = new Sound("audio/QuickScope.mp3");
            } // end init

            function reset() {
                score = 0;
                scene.setSize(800, 600);
                scene.setPos(0, 0);
                menuScreen.style.display = "none"
                bgIndex = 0;
                background = new Sprite(scene, bgArray[bgIndex++], bgWidth, bgHeight);
                background.setPosition(400, 300);
                background.setSpeed(0);
                fairLass = new FairLass();
                ghost = new Ghost();
                makeBlocks();
                character = new Character();
            } // end init

            function update() {
                scene.clear();
                background.changeImgAngleBy(score/2 *
                    Math.sin(timer.getElapsedTime() * 10 + 3.1415/4));
                background.update();
                
                if (onMenu) {
                    menu();
                } else {
                    if (character.alive) {
                        character.checkKeys();
                        updateStats();
                        character.updateImage();
                        character.update();
                        checkWin();
                        checkDie();
                        character.checkGravity();
                        ghost.setPosition(character.x - 3*character.dx,character.y - 3*character.dy);
                        ghost.update();
                    } else {
                        waitForInput();
                    }
                }

                fairLass.update();
                updateBlocks();

            } // end update

