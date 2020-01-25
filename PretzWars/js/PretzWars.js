//  Variables used to store the height and width of the window		
	var w = window.innerWidth * window.devicePixelRatio;
	var h = window.innerHeight * window.devicePixelRatio;
	
	if(w>h)
	{
		// We set the tilt information off and start the game
		document.getElementById("tilt_phone").style.display = "none";	
		document.getElementById("PretzWars").style.display = "block";
	}

// Game references
	var game;
	var height = 768;
	var width = 1024;

// Tile sprite background 
	var tileBG;
	
// Sprites for the preload functions
	var preload_empty;
	var preload_full;

// Sprites with their tweens
	var game_over_tween;
	var game_over;
	
	var you_win_tween;
	var you_win;

	var ufo;		
	var ufo_tween;

	var new_level;
	var new_level_tween;
	
	var logo;
	var logo_tween;
	
	var dancing_alien;
	var platform;
	var you_rock;
	var you_rock_tween;
	
// Buttons
	var retry_button;
	var retry_button_tween;
	
	var main_menu_button;
	var main_menu_button_tween;
	
	var instructions_button;
	var start_game_button;
	var next_button;	
	
	var reload_button;
	var close_button;

// Variables used for the groups of sprites
	var bullets;
	var bombs;
	var pretzels;
	var explosions;	
	var sbs;

// Variables used for the sounds	
	var zap_sound;
	var explosion_sound;
	var atmosphere_sound;
	var ufo_explosion_sound;
	var tudu_sound;
	var dondon_sound;		

// The text we are going to use
	var level_text;
	var pretzels_text;
	var instructions_text;
	var hb_text;
	
// Variables used to store useful stuffs
	var bullet_time=0;
	
	var pretzel_counter=0;
	var pretzel_total=0;
	
	var gameover = false;
	var win = false;
	
	var gyro_check=false;
	
	var max_speed=500;
	
	var generator = new Phaser.RandomDataGenerator();
	
	var max_vertical_bombs;
	var max_vertical_sb;
	var max_level=5;	
	
	var pointer;
	
	var control_text = "";
	var control_text2 = "";
	
	var instructions=[];					
	var instructions_state = 0;
/*	
 * This function is used to randomly add bombs
 */ 
	function randomBomb(group)
	{
		var randomY = this.generator.integerInRange(20, this.game.world.height-20); 
		var random_speed = this.generator.integerInRange(-100, -350);
		
		var bomb_ = group.create(game.world.width-(0.05*game.width),randomY,'bomb');
			bomb_.anchor.set(0.5,0.5);
			bomb_.outOfBoundsKill = true;		
			bomb_.checkWorldBounds = true;

			game.physics.arcade.enable(bomb_);	
			
			bomb_.body.velocity.x = random_speed;
	};

/*
 * Let's make the surfin' bretzors reach the pretzels
 */
	function setAccelerationToPretzel(sbs_group, pretzels_group)
	{				
			sbs_group.forEachAlive(function(sb)
			{
				game.physics.arcade.accelerateToObject(sb, pretzels_group.getRandom(0), level*15, level*60, level*60);	
			});
	};
	
/* 
 * This function is used to randomly create the pretzels
 */
	function randomPretzels(group, index)
	{
		// We add the pretzel randomly in a specific area [-20% centerX ; +1% centerX]
		var randomX = generator.integerInRange(Math.floor(game.world.centerX-(0.2*game.world.centerX)), Math.floor(game.world.centerX+(0.01*game.world.centerX)));
		var randomY = generator.integerInRange(60, game.world.height-60); 
		
		var pretzel_ = group.create(randomX, randomY, 'pretzel');
			pretzel_.name = 'pretzel' + index;
			pretzel_.anchor.set(0.5,0.5);
			pretzel_.animations.add('glitter',[0,1,2,3,4,4,3,2,1]);
			pretzel_.animations.play('glitter',10,true);
			
			this.game.physics.arcade.enable(pretzel_);	
			
			pretzel_.body.immovable = true;
	};

