//gamestates
var PLAY = 1;
var END = 0;
var gameState = PLAY;
var score;

//trex
var trex, trex_running, trex_collided, trex_ducking;
var ground, invisibleGround, groundImage;

//spawning clouds and obstacles
var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6;
var birdsGroup, birdImg;

//game over and sound
var gameOverImg,restartImg
var jumpSound , checkPointSound, dieSound


function preload(){
  //trex animations
  trex_running = loadAnimation("trex1.png","trex3.png","trex4.png");
  trex_collided = loadAnimation("trex_collided.png");
  trex_ducking = loadAnimation("trexDucking.png");
  
  //scrolling background images
  groundImage = loadImage("ground2.png");
  cloudImage = loadImage("cloud.png");
  
  //obstacles
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");
  birdImg = loadAnimation("bird.png", "bird2.png", "bird.png");
  
  //game over and restart
  restartImg = loadImage("restart.png")
  gameOverImg = loadImage("gameOver.png")
  
  //sounds
  jumpSound = loadSound("jump.mp3")
  dieSound = loadSound("die.mp3")
  checkPointSound = loadSound("checkPoint.mp3")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  //creating trex
  trex = createSprite(50,height-50,20,50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided" ,trex_collided);
  trex.addAnimation("ducking", trex_ducking);
  trex.scale = 1;
  
  //creating the ground
  ground = createSprite(width/2,height-48,400,20);
  ground.addImage("ground",groundImage);
  ground.x = ground.width/2;
  
  //creating game over and restart
  gameOver = createSprite(width/2,height/2-100);
  gameOver.addImage(gameOverImg);

  restart = createSprite(width/2,height/2);
  restart.addImage(restartImg);
  
  gameOver.scale = 1;
  restart.scale = 1;
  
  //invisible ground code
  invisibleGround = createSprite(200,height-45,400,10);
  invisibleGround.visible = false;
  
  //create Obstacle and Cloud Groups
  obstaclesGroup = new Group();
  cloudsGroup = new Group();
  birdsGroup = new Group();
  
  score = 0;
  trex.setCollider("circle",0,0,40);
  trex.debug = false;
  
}

function draw() {
  background(180);

  //displaying score
  textSize(24);
  fill("black")
  text("Score: "+ score, width-180,40);
  
  if(gameState === PLAY){
    //making the game over and restart invisible
    gameOver.visible = false
    restart.visible = false

    //move the ground
    ground.velocityX = -6 - score/400;

    //scoring
    score = score + Math.round(getFrameRate()/50);
    
    if (ground.x < 0){
      ground.x = ground.width/2;
    }
    
    //jump when the space key is pressed
    if((keyDown("space")||touches.length>0) && trex.y >= height-100){
        trex.velocityY = -15;
        jumpSound.play();
        touches = [];
    }

    //making the dinosaur duck
    if(keyWentDown("down")||touches.length>2) {
        trex.changeAnimation("ducking", trex_ducking);
        trex.setCollider("rectangle", 0, 0, 30, 30)
        touches = [];
    }
    else if(keyWentUp("down")){
        trex.changeAnimation("running", trex_running);
        trex.setCollider("circle",0,0,40);
    }

    
    //add gravity
    trex.velocityY = trex.velocityY + 0.8
  
    //spawn the clouds
    spawnClouds();
  
    //spawn obstacles on the ground
    spawnObstacles();
    
    if(obstaclesGroup.isTouching(trex)||(birdsGroup.isTouching(trex))){
        //changing collider radius
        trex.setCollider("circle",0,0,40);
        gameState = END;
        dieSound.play();
    }
    
    //playing checkpoint sound
    if (score > 0 && score % 400 === 0){
      checkPointSound.play();
    }

    //making the birds to spawn
    if (score > 500){
      spawnBirds();
    }
  }
   else if (gameState === END) {
      //game over + restart visible
      gameOver.visible = true;
      restart.visible = true;
     
      //stopping everything
      ground.velocityX = 0;
      trex.velocityY = 0;
     
      //change the trex and bird animation
      trex.changeAnimation("collided", trex_collided);
     
      //set lifetime of the game objects so that they are never destroyed
      obstaclesGroup.setLifetimeEach(-1);
      cloudsGroup.setLifetimeEach(-1);
      birdsGroup.setLifetimeEach(-1);
      obstaclesGroup.setVelocityXEach(0);
      cloudsGroup.setVelocityXEach(0);
      birdsGroup.setVelocityXEach(0);
   }
  
 
  //stop trex from falling down
  trex.collide(invisibleGround);
  
  //restart button functionality
  if(mousePressedOver(restart)){
    reset();
  }
  
  //drawing sprites
  drawSprites();
}

function spawnObstacles(){
 if (frameCount % 120 === 0){
   var obstacle = createSprite(width,height-80,10,40);
   obstacle.velocityX = -6 -score/400;
   
    //generate random obstacles
    var rand = Math.round(random(1,6));
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      case 4: obstacle.addImage(obstacle4);
              break;
      case 5: obstacle.addImage(obstacle5);
              break;
      case 6: obstacle.addImage(obstacle6);
              break;
      default: break;
    }
   
    //assign scale and lifetime to the obstacle           
    obstacle.scale = 1;
    obstacle.lifetime = 300;
   
   //add each obstacle to the group
    obstaclesGroup.add(obstacle);
 }
}

function spawnClouds() {
  //write code here to spawn the clouds
  if (frameCount % 110 === 0) {
    cloud = createSprite(width,height-200,40,10);
    cloud.y = Math.round(random(10,height/3));
    cloud.addImage(cloudImage);
    cloud.scale = 2;
    cloud.velocityX = -6 - score/400;
    
     //assign lifetime to the variable
    cloud.lifetime = width;
    
    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //adding cloud to the group
   cloudsGroup.add(cloud);
    }
}

function spawnBirds() {
  //write code here to spawn the birds
  if (frameCount % 200 === 0) {
    bird = createSprite(width,height-160,40,10);
    bird.addAnimation("bird",birdImg);
    bird.scale = 1;
    bird.velocityX = -6 - score/400;
    
    //assign lifetime to the variable
    bird.lifetime = width;
    
    //adjust the depth
    bird.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //adding bird to the group
    birdsGroup.add(bird);
    }
}

function reset() {
  //changing gamestate
  gameState = PLAY;
  score = 0;

  //making everything invisible
  gameOver.visible = false;
  reset.visible = false;

  //destroying existing obstacles 
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();
  birdsGroup.destroyEach();

  //changing the trex back to running
  trex.changeAnimation("running",trex_running);
}