window.onload = () => {

    const menuContainer = document.getElementById("menu-container");
    const startButton = document.getElementById("start-button");
    
    const playerNameInput = document.getElementById("player-name-input");
    const playerNameDisplay = document.getElementById("player-name-display");

    const gameArea = document.getElementById("game-area"); 
    
    const
        scoreLbl = document.getElementById("score"),
        linesLbl = document.getElementById("lines"),
        canvas = document.getElementById("game-canvas"),
        ctx = canvas.getContext("2d"),
        gameOverModal = document.getElementById("game-over-modal"),
        pauseModal = document.getElementById("pause-modal");
    
    const nextCanvas = document.getElementById("next-piece-canvas");
    const nextCtx = nextCanvas.getContext("2d");
    
    const restartButton = document.getElementById("restart-button");
    const menuButton = document.getElementById("menu-button");

    const resumeButton = document.getElementById("resume-button");
    const pauseMenuButton = document.getElementById("pause-menu-button");
    
    const bgMusic = new Audio('audio/soundtrack.mp3'); 
    bgMusic.loop = true;   
    bgMusic.volume = 0.4;

    const menuMusic = new Audio('audio/menu.mp3');
    menuMusic.loop = true;
    menuMusic.volume = 0.5;

    const gameOverMusic = new Audio('audio/gameover.mp3');
    gameOverMusic.loop = true;
    gameOverMusic.volume = 0.6;

    menuMusic.play().catch(error => {
        console.log("Esperando interacción para audio...");
    });
    
    document.body.addEventListener('click', () => {
        if (menuMusic.paused && menuContainer.style.display !== "none") {
            menuMusic.play();
        }
    }, { once: true });


    class Tetromino {
        static COLORS = ["blue", "green", "yellow", "red", "orange", "purple"];
        static BLOCK_SIZE = 28;
        static DELAY = 400;
        static DELAY_INCREASED = 5;

        constructor(xs, ys, color = null) {
            this.x = xs;
            this.y = ys;
            this.length = xs.length;
            if (color !== null) {
                this.color = color;
                this.img = new Image();
                this.img.src = `imagenes/${Tetromino.COLORS[color]}.jpg`
            }
        }

        update(updFunc) {
            for (let i = 0; i < this.length; ++i) {
                ctx.clearRect(
                    this.x[i] * Tetromino.BLOCK_SIZE,
                    this.y[i] * Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE
                );

                updFunc(i);
            }

            this.draw();
        }

        draw(targetCtx = ctx, offsetX = 0, offsetY = 0) {
            if (!this.img.complete) {
                this.img.onload = () => this.draw(targetCtx, offsetX, offsetY);
                return;
            }
            for (let i = 0; i < this.length; ++i) {
                targetCtx.drawImage(
                    this.img,
                    (this.x[i] + offsetX) * Tetromino.BLOCK_SIZE,
                    (this.y[i] + offsetY) * Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE
                );
            }
        }

        collides(checkFunc) {
            for (let i = 0; i < this.length; ++i) {
                const { x, y } = checkFunc(i);
                if (x < 0 || x >= FIELD_WIDTH || y < 0 || y >= FIELD_HEIGHT || FIELD[y][x] !== false)
                    return true;
            }
            return false;
        }

        merge() {
            for (let i = 0; i < this.length; ++i) {
                FIELD[this.y[i]][this.x[i]] = this.color;
            }
        }

        rotate() {
            const
                maxX = Math.max(...this.x),
                minX = Math.min(...this.x),
                minY = Math.min(...this.y),
                nx = [],
                ny = [];

            if (!this.collides(i => {
                    nx.push(maxX + minY - tetromino.y[i]);
                    ny.push(tetromino.x[i] - minX + minY);
                    return { x: nx[i], y: ny[i] };
                })) {
                this.update(i => {
                    this.x[i] = nx[i];
                    this.y[i] = ny[i];
                });
            }
        }
    }

    const
        FIELD_WIDTH = 10,
        FIELD_HEIGHT = 20,
        FIELD = Array.from({ length: FIELD_HEIGHT }),
        MIN_VALID_ROW = 4,
        NEXT_CANVAS_WIDTH = 4,
        NEXT_CANVAS_HEIGHT = 4,
        
        TETROMINOES = [
            new Tetromino([0, 0, 0, 0], [0, 1, 2, 3]), // I
            new Tetromino([0, 0, 1, 1], [0, 1, 0, 1]), // O
            new Tetromino([0, 1, 1, 1], [0, 0, 1, 2]), // L
            new Tetromino([0, 0, 0, 1], [0, 1, 2, 0]), // J
            new Tetromino([0, 1, 1, 2], [0, 0, 1, 1]), // S
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 1]), // T
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 0])  // Z
        ];

    let tetromino = null,
        nextTetromino = null,
        delay,
        score,
        lines,
        isGameOver = false,
        isPaused = false,
        currentBaseDelay;
    
    let menuSelectionIndex = 1; 
    const menuItems = [playerNameInput, startButton]; 
    
    let gameOverSelectionIndex = 0; 
    const gameOverItems = [restartButton, menuButton];
    
    let pauseSelectionIndex = 0;
    const pauseItems = [resumeButton, pauseMenuButton];

    startButton.onclick = () => {
        const name = playerNameInput.value.trim() || "Jugador";
        playerNameDisplay.innerText = name;

        menuMusic.pause();
        menuMusic.currentTime = 0;
        
        bgMusic.currentTime = 0;
        bgMusic.play();

        menuContainer.style.display = "none";
        gameArea.style.display = "flex"; 
        
        setup(); 
    };

    restartButton.onclick = () => {
        gameOverMusic.pause();
        gameOverMusic.currentTime = 0;
        
        bgMusic.currentTime = 0;
        bgMusic.play();
        
        reset(); 
        draw();
    };

    menuButton.onclick = () => {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        
        gameOverMusic.pause();
        gameOverMusic.currentTime = 0;
        
        menuMusic.currentTime = 0;
        menuMusic.play();

        reset(); 
        gameArea.style.display = "none"; 
        menuContainer.style.display = "flex";
        
        playerNameInput.value = "";
        menuSelectionIndex = 1;
        updateMenuSelection();
    };

    function togglePause() {
        if (isGameOver || gameArea.style.display === "none") return;

        isPaused = !isPaused;

        if (isPaused) {
            pauseModal.style.display = "block";
            bgMusic.pause(); 
            
            pauseSelectionIndex = 0;
            updatePauseSelection();
        } else {
            pauseModal.style.display = "none"; 
            bgMusic.play(); 
            draw();
        }
    }

    resumeButton.onclick = () => togglePause();

    pauseMenuButton.onclick = () => {
        togglePause(); 
        
        bgMusic.pause();
        bgMusic.currentTime = 0;
        
        menuMusic.currentTime = 0;
        menuMusic.play();

        reset(); 
        gameArea.style.display = "none"; 
        menuContainer.style.display = "flex";
        menuSelectionIndex = 1;
        updateMenuSelection();
    };

    function triggerGameOver() {
        isGameOver = true;
        
        bgMusic.pause();
        bgMusic.currentTime = 0;
        
        gameOverMusic.currentTime = 0;
        gameOverMusic.play();
        
        saveScoreToBackend(); 
        
        gameOverModal.style.display = "block";
        gameOverSelectionIndex = 0;
        updateGameOverSelection();
    }

    function setup() {
        canvas.style.top = "14px";
        canvas.style.left = "14px";
        ctx.canvas.width = FIELD_WIDTH * Tetromino.BLOCK_SIZE;
        ctx.canvas.height = FIELD_HEIGHT * Tetromino.BLOCK_SIZE;

        nextCanvas.width = NEXT_CANVAS_WIDTH * Tetromino.BLOCK_SIZE;
        nextCanvas.height = NEXT_CANVAS_HEIGHT * Tetromino.BLOCK_SIZE;

        reset();
        draw();
    }

    function reset() {
        FIELD.forEach((_, y) => FIELD[y] = Array.from({ length: FIELD_WIDTH }).map(_ => false));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        currentBaseDelay = Tetromino.DELAY;
        delay = currentBaseDelay;
        score = 0;
        lines = 0;

        gameOverModal.style.display = "none";
        pauseModal.style.display = "none";
        isGameOver = false;
        isPaused = false;

        nextTetromino = generateNewTetromino();
        tetromino = null;
    }

    function draw() {
        if (isPaused) return;

        if (tetromino) {
            if (tetromino.collides(i => ({ x: tetromino.x[i], y: tetromino.y[i] + 1 }))) {
                tetromino.merge();
                tetromino = null;

                let completedRows = 0;
                for (let y = FIELD_HEIGHT - 1; y >= MIN_VALID_ROW; --y)
                    if (FIELD[y].every(e => e !== false)) {
                        for (let ay = y; ay >= MIN_VALID_ROW; --ay)
                            FIELD[ay] = [...FIELD[ay - 1]];
                        ++completedRows;
                        ++y;
                    }

                if (completedRows) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (let y = MIN_VALID_ROW; y < FIELD_HEIGHT; ++y) {
                        for (let x = 0; x < FIELD_WIDTH; ++x) {
                            if (FIELD[y][x] !== false) new Tetromino([x], [y], FIELD[y][x]).draw();
                        }
                    }
                    score += [40, 100, 300, 1200][completedRows - 1];
                    lines += completedRows;
                } else {
                    if (FIELD[MIN_VALID_ROW - 1].some(block => block !== false)) {
                        triggerGameOver();
                    }
                }
            } else
                tetromino.update(i => ++tetromino.y[i]);
        }
        else {
            scoreLbl.innerText = score;
            linesLbl.innerText = lines;
            spawnNewTetromino();
        }

        if (!isGameOver && !isPaused) {
            if (delay !== (currentBaseDelay / Tetromino.DELAY_INCREASED)) {
                delay = currentBaseDelay;
            }
            setTimeout(draw, delay);
        }
    }

    function generateNewTetromino() {
        const randIndex = Math.floor(Math.random() * TETROMINOES.length);
        const randColor = Math.floor(Math.random() * Tetromino.COLORS.length);
        const piece = TETROMINOES[randIndex];
        return new Tetromino([...piece.x], [...piece.y], randColor);
    }

    function spawnNewTetromino() {
        tetromino = nextTetromino; 
        nextTetromino = generateNewTetromino(); 
        const middle = Math.floor(FIELD_WIDTH / 2);
        tetromino.x = tetromino.x.map(x => x + middle);
        tetromino.draw(ctx, 0, 0);
        drawNextPiece(); 
    }

    function drawNextPiece() {
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (!nextTetromino) return;
        const minX = Math.min(...nextTetromino.x);
        const maxX = Math.max(...nextTetromino.x);
        const minY = Math.min(...nextTetromino.y);
        const maxY = Math.max(...nextTetromino.y);
        const pieceWidth = maxX - minX + 1;
        const pieceHeight = maxY - minY + 1;
        const offsetX = (NEXT_CANVAS_WIDTH - pieceWidth) / 2 - minX;
        const offsetY = (NEXT_CANVAS_HEIGHT - pieceHeight) / 2 - minY;
        nextTetromino.draw(nextCtx, offsetX, offsetY);
    }

    function updateMenuSelection() {
        menuItems.forEach((item, index) => {
            if (item.tagName === "INPUT") {
                if (index === menuSelectionIndex) item.focus();
                else item.blur();
            } else {
                if (index === menuSelectionIndex) item.classList.add('selected');
                else item.classList.remove('selected');
            }
        });
    }
    
    function updateGameOverSelection() {
        gameOverItems.forEach((button, index) => {
            if (index === gameOverSelectionIndex) button.classList.add('selected');
            else button.classList.remove('selected');
        });
    }

    function updatePauseSelection() {
        pauseItems.forEach((button, index) => {
            if (index === pauseSelectionIndex) button.classList.add('selected');
            else button.classList.remove('selected');
        });
    }

    window.onkeydown = event => {
        let handled = false; 
        
        if (document.activeElement === playerNameInput) {
            if (event.key === "Enter") {
                startButton.click();
                playerNameInput.blur();
            }
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                return; 
            }
        }

        if (event.key === "p" || event.key === "P") {
            togglePause();
            return;
        }

        if (isPaused) {
             switch (event.key) {
                case "ArrowLeft":
                    pauseSelectionIndex--;
                    if (pauseSelectionIndex < 0) pauseSelectionIndex = pauseItems.length - 1;
                    updatePauseSelection();
                    handled = true;
                    break;
                case "ArrowRight":
                    pauseSelectionIndex++;
                    if (pauseSelectionIndex >= pauseItems.length) pauseSelectionIndex = 0;
                    updatePauseSelection();
                    handled = true;
                    break;
                case " ":
                    pauseItems[pauseSelectionIndex].click();
                    handled = true;
                    break;
            }
            if (handled) event.preventDefault();
            return; 
        }

        if (menuContainer.style.display === "flex") {
            switch (event.key) {
                case "ArrowUp":
                    menuSelectionIndex--;
                    if (menuSelectionIndex < 0) menuSelectionIndex = menuItems.length - 1;
                    updateMenuSelection();
                    handled = true;
                    break;
                case "ArrowDown":
                    menuSelectionIndex++;
                    if (menuSelectionIndex >= menuItems.length) menuSelectionIndex = 0;
                    updateMenuSelection();
                    handled = true;
                    break;
                case " ": case "Enter":
                    if (menuItems[menuSelectionIndex] !== playerNameInput) {
                        menuItems[menuSelectionIndex].click();
                        handled = true;
                    }
                    break;
            }
        }
        
        else if (isGameOver) {
             switch (event.key) {
                case "ArrowLeft":
                    gameOverSelectionIndex--;
                    if (gameOverSelectionIndex < 0) gameOverSelectionIndex = gameOverItems.length - 1;
                    updateGameOverSelection();
                    handled = true;
                    break;
                case "ArrowRight":
                    gameOverSelectionIndex++;
                    if (gameOverSelectionIndex >= gameOverItems.length) gameOverSelectionIndex = 0;
                    updateGameOverSelection();
                    handled = true;
                    break;
                case " ":
                    gameOverItems[gameOverSelectionIndex].click();
                    handled = true;
                    break;
            }
        }

        if (!isGameOver && !handled && gameArea.style.display === "flex") {
            switch (event.key) {
                case "ArrowLeft":
                    if (!tetromino.collides(i => ({ x: tetromino.x[i] - 1, y: tetromino.y[i] })))
                        tetromino.update(i => --tetromino.x[i]);
                    handled = true;
                    break;
                case "ArrowRight":
                    if (!tetromino.collides(i => ({ x: tetromino.x[i] + 1, y: tetromino.y[i] })))
                        tetromino.update(i => ++tetromino.x[i]);
                    handled = true;
                    break;
                case "ArrowDown":
                    delay = currentBaseDelay / Tetromino.DELAY_INCREASED; 
                    handled = true;
                    break;
                case " ": 
                    tetromino.rotate();
                    handled = true;
                    break;
            }
        }
        
        if (handled) event.preventDefault();
    }
    
    window.onkeyup = event => {
        if (isGameOver || gameArea.style.display === "none" || isPaused) return;
        if (event.key === "ArrowDown") delay = currentBaseDelay; 
    }
    
    updateMenuSelection();

    function saveScoreToBackend() {
        let playerName = document.getElementById("player-name-display").innerText;
        playerName = playerName.replace("Jugador: ", "").trim();
        
        if (!playerName) playerName = "Anónimo";

        const currentScore = parseInt(document.getElementById("score").innerText) || 0;
        const currentLines = parseInt(document.getElementById("lines").innerText) || 0;

        if (currentScore > 0) {
            fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName, score: currentScore, lines: currentLines }),
            })
            .then(response => response.json())
            .then(data => console.log('Puntuación guardada:', data))
            .catch((error) => console.error('Error al guardar:', error));
        }
    }
}