/* 
 * This function is used to randomly create our surfin' bretzors
 */
	function randomSurfinBretzor(group, index)
	{
		var surfin_bretzor_ = group.create(game.world.width-(0.015*game.width), (index+1)*70, 'sb');
			surfin_bretzor_.name = 'sb' + index;
			surfin_bretzor_.anchor.set(0.5,0.5);
			
			game.physics.arcade.enable(surfin_bretzor_);
			
			surfin_bretzor_.body.allowCollision = true;
			surfin_bretzor_.body.collideWorldBounds = true;		
			surfin_bretzor_.body.bounce.x = 5;
			surfin_bretzor_.body.bounce.y = 5;		
			surfin_bretzor_.body.maxVelocity.x = 500;
			surfin_bretzor_.body.maxVelocity.y = 500;
		
		var random_color = generator.integerInRange(0, 3);		
		
		switch(random_color)
		{
			case 0:
				surfin_bretzor_.animations.add('surf_bretzor_pink',[10,9,11,9]);
				surfin_bretzor_.animations.play('surf_bretzor_pink',20,true);
				break;
			
			case 1:
				surfin_bretzor_.animations.add('surf_bretzor_blue',[0,1,2]);
				surfin_bretzor_.animations.play('surf_bretzor_blue',15,true);
				break;
			
			case 2:
				surfin_bretzor_.animations.add('surf_bretzor_green',[3,5,5,4]);
				surfin_bretzor_.animations.play('surf_bretzor_green',10,true);
				break;
			
			case 3:
				surfin_bretzor_.animations.add('surf_bretzor_red',[6,7,8,7]);
				surfin_bretzor_.animations.play('surf_bretzor_red',5,true);
			break;
			
			default:
				break;
		}		
	};
	
/*
 * UFO collides the bombs
 */ 
	function ufoCollideBomb(bomb, ufo)
	{
		gameover = true;
		win = false;
		level = 1;
		pretzel_counter = 0;
		pretzel_total = 0;
		
		var x=ufo.x;
		var y=ufo.y;
		 
		bomb.kill();
		ufo.kill();
		 
		var explosion = game.add.sprite(x, y, 'ufo_explosion');
			explosion.anchor.set(0.5,0.5);		
			explosion.animations.add('ufo_explosion',[0,1,2,3,4,5,6,7,8,9,10]);
			explosion.animations.play('ufo_explosion',20,false,true);	
			
		ufo_explosion_sound.play();
	};

/* 
 * Colliding ufo with surfin' bretzors
 */
	function ufoCollideBretzors(ufo, bretzor)
	{		
		gameover = true;
		win = false;
		level = 1;
		pretzel_counter = 0;
		pretzel_total = 0;
	};

/* 
 * Colliding surfin' bretzors with pretzels
 */
	function sbCollidePretzel(sb, pretzel)
	{		
		var x = pretzel.x;
		var y = pretzel.y;
		
		pretzel.kill();
		
		//console.log(pretzels.countLiving() + " " + pretzels_counter);
				
		if(pretzels.countLiving()==0 && pretzel_counter<1)
		{			
			gameover = true;
			win = false;
			level = 1;
			pretzel_counter = 0;
			pretzel_total = 0;
		}
		else if(pretzels.countLiving()==0 && pretzel_counter>0)
		{
			newLevel();			
		}
		else
		{
			setAccelerationToPretzel(sbs, pretzels);
		}
	};
	
/*
 * Reset the bombs when level changes
 */	
	 function resetBombs()
	 {
		bombs.forEachDead(function(bomb){
			var randomY = generator.integerInRange(20, game.world.height-20); 
			var random_speed = generator.integerInRange(-100, -350);
			
			bomb.reset(game.world.width-(0.05*game.width),randomY);
			bomb.body.velocity.x = random_speed;
		});
	};
	
/*
 * Reset the sbs when level changes
 */	
	function resetSbs()
	{	
		sbs.forEachDead(function(sb){			
				var randomY = generator.integerInRange(60, game.world.height-60);
				sb.reset(game.world.width-(0.05*game.width),randomY);		
			});
	};
	
/*
 * Reset the pretzels when level changes
 */	
	function resetPretzels()
	{
		pretzels.forEachDead(function(pretzel){			
				// We add the pretzel randomly in a specific area [-20% centerX ; +1% centerX]
				var randomX = generator.integerInRange(Math.floor(game.world.centerX-(0.2*game.world.centerX)), Math.floor(game.world.centerX+(0.01*game.world.centerX)));
				var randomY = generator.integerInRange(60, game.world.height-60); 
				
				pretzel.reset(randomX,randomY);		
			});
	};
	
/* 
 * Reset UFO velocity - Useless
 */	
	function resetUFOVelocity()
	{
		ufo.body.velocity.set(0,0);
	};
	
