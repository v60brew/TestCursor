const canvas = document.getElementById('pachinkoCanvas');
const ctx = canvas.getContext('2d');

// Get DOM elements
const dropBallButton = document.getElementById('dropBall');
const playAgainButton = document.getElementById('playAgain');
const gameOverDiv = document.getElementById('gameOver');
const finalScoreSpan = document.getElementById('finalScore');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Constants
const BALL_RADIUS = 8;
const PEG_RADIUS = 4;
const GRAVITY = 0.2;
const BOUNCE_DAMPING = 0.7;
const FRICTION = 0.99;
const MAX_BALLS = 10;

// Game state
let score = 0;
let ballsDropped = 0;
let gameActive = true;

// Arrays to store game objects
let balls = [];
let pegs = [];
let slots = [];

// Ball class
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2; // Random initial horizontal velocity
        this.vy = 0;
        this.scored = false; // Track if this ball has already been scored
    }

    update() {
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;
        
        this.vx *= FRICTION;

        // Bounce off walls
        if (this.x < BALL_RADIUS) {
            this.x = BALL_RADIUS;
            this.vx *= -BOUNCE_DAMPING;
        }
        if (this.x > canvas.width - BALL_RADIUS) {
            this.x = canvas.width - BALL_RADIUS;
            this.vx *= -BOUNCE_DAMPING;
        }

        // Check collision with pegs
        pegs.forEach(peg => {
            const dx = this.x - peg.x;
            const dy = this.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < BALL_RADIUS + PEG_RADIUS) {
                // Calculate collision response
                const angle = Math.atan2(dy, dx);
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                
                this.x = peg.x + (BALL_RADIUS + PEG_RADIUS) * Math.cos(angle);
                this.y = peg.y + (BALL_RADIUS + PEG_RADIUS) * Math.sin(angle);
                
                const normalX = Math.cos(angle);
                const normalY = Math.sin(angle);
                
                const dotProduct = this.vx * normalX + this.vy * normalY;
                
                this.vx = (this.vx - 2 * dotProduct * normalX) * BOUNCE_DAMPING;
                this.vy = (this.vy - 2 * dotProduct * normalY) * BOUNCE_DAMPING;
            }
        });

        // Check if ball falls into a slot
        if (this.y > canvas.height - 50) {
            const slotWidth = canvas.width / 10;
            const slotIndex = Math.floor(this.x / slotWidth);
            if (slotIndex >= 0 && slotIndex < 10) {
                this.x = slotWidth * (slotIndex + 0.5);
                this.y = canvas.height - 25;
                this.vx = 0;
                this.vy = 0;
                
                // Add score only once when ball lands in slot
                if (!this.scored) {
                    score += (slotIndex + 1); // Add points based on slot number (1-10)
                    this.scored = true;
                    
                    // Check if game is over
                    if (ballsDropped >= MAX_BALLS) {
                        endGame();
                    }
                }
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, BALL_RADIUS, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x - BALL_RADIUS/2, this.y - BALL_RADIUS/2, 0,
            this.x, this.y, BALL_RADIUS
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#a0a0a0');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#808080';
        ctx.stroke();
        ctx.closePath();
    }
}

// Draw score window
function drawScore() {
    // Draw score background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(canvas.width - 150, 20, 130, 50, 10);
    ctx.fill();
    
    // Draw score text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Score: ' + score, canvas.width - 30, 52);

    // Draw balls remaining
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Balls: ' + (MAX_BALLS - ballsDropped), canvas.width - 30, 80);
}

// Game control functions
function dropBall() {
    if (gameActive && ballsDropped < MAX_BALLS) {
        balls.push(new Ball(canvas.width / 2, 20));
        ballsDropped++;
        
        if (ballsDropped >= MAX_BALLS) {
            dropBallButton.disabled = true;
        }
    }
}

function endGame() {
    gameActive = false;
    dropBallButton.disabled = true;
    gameOverDiv.style.display = 'block';
    playAgainButton.style.display = 'inline-block';
    finalScoreSpan.textContent = score;
}

function resetGame() {
    score = 0;
    ballsDropped = 0;
    balls = [];
    gameActive = true;
    dropBallButton.disabled = false;
    gameOverDiv.style.display = 'none';
    playAgainButton.style.display = 'none';
}

// Initialize pegs in a triangular pattern
function initializePegs() {
    const rows = 8;
    const pegSpacing = 60;
    const startX = canvas.width / 2;
    const startY = 100;

    for (let row = 0; row < rows; row++) {
        const pegsInRow = row + 5;
        const rowWidth = (pegsInRow - 1) * pegSpacing;
        const rowStartX = startX - rowWidth / 2;

        for (let i = 0; i < pegsInRow; i++) {
            pegs.push({
                x: rowStartX + i * pegSpacing,
                y: startY + row * pegSpacing
            });
        }
    }
}

// Initialize slots
function initializeSlots() {
    const slotWidth = canvas.width / 10;
    for (let i = 0; i < 10; i++) {
        slots.push({
            x: i * slotWidth,
            width: slotWidth,
            number: i + 1
        });
    }
}

// Draw functions
function drawPegs() {
    pegs.forEach(peg => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#ffcc00';
        ctx.fill();
        ctx.strokeStyle = '#cc9900';
        ctx.stroke();
        ctx.closePath();
    });
}

function drawSlots() {
    const slotHeight = 50;
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height - slotHeight, canvas.width, slotHeight);

    slots.forEach(slot => {
        // Draw slot dividers
        ctx.beginPath();
        ctx.moveTo(slot.x, canvas.height - slotHeight);
        ctx.lineTo(slot.x, canvas.height);
        ctx.strokeStyle = '#666';
        ctx.stroke();

        // Draw slot numbers
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            slot.number,
            slot.x + slot.width / 2,
            canvas.height - slotHeight / 2
        );
    });
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPegs();
    drawSlots();
    drawScore();

    balls.forEach(ball => {
        ball.update();
        ball.draw();
    });

    // Remove balls that are stuck at the bottom
    balls = balls.filter(ball => !(ball.vy === 0 && ball.y > canvas.height - 30));

    requestAnimationFrame(animate);
}

// Event listeners
dropBallButton.addEventListener('click', dropBall);
playAgainButton.addEventListener('click', resetGame);

// Initialize and start the game
initializePegs();
initializeSlots();
animate(); 