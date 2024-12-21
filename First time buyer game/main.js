class MyGame extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }

    preload() {
        // Load images with correct paths
        this.load.image('player', 'assets/player.png');
        this.load.image('ladder', 'assets/ladder.png');
        this.load.image('brickwall', 'assets/brickwall.png');
        this.load.image('key', 'assets/key.png');
        
        // Load new antagonist images
        this.load.image('interestrates', 'assets/interestrates.jpg');
        this.load.image('bankers', 'assets/bankers.jpg');
        this.load.image('joker', 'assets/joker.webp');
        
        // Load House Builders image
        this.load.image('houseBuilders', 'assets/HouseBuilders.jpg'); // Added line
        
        // Load KnokKNok logo
        this.load.image('logo', 'assets/logo.png'); // Existing line
    }

    create() {
        // Game dimensions handled by Scale Manager for full-screen
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // Game state variables
        this.attempts = 0;
        this.maxAttemptsBeforeMessage = 5;
        this.ladderMoving = false;
        this.isAntagonistImageDisplaying = false; // Flag to control antagonist image display
        this.isHumorousMessageDisplaying = false; // Flag to control humorous message display
        this.isInitialMessageDisplaying = false; // Flag to control initial message display

        // ----------- Add Brick Wall (Background) -----------
        // Positioned at y=150 with height=250, so bottom is at y=400
        this.brickWall = this.add.sprite(this.gameWidth / 2.0, 150, 'brickwall');
        this.brickWall.setOrigin(0.5, 0); // Top-center origin
        this.brickWall.setDisplaySize(this.brickWall.width, 250); // Stretch to desired height
        this.brickWall.setDepth(-1); // Behind everything (background)

        // ----------- Add Floor -----------
        // Positioned at y=450 with height=150, covering y=450 to y=600
        this.floor = this.add.rectangle(this.gameWidth / 2, 450, this.gameWidth, 150, 0x00aa00);
        this.floor.setOrigin(0.5, 0); // Top-center origin
        this.physics.add.existing(this.floor);
        this.floor.body.setImmovable(true);
        this.floor.body.allowGravity = false; // Ensure floor isn't affected by gravity
        this.floor.setDepth(0); // Above background, below other objects

        // Adjust the physics body to be a thin line at the top of the floor
        this.floor.body.setSize(this.gameWidth, 1, true); // Width remains, height set to 1
        this.floor.body.setOffset(0, 0); // Align physics body to the top of the rectangle

        // ----------- Add Ladder -----------
        this.ladder = this.physics.add.sprite(this.gameWidth * 0.25, 0, 'ladder'); // Positioned on the left side
        this.ladder.setScale(0.15);
        this.ladder.setOrigin(0.5, 0); // Top-center origin to extend downward
        this.ladder.body.setImmovable(true);
        this.ladder.body.moves = false;
        this.ladder.body.checkCollision.none = true; // Disable physics collisions with ladder
        this.ladder.setDepth(1); // Above floor

        // After scaling, align ladder's bottom with brick wall's bottom (y=400)
        this.ladder.y = 400 - this.ladder.displayHeight;

        // ----------- Add Player -----------
        // Position player on the right side so that their feet are exactly on the floor (y=450)
        this.player = this.physics.add.sprite(this.gameWidth * 0.75, 450, 'player'); // Positioned on the right side
        this.player.setScale(0.1);
        this.player.setOrigin(0.5, 1); // Bottom-center origin ensures feet are at y=450
        this.player.setCollideWorldBounds(true); // Prevent player from moving out of the game bounds
        this.player.setDepth(2); // Above ladder and floor

        // Enable collision between player and floor
        this.physics.add.collider(this.player, this.floor);

        // ----------- Add Key Sprite -----------
        this.keySprite = this.add.sprite(this.gameWidth / 2, 0, 'key');
        this.keySprite.setOrigin(0.5, 0); // Top-center origin
        this.keySprite.setScale(0.1);
        this.keySprite.setDepth(3); // Above player and ladder

        // ----------- Add Antagonist Images -----------
        // Position the images at the center of the screen or any desired position
        this.interestRatesImage = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'interestrates')
            .setVisible(false)
            .setDepth(6);
        this.bankersImage = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'bankers')
            .setVisible(false)
            .setDepth(6);
        this.jokerImage = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'joker')
            .setVisible(false)
            .setDepth(6);
        this.houseBuildersImage = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'houseBuilders') // Added line
            .setVisible(false)
            .setDepth(6); // Ensure it's on the same depth as other antagonist images
        
        // Optionally, scale the images if they are too large or too small
        this.interestRatesImage.setScale(0.5);
        this.bankersImage.setScale(0.5);
        this.jokerImage.setScale(0.5);
        this.houseBuildersImage.setScale(0.5); // Added line

        // ----------- Player Input -----------
        // Create cursor keys for input
        this.cursors = this.input.keyboard.createCursorKeys();

        // ----------- Add Text Displays -----------
        // Information text (controls and attempts)
        this.infoText = this.add.text(10, 10, 'Move: Left/Right\nJump: Space\nAttempts: 0', { 
            font: '16px Arial', 
            fill: '#000' 
        }).setDepth(4); // Above all game objects

        // Message text (humorous message and initial message)
        this.messageText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, '', { 
            font: '32px Arial', // Increased font size
            fill: '#000', 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
            padding: { x: 20, y: 20 }, 
            align: 'center',
            wordWrap: { width: this.gameWidth * 0.8, useAdvancedWrap: true } // Dynamic word wrap based on game width
        }).setOrigin(0.5).setVisible(false).setDepth(7); // Above all game objects

        // Antagonist text
        this.antagonistText = this.add.text(this.gameWidth / 2, 50, '', {
            font: '32px Arial', // Increased font size
            fill: '#ff0000',
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
            padding: { x: 10, y: 10 },
            align: 'center',
            wordWrap: { width: 600, useAdvancedWrap: true } // Added word wrap
        }).setOrigin(0.5).setVisible(false).setDepth(6); // Above all game objects

        // ----------- Ensure Images Do Not Capture Input (Optional) -----------
        this.interestRatesImage.setInteractive(false);
        this.bankersImage.setInteractive(false);
        this.jokerImage.setInteractive(false);
        this.houseBuildersImage.setInteractive(false); // Added line

        // ----------- Add KnokKNok Logo to Top-Right Corner -----------
        this.logo = this.add.image(this.gameWidth - 50, 50, 'logo') // Positioned 50px from right and top
            .setOrigin(0.5)
            .setScale(0.025) // Adjust scale based on your logo size
            .setDepth(8) // Ensure it's above other elements
            .setInteractive({ useHandCursor: true }); // Changes cursor to a hand on hover

        // Add pointerdown event to open the KnokKnok website
        this.logo.on('pointerdown', () => {
            window.open('https://knokknok.social/', '_blank');
        });

        // ----------- Listen to the Resize Event -----------
        this.scale.on('resize', this.resize, this);

        // ----------- Show Initial Modal Pop-Up Message -----------
        this.showInitialMessage();
    }

    update(time, delta) {
        // ----------- Check if Any Message is Displaying -----------
        if (!this.isAntagonistImageDisplaying && !this.isHumorousMessageDisplaying && !this.isInitialMessageDisplaying) {
            // ----------- Player Movement -----------
            const speed = 300; // Increased speed from 200 to 300
            if (this.cursors.left.isDown) {
                this.player.body.setVelocityX(-speed);
            } else if (this.cursors.right.isDown) {
                this.player.body.setVelocityX(speed);
            } else {
                this.player.body.setVelocityX(0);
            }

            // ----------- Jump Logic -----------
            if (this.cursors.space.isDown && this.player.body.touching.down) {
                console.log('Jump initiated');
                this.player.body.setVelocityY(-500);
            }
        }

        // ----------- Ladder Proximity Check -----------
        const horizontalDistance = Math.abs(this.player.x - this.ladder.x);

        // Trigger ladder movement as soon as player is within 100px horizontally and not on the ground
        if (!this.ladderMoving && horizontalDistance < 100 && !this.player.body.touching.down) {
            // Immediately repel the player so they don't overlap visually
            const direction = (this.player.x < this.ladder.x) ? -1 : 1;
            this.player.body.setVelocityX(direction * -300);

            // Trigger antagonist logic
            this.triggerAntagonist();
        }
    }

    triggerAntagonist() {
        if (this.isAntagonistImageDisplaying || this.isHumorousMessageDisplaying || this.isInitialMessageDisplaying) {
            return; // Prevent multiple antagonist triggers simultaneously
        }
        this.isAntagonistImageDisplaying = true; // Set flag to disable input

        this.ladderMoving = true;
        this.attempts++;
        this.infoText.setText(`Move: Left/Right\nJump: Space\nAttempts: ${this.attempts}`);

        // Updated antagonists array without "Regulation"
        const antagonists = ["Interest Rates", "Banks", "House Builders", "Inflation"];
        const chosen = Phaser.Utils.Array.GetRandom(antagonists);

        // Display antagonist text with increased font size
        this.antagonistText.setText(chosen);
        this.antagonistText.setVisible(true);

        // ----------- Display Corresponding Image -----------
        if (chosen === "Banks") {
            this.bankersImage.setVisible(true);
            // Display duration: 1000ms
            this.time.delayedCall(1000, () => {
                this.bankersImage.setVisible(false);
                this.antagonistText.setVisible(false); // Hide antagonist text after image
                this.isAntagonistImageDisplaying = false; // Reset flag
            });
        } else if (chosen === "Interest Rates") {
            this.interestRatesImage.setVisible(true);
            // Display duration: 1000ms
            this.time.delayedCall(1000, () => {
                this.interestRatesImage.setVisible(false);
                this.antagonistText.setVisible(false); // Hide antagonist text after image
                this.isAntagonistImageDisplaying = false; // Reset flag
            });
        } else if (chosen === "House Builders") {
            this.houseBuildersImage.setVisible(true);
            // Display duration: 1000ms
            this.time.delayedCall(1000, () => {
                this.houseBuildersImage.setVisible(false);
                this.antagonistText.setVisible(false); // Hide antagonist text after image
                this.isAntagonistImageDisplaying = false; // Reset flag
            });
        } else if (chosen === "Inflation") {
            this.jokerImage.setVisible(true);
            // Display duration: 1000ms
            this.time.delayedCall(1000, () => {
                this.jokerImage.setVisible(false);
                this.antagonistText.setVisible(false); // Hide antagonist text after image
                this.isAntagonistImageDisplaying = false; // Reset flag
            });
        }

        // ----------- Move Ladder Up Quickly -----------
        this.tweens.add({
            targets: this.ladder,
            y: -50, // Move above the screen
            duration: 200, // Faster tween
            onComplete: () => {
                // Reposition ladder to a new X before bringing it back down
                this.repositionLadder();
                this.ladder.y = -50; 

                // ----------- Move Ladder Back Down Quickly -----------
                this.tweens.add({
                    targets: this.ladder,
                    y: 400 - this.ladder.displayHeight, // New Y position (teasing height at bottom of brick wall)
                    duration: 200, // Faster tween down
                    onComplete: () => {
                        this.ladderMoving = false;

                        // ----------- Check for Humorous Messages -----------
                        if (this.attempts === this.maxAttemptsBeforeMessage) {
                            this.showHumorousMessage("Maybe you should consider renting for another 4 years.");
                        } else if (this.attempts >= 10 && this.attempts % 10 === 0) {
                            this.showHumorousMessage("Maybe you should just look at properties on KnokKnok that you can't afford.");
                        }
                    }
                });
            }
        });
    }

    showHumorousMessage(message) {
        if (this.isHumorousMessageDisplaying || this.isInitialMessageDisplaying) {
            return; // Prevent multiple messages simultaneously
        }

        this.isHumorousMessageDisplaying = true; // Set flag to disable input
        this.messageText.setText(message);
        this.messageText.setVisible(true);

        // Ensure the message is centered and doesn't overflow
        this.messageText.setPosition(this.gameWidth / 2, this.gameHeight / 2);
        this.messageText.setStyle({
            wordWrap: { width: this.gameWidth * 0.8, useAdvancedWrap: true }, // Adjust word wrap based on game width
            fontSize: '32px' // Ensure font size is consistent
        });

        // ----------- Hide Message After 3 Seconds -----------
        this.time.delayedCall(3000, () => {
            this.messageText.setVisible(false);
            this.isHumorousMessageDisplaying = false; // Reset flag
        });
    }

    showInitialMessage() {
        if (this.isInitialMessageDisplaying) {
            return; // Prevent multiple initial messages
        }

        this.isInitialMessageDisplaying = true; // Set flag to disable input
        this.messageText.setText("The game is simple, get on the property ladder and get the keys to your first home!");
        this.messageText.setVisible(true);

        // Ensure the message is centered and doesn't overflow
        this.messageText.setPosition(this.gameWidth / 2, this.gameHeight / 2);
        this.messageText.setStyle({
            wordWrap: { width: this.gameWidth * 0.8, useAdvancedWrap: true }, // Adjust word wrap based on game width
            fontSize: '32px' // Ensure font size is consistent
        });

        // ----------- Hide Initial Message After 3 Seconds -----------
        this.time.delayedCall(3000, () => {
            this.messageText.setVisible(false);
            this.isInitialMessageDisplaying = false; // Reset flag
        });
    }

    repositionLadder() {
        const newX = Phaser.Math.Between(this.gameWidth * 0.1, this.gameWidth * 0.9);
        this.ladder.x = newX;
        this.ladder.y = 400 - this.ladder.displayHeight; // Ensure ladder's bottom is at y=400
    }

    resize(gameSize, baseSize, displaySize, resolution) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.gameWidth = width;
        this.gameHeight = height;

        // Reposition the logo to the top-right corner
        if (this.logo) {
            this.logo.setPosition(this.gameWidth - 50, 50); // Adjust as needed
        }

        // Reposition other elements if necessary
        // For example, adjust the brick wall, floor, etc., if they rely on gameWidth/gameHeight
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800, // Initial width, handled by Scale Manager
    height: 600, // Initial height, handled by Scale Manager
    backgroundColor: '#87ceeb',
    parent: 'gameContainer',
    scale: {
        mode: Phaser.Scale.RESIZE, // Make the game resize to fit the window
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game horizontally and vertically
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Global gravity applied to all objects
            debug: false // Disable physics debugging to remove purple rectangles
        }
    },
    scene: MyGame
};

const game = new Phaser.Game(config);