/*
 * New level functions - Tweens
 */
	function newLevel()
	{
		killSurfinBretzors();
		killBombs();
		killBullets();
						
		pretzel_total += pretzel_counter;
		
		/*ufo_tween.to({x:ufo.width,y:game.world.centerY}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);	
		ufo_tween.onComplete.add(resetAll, this); */
		
		if(level<max_level)
		{
			win = false;
			
			level_text.visible = pretzels_text.visible = true;
			
			new_level.alpha = 0;
			new_level.visible = true;			
			new_level_tween.to({alpha: 1}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);	
			new_level_tween.onComplete.add(resetAll, this);			
		}
		else
		{	
			atmosphere_sound.stop();
			
			win = true;
			
			level_text.visible = pretzels_text.visible = false;
			
			var x=ufo.x;
			var y=ufo.y;	
			
			ufo.kill();
			 
			var explosion = game.add.sprite(x, y, 'ufo_explosion');
				explosion.anchor.set(0.5,0.5);		
				explosion.animations.add('ufo_explosion',[0,1,2,3,4,5,6,7,8,9,10]);
				explosion.animations.play('ufo_explosion',20,false,true);	
				
			you_win.alpha = 0;
			you_win.visible = true;
			you_win_tween.to({alpha: 1}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);
			you_win_tween.onComplete.add(function(){game.state.start('WinState');}, this);
		}
	};
	
/*
 * Reset all for new level
 */
	function  resetAll()
	{		
		new_level.visible = false;
		level++;
		pretzel_counter = 0;
		
		resetBombs();
		resetSbs();
		resetPretzels();	
		
		setAccelerationToPretzel(sbs,pretzels);	
		
		ufo.bringToTop();
		ufo.reset(ufo.width,game.world.centerY)
		ufo.body.velocity.set(0,0);
	};

/* 
 * Colliding ufo with bretzel
 */
	function ufoCollidePretzel(ufo, pretzel)
	{
		pretzel_counter++;
			
		var x = pretzel.x;
		var y = pretzel.y;
		
		pretzel.kill();		
				
		tudu_sound.play();
		
		if(pretzels.countLiving() == 0 && pretzel_counter>0)
		{
			newLevel();
		}
		else
		{		
			setAccelerationToPretzel(sbs, pretzels);
		}
	};
	
/* 
 * Colliding the bullets with the surfin' bretzors
 */
	function sbCollideBullets(bullet, sb)
	{
		var x = sb.x;
		var y = sb.y;
		
		sb.kill();
		bullet.kill();
		
		var explosion = explosions.getFirstExists(false);
			explosion.reset(x, y);
			explosion.animations.add('explosion',[0,1,2,3,4,5,6,7,8,9,10]);
			explosion.animations.play('explosion',30,false,true);
			
		explosion_sound.play();
	};

/*
 * Firing the bullets from the UFO
 */
	function fireBullet()
	{	
		var time_now = new Date();
		var ufo_temp = this.ufo;
		
		// We check the time between two shots and then fire if ok
		if((time_now.getTime()-this.bullet_time)>100 && !gameover)
		{
			zap_sound.play();			

			var bullet = bullets.getFirstExists(false);
				bullet.reset(ufo_temp.x+(ufo_temp.width/2)+10, ufo_temp.y);
				bullet.animations.add('fire_bullet',[0,1,2,3,4,5]);
				bullet.animations.play('fire_bullet',30,true);
				bullet.body.velocity.x = 500;	
				 
				bullet_time = time_now.getTime();			
		}			 
	};
	
/*
 * Let's check is the game is over or not
 */	
	function checkGameOver() 
	{
		if(gameover==true)
		{
			max_speed=0;
			killBombs();
			
			pretzel_counter = 0;
			pretzel_total = 0;
			
			if(ufo.worldVisible==true)
			{			
				ufo.outOfBoundsKill = true;		
				ufo.checkWorldBounds = true;
				ufo.body.collideWorldBounds = false;		
				ufo.body.velocity.x = 0;
				ufo.body.velocity.y = 500;				
			}

			var random_speed = generator.integerInRange(200, 600);
			
			bombs.setAll("body.velocity.x",0);
			
			sbs.setAll("body.velocity.x",0);
			sbs.setAll("body.velocity.y",0);
			
			sbs.forEachAlive(function(sb){
				sb.body.collideWorldBounds = false;
				sb.body.outOfBoundsKill = true;
				sb.body.checkWorldBounds = true;
				
				sb.body.maxVelocity.x = 500;	
				sb.body.velocity.x = -500;
			});
			
			pretzels.forEachAlive(function(pretzel){
				pretzel.body.velocity.y = random_speed;				
			});

			if(!game_over.visible)
			{				
				dondon_sound.play();		
				game_over.alpha = 0;
				game_over.visible = true;	
				game_over.bringToTop();				
				game_over_tween.to({alpha: 1,y:game_over.height}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);	

				retry_button = game.add.button(game.world.centerX, game.world.centerY-45, 'retry_button', function(){retryPretzWars('MainState');}, this, 1, 0, 1);
				retry_button.alpha = 0;
				retry_button.anchor.set(0.5,0.5);	
				retry_button.bringToTop();
				
				main_menu_button = game.add.button(game.world.centerX, game.world.centerY+32, 'main_menu_button', function(){retryPretzWars('MenuState');}, this, 1, 0, 1);
				main_menu_button.alpha = 0;	
				main_menu_button.anchor.set(0.5,0.5);	
				main_menu_button.bringToTop();
				
				retry_button_tween = game.add.tween(retry_button);
				retry_button_tween.to({alpha: 1}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);			

				main_menu_button_tween = game.add.tween(main_menu_button);
				main_menu_button_tween.to({alpha: 1}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);					
			}
		}
		else
		{
				tileBG.tilePosition.x -= 3;
		}
	};
	
/* 
 * Let's set the collisions
 */	
	function setCollisions()
	 {
		game.physics.arcade.collide(bullets, sbs, sbCollideBullets, null, this);	
		game.physics.arcade.collide(bombs, ufo, ufoCollideBomb, null, this);
		game.physics.arcade.overlap(ufo, pretzels, ufoCollidePretzel, null, this);		
		game.physics.arcade.overlap(ufo, sbs, ufoCollideBretzors, null, this);	
		game.physics.arcade.overlap(sbs, pretzels, sbCollidePretzel, null, this);
	}
	
/* 
 * Kill the mothafucka
 */	
	function killSurfinBretzors()
	{
		sbs.forEachAlive(function(sb){
				var x=sb.x;
				var y=sb.y;
				
				var explosion = explosions.getFirstExists(false);
				
				sb.kill();			
				
				explosion.reset(x, y);
				explosion.animations.add('explosion',[0,1,2,3,4,5,6,7,8,9,10]);
				explosion.animations.play('explosion',30,false,true);
					
				explosion_sound.play();				
			});	
	};

/* 
 * Kill the bullets
 */	
	function killBullets()
	{		
		bullets.forEachAlive(function(bullet){
			bullet.kill();
		});	
	};
	
/* 
 * Kill the bombs
 */		
	function killBombs()
	{		
		bombs.forEachAlive(function(bomb){
				var x=bomb.x;
				var y=bomb.y;
				var explosion = explosions.getFirstExists(false);
				
				bomb.kill();			
				
				explosion.reset(x, y);
				explosion.animations.add('explosion',[0,1,2,3,4,5,6,7,8,9,10]);
				explosion.animations.play('explosion',30,false,true);
					
				explosion_sound.play();				
			});
	};
	
/* 
 * Restart the game
 */		

function retryPretzWars(game_state)
{
	atmosphere_sound.stop();
	
	gameover = false;
	win = false;
	level=1;
	pretzel_total=0;
	pretzel_counter=0;
	
	gofull();
	game.state.start(game_state, true, false);
};

/* 
 * Check the inputs
 */		
 
function checkInputs()
{
	if(!gameover && !win){
		
		if(!game.device.desktop)
		{
			pointer = (gyro_check?game.input.pointer1:game.input.pointer2);
		}
		else
		{
			pointer = false;
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.UP) || game.input.keyboard.isDown(Phaser.Keyboard.W))
		{
			ufo.body.velocity.y -= 30;
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) || game.input.keyboard.isDown(Phaser.Keyboard.S))
		{
			ufo.body.velocity.y += 30;
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) || game.input.keyboard.isDown(Phaser.Keyboard.A))
		{
			ufo.body.velocity.x -= 5;
			ufo.angle = -5;
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || game.input.keyboard.isDown(Phaser.Keyboard.D))
		{		
			ufo.body.velocity.x += 5;
			ufo.angle = 5;
		}
		
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || pointer.isDown)
		{		
			 fireBullet();
		}	
		
		if(!game.device.desktop && !gyro_check)
		{
			game.physics.arcade.moveToPointer(ufo,600,game.input.pointer1, 200);
		}	
	}			
};

/* 
 * This function allows us to control the UFO from the gyroscope (if any)
 */
	function ufoGyroControl()
	{
		gyro.frequency = 10;
		
		var ufo_temp = ufo;
		
		gyro.startTracking(function(o){				
			ufo_temp.body.velocity.y -= (o.gamma);
			ufo_temp.body.velocity.x += (o.beta)*2;
			
			if(o.beta < 0 && ufo_temp.body.velocity.x < 2)
			{
				ufo_temp.angle = -5;
			}
			else if(o.beta > 0 && ufo_temp.body.velocity.x > 2)
			{
				ufo_temp.angle = 5;
			}	
			else
			{
				ufo_temp.rotation = 0;
			}		
		});
	};
	
/*
 * Boot state
 */
 var BootState = {
   preload: function() {
        game.load.image('preload_full', 'assets/sprites/preload_full.png');
        game.load.image('preload_empty', 'assets/sprites/preload_empty.png');

    },
    create: function() {
        if (game.device.desktop){
             game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
             game.scale.maxWidth = 1024;
             game.scale.maxHeight = 768;
             game.scale.pageAlignHorizontally = true;
             game.scale.pageAlignVertically = true;
	     game.scale.updateLayout(true);
             //game.scale.setScreenSize(true);
         }
         else{  
             game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
             game.scale.minWidth = 400;
             game.scale.minHeight = 300;
             game.scale.maxWidth = 1024;
             game.scale.maxHeight = 768;
             game.scale.pageAlignHorizontally = true;
             game.scale.pageAlignVertically = true;
             game.scale.forceOrientation(true, false,'orientation'); //landscape, portrait, incorrectorientation image
             game.scale.enterIncorrectOrientation.add(enterIncorrectOrientation);
             game.scale.leaveIncorrectOrientation.add(leaveIncorrectOrientation);
             //game.scale.setScreenSize(true);
	     game.scale.updateLayout(true);
             game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
         }
        game.state.start('PreloadState');
    }	 
 };

/*
 * Preload state used to pre-cache all the sprites and sounds
 */
var PreloadState = {
	preload : function(){
		preload_empty = game.add.sprite(0, 0, 'preload_empty');
		preload_full = game.add.sprite(0,0,'preload_full');
		
        // Center the preload bar
        preload_empty.x = preload_full.x = game.world.centerX - preload_empty.width / 2;
        preload_empty.y = preload_full.y = game.world.centerY - preload_empty.height / 2;
			game.load.setPreloadSprite(preload_full);  
			
		// Static images are loaded
		game.load.image('space_bg', 'assets/sprites/space_bg.jpg');
		game.load.image('bomb', 'assets/sprites/bomb.png');
		game.load.image('logo', 'assets/sprites/logo.png');	
		game.load.image('logo_small', 'assets/sprites/logo_small.png');	
		game.load.image('game_over','assets/sprites/game_over.png');
		game.load.image('new_level','assets/sprites/new_level.png');
		game.load.image('you_win','assets/sprites/you_win.png');
		game.load.image('platform','assets/sprites/platform.png');		
		game.load.image('you_rock','assets/sprites/you_rock.png');	
		
		// Each spritesheets are loaded
		game.load.spritesheet('ufo','assets/sprites/ufo.png',130,72,6);
		game.load.spritesheet('pretzel','assets/sprites/pretzel.png',41,55,5);
		game.load.spritesheet('sb','assets/sprites/surfin_bretzor.png',79,54,12);
		game.load.spritesheet('bullet','assets/sprites/bullet.png',24,9,6);
		game.load.spritesheet('explosion','assets/sprites/explosion.png',100,83,11);
		game.load.spritesheet('ufo_explosion','assets/sprites/ufo_explosion.png',156,132,11);
		game.load.spritesheet('explosion_green','assets/sprites/explosion_green.png',100,83,11);
		game.load.spritesheet('bullet_round','assets/sprites/bullet_round.png',17,17,3);
		game.load.spritesheet('dancing_alien','assets/sprites/dancing_alien.png',37,88,7);
		
		// Buttons 
		game.load.spritesheet('retry_button','assets/sprites/retry_button.png',425,64,2);
		game.load.spritesheet('main_menu_button','assets/sprites/main_menu_button.png',425,64,2);
		game.load.spritesheet('instructions_button','assets/sprites/instructions_button.png',425,64,2);
		game.load.spritesheet('start_game_button','assets/sprites/start_game_button.png',425,64,2);
		game.load.spritesheet('next_button','assets/sprites/next_button.png',425,64,2);
		game.load.spritesheet('reload_button','assets/sprites/reload_button.png',80,80,2);
		game.load.spritesheet('close_button','assets/sprites/close_button.png',80,80,2);	
		
		// We load the audio
		game.load.audio('atmosphere', ['assets/sounds/atmo.ogg','assets/sounds/atmo.mp3']);
		game.load.audio('zap', ['assets/sounds/zap.ogg','assets/sounds/zap.mp3']);
		game.load.audio('explosion', ['assets/sounds/explosion.ogg','assets/sounds/explosion.mp3']);
		game.load.audio('ufo_explode', ['assets/sounds/ufo_explode.ogg','assets/sounds/ufo_explode.mp3']);
		game.load.audio('tudu', ['assets/sounds/tudu.ogg','assets/sounds/tudu.mp3']);
		game.load.audio('dondon', ['assets/sounds/dondon.ogg','assets/sounds/dondon.mp3']);
		
		// We load the bitmap fonts
		game.load.bitmapFont('rebellion', 'assets/fonts/rebellion.png', 'assets/fonts/rebellion.xml');
	},
	
	create : function()
	{
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.refresh();
		
		game.stage.backgroundColor = '#000000';	
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		// AdvancedTiming = true for checking FPS
			//game.time.advancedTiming = true;
			
		level = 1;

		// We compute the maximum numbers of surfin' bretzors and vertical bombs
		max_vertical_sb =  Math.floor(this.game.height / 70);	
		max_vertical_bombs =  Math.floor((this.game.height / 60)/2.5);	
		
		game.state.start('MenuState');		
	}
};

/*
 * Win state
 */ 
var WinState = {
	create : function()
	{
		// The background image is added as a TileSprite
		tileBG = game.add.tileSprite(0, 0, w, h, 'space_bg');	
		
		/* close_button = game.add.button(game.world.width - 60, game.world.centerY,'close_button', function(){game.scale.stopFullScreen();retryPretzWars('MenuState');}, this, 1, 0, 1);
			close_button.anchor.set(0.5,0.5);
			close_button.visible = false; */
			
			
		reload_button = game.add.button(60, game.world.centerY,'reload_button', function(){retryPretzWars('MenuState');}, this, 1, 0, 1);
			reload_button.anchor.set(0.5,0.5);
			reload_button.visible = true;
		
		you_rock = game.add.sprite(game.world.centerX+110,game.world.centerY+40,'you_rock');
			you_rock.anchor.set(0.5,0.5);
			you_rock.visible=false;
			you_rock.alpha = 0;
			
		you_rock_tween = game.add.tween(you_rock);
			
		platform = game.add.sprite(game.world.centerX, game.world.height-75, 'platform');
			platform.anchor.set(0.5,0.5);
			
			game.physics.arcade.enable(platform);
				platform.body.immovable = true;
		
		dancing_alien = game.add.sprite(game.world.centerX, game.world.centerY, 'dancing_alien');
			dancing_alien.anchor.set(0.5,1);	
			dancing_alien.animations.add('dancing',[1,2,3,4,5,6,5,4,3,2]);
			dancing_alien.animations.play('dancing',11,true);
		
			game.physics.arcade.enable(dancing_alien);
				dancing_alien.body.collideWorldBounds = true;
				dancing_alien.body.bounce.y = 0.2;
				dancing_alien.body.gravity.y = 300;

				
		// We add the text with the specific bitmap font for the instructions
		hb_text = game.add.bitmapText(Math.floor(game.world.width/5), 30, 'rebellion', '', 35);
			hb_text.align='center';
			hb_text.width = game.world.width;
			hb_text.setText("HAPPY BIRTHDAY XXXXXXX !\nYOU ARE AWESOME !\nHAVE A NICE DAY :)");
	},
	
	update : function()
	{
		tileBG.tilePosition.x -= 5;
		game.physics.arcade.collide(dancing_alien, platform);
		
		// if(game.scale.isFullScreen)close_button.visible=true;
		
		if(dancing_alien.body.touching.down && you_rock.visible==false)
		{
			you_rock.visible=true;
			you_rock_tween.to({alpha: 1}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);	
		}
	}
};

/*
 * Instruction State
 */
var InstructionState = {
	create : function()
	{	
		// The background image is added as a TileSprite
		tileBG = game.add.tileSprite(0, 0, w, h, 'space_bg');
		
		next_button = game.add.button(game.world.centerX, game.height-55,'next_button', function(){instructions_state++;}, this, 1, 0, 1);
			next_button.anchor.set(0.5,0.5);
			next_button.visible = true;
			
		start_game_button = game.add.button(game.world.centerX, game.height-55,'start_game_button', function(){gofull();game.state.start('MainState');}, this, 1, 0, 1);
			start_game_button.anchor.set(0.5,0.5);
			start_game_button.visible = false;		
			
		// Let's create the UFO and set its properties
		ufo = game.add.sprite(100, game.world.centerY, 'ufo');
			ufo.visible = false;
			ufo.anchor.set(0.5,0.5);		
			ufo.animations.add('right_ufo',[0,1,2,3,4,5]);
			ufo.animations.play('right_ufo',10,true);
		
			game.physics.arcade.enable(ufo);
			
			ufo.body.collideWorldBounds = false;
			ufo.body.outOfBoundsKill = true;
			ufo.body.velocity.x = 0;
			ufo.body.maxVelocity.x = 1000;		
			ufo.body.velocity.y = 0;
			ufo.body.maxVelocity.y = 1000;	
		
		// We add the text with the specific bitmap font for the instructions
		instructions_text = game.add.bitmapText(10, 10, 'rebellion', '', 35);
		instructions_state = 0;
	},
	
	update : function()
	{
		control_text = (game.device.desktop?"(arrow keys or W A S D)":"(multi-touch)");
		control_text2 = (game.device.desktop?"\nUse spacebar to shoot.\n":"\nKeep 1st finger on for directions, \nTap with 2nd finger to shoot.");
		
		instructions = ["Awesome girl !\n\nThe world needs you now.\n\nWe have been facing an uncommon\nwar for the last decade.\n\nAn unknown species invaded our planet\nEarth for only one reason : eat all \nour pretzels.",
						"They came out of nowhere, starving \nfor our pretzels.\n\nIt resulted in a dreadful situation.\n\nThe whole Earth and a huge \npart of the universe ran out of it !\n\nThe population is getting crazy.\nRiots are about to happen.",
						"We need you now !\n\nYou have one mission : to save us.\n\nTo do so, you will be helped by a \nfellow alien friend.\n\nThanks to a remote control \n"+control_text+" you will be \nable to collect the remaining pretzels.",
						"But beware of the bombs those tiny\nmotherfuckers placed.\nThey, the \"Bretzors\" are smart.\n"+control_text2+"\nYou must not touch them or the \nalien will die.\n\nGood luck super girl ! May the force \nbe with you."];
					
		instructions_text.setText(instructions[instructions_state]);
		
		switch(instructions_state)
		{
			case 3:
				next_button.visible = false;
				start_game_button.visible = true;
			break;

			case 2:
				if(!ufo.visible)
				{
					ufo.x = game.world.width-ufo.width;
					ufo.y = game.world.centerY;
					ufo.visible=true;	
					ufo.body.velocity.x = -300;
				}	
			break;
			
			default :
				ufo.body.velocity.x = 0;
				ufo.visible=false;
				next_button.visible = true;
				start_game_button.visible = false;	
			break;
		}
		
		tileBG.tilePosition.x -= 5;
	}
};
 
/* 

 
/*
 * Menu state
 */ 
 var MenuState = {
	create : function()
	{
		// The background image is added as a TileSprite
		tileBG = game.add.tileSprite(0, 0, w, h, 'space_bg');
		
		// Add the logo
		logo = game.add.sprite(game.world.centerX, 120, 'logo_small');
			logo.anchor.set(0.5,0.5);		
		
		instructions_button = game.add.button(game.world.centerX, 232, 'instructions_button', function(){gofull();game.state.start('InstructionState');}, this, 1, 0, 1);
			instructions_button.anchor.set(0.5,0.5);
		start_game_button = game.add.button(game.world.centerX, 310, 'start_game_button', function(){gofull();game.state.start('MainState');}, this, 1, 0, 1);
			start_game_button.anchor.set(0.5,0.5);
	},
	
	update : function()
	{
		tileBG.tilePosition.x -= 5;
	}
 };

/*
 * Main state for the game
 */
 var MainState = {
	create : function()
	{				
		// We set the tilt information off and start the game
		document.getElementById("tilt_phone").style.display = "none";	
		document.getElementById("PretzWars").style.display = "block";
		
		// The background image is added as a TileSprite
		tileBG = game.add.tileSprite(0, 0, w, h, 'space_bg');

		// We add the text with the specific bitmap font
		level_text = game.add.bitmapText(10, 10, 'rebellion', '', 35);
		pretzels_text = game.add.bitmapText(10, 60, 'rebellion', '', 35);
			level_text.alpha = pretzels_text.alpha = 0.2;
		
		// Add the "game over" image but hide it
		game_over = game.add.sprite(game.world.centerX, game.world.centerY, 'game_over');
			game_over.anchor.set(0.5,0.5);
			game_over.visible = false;
			
		game_over_tween = game.add.tween(game_over);
		
		// Add the "new level" image but hide it
		new_level = game.add.sprite(game.world.centerX, game.world.centerY, 'new_level');
			new_level.anchor.set(0.5,0.5);
			new_level.visible = false;	
			
		new_level_tween = game.add.tween(new_level);
			
		// Add the "you win" image but hide it
		you_win = game.add.sprite(game.world.centerX, game.world.centerY, 'you_win');
			you_win.anchor.set(0.5,0.5);
			you_win.visible = false;	

		you_win_tween = game.add.tween(you_win);

		// We add the sounds used in the game and set the volumes	
		atmosphere_sound = game.add.audio('atmosphere');
		atmosphere_sound.loop = true;
		atmosphere_sound.allowMultiple = false;
		atmosphere_sound.volume = 0.010;
		atmosphere_sound.play();		
		
		zap_sound = game.add.audio('zap');
		zap_sound.volume = 0.02;
		
		explosion_sound = game.add.audio('explosion');
		explosion_sound.volume = 0.02;
		
		ufo_explosion_sound = game.add.audio('ufo_explode');
		ufo_explosion_sound.volume = 0.015;	
		
		tudu_sound = game.add.audio('tudu');
		tudu_sound.volume = 0.015;	
		
		dondon_sound = game.add.audio('dondon');
		dondon_sound.volume = 0.02;	
		
		// Let's create the groups we are using
		sbs = game.add.group();
		bullets = game.add.group();
		explosions = game.add.group();	
		bombs = game.add.group();
		pretzels = game.add.group();
		
		// We create the bullets
		bullets.enableBody = true;
		bullets.physicsBodyType = Phaser.Physics.ARCADE;
		bullets.createMultiple(30, 'bullet', 0, false);
		bullets.setAll('anchor.x', 0.5);
		bullets.setAll('anchor.y', 0.5);
		bullets.setAll('outOfBoundsKill', true);
		bullets.setAll('checkWorldBounds', true);
		
		// We create the explosions
		explosions.createMultiple(30, 'explosion', 0, false);
		explosions.setAll('anchor.x', 0.5);
		explosions.setAll('anchor.y', 0.5);
		
		// Let's create the UFO and set its properties
		ufo = game.add.sprite(100, game.world.centerY, 'ufo');
			ufo.anchor.set(0.5,0.72);		
			ufo.animations.add('right_ufo',[0,1,2,3,4,5]);
			ufo.animations.play('right_ufo',10,true);
		
			game.physics.arcade.enable(ufo);
			
			ufo.body.collideWorldBounds = true;		
			ufo.body.gravity.x = 0;
			ufo.body.velocity.x = 0;
			ufo.body.bounce.x = 0.3;
			ufo.body.maxVelocity.x = 200;		
			ufo.body.gravity.y = 0;
			ufo.body.velocity.y = 0;
			ufo.body.bounce.y = 0;
			ufo.body.maxVelocity.y = 500;	
			
		ufo_tween = game.add.tween(ufo);
		// Randomly adding the pretzels
		for(var i = 0; i < 12; i++)
		{
			randomPretzels(pretzels, i);
		}

		// Randomly adding the bombs
		for (var i = 0; i <  max_vertical_bombs; i++)
		{
			randomBomb(bombs);
		}			
	   
		// Randomly creating the surfin' bretzors
		for (var i = 0; i <  max_vertical_sb; i++)
		{
			randomSurfinBretzor(sbs, i);
		}
		
		// The surfin' bretzors are attracted to the pretzels 
		setAccelerationToPretzel(sbs, pretzels);
		
		ufo.bringToTop();
		
		// Check on mobile if gyro is available (only if cordova is used)
		if(game.device.cordova)
		{
			gyro_check=(gyro.hasFeature('deviceorientation')) || (gyro.hasFeature('MozOrientation'));
		}
		else
		{
			gyro_check = false;
		}		
		
		// We enable the gyroscope control if not 
		if(gyro_check && !game.device.desktop){
			ufoGyroControl();
		}		
	},
	
	update : function()
	{		
			checkInputs();
			
			//if(!atmosphere_sound.isPlaying)atmosphere_sound.play();
			
			if(!gameover)
			{
				level_text.setText("LEVEL " + level + "/" + max_level);				
				pretzels_text.setText("PRETZELS " + pretzel_counter);
				
				setCollisions();

			}
			else
			{
				level_text.visible = pretzels_text.visible = false;
			}
			
			checkGameOver();		
	}		
};

function enterIncorrectOrientation()
{
	game.orientated = false; 
	game.paused = true;
	
	document.getElementById("PretzWars").style.display = "none";
	document.getElementById("tilt_phone").style.display = "block";
};

function leaveIncorrectOrientation()
{
		
	game.orientated = true; 
	game.paused = false;
	
	document.getElementById("tilt_phone").style.display = "none";	
	document.getElementById("PretzWars").style.display = "block";
};

function gofull()
{
	if(!game.device.desktop && !game.device.cordova)
	{
		game.scale.startFullScreen(false);
	}
};

function StartGame()
{
// Let's start the game
game = new Phaser.Game(width, height, Phaser.CANVAS, 'PretzWars');
	game.state.add('Boot', BootState, true);	
	game.state.add('PreloadState', PreloadState, false);
	game.state.add('MenuState', MenuState, false);
	game.state.add('MainState', MainState, false);
	game.state.add('WinState', WinState, false);
	game.state.add('InstructionState',InstructionState,false);	
}
 
StartGame();

