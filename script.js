window.onload = () => {

    const menuContainer = document.getElementById("menu-container");
    const startButton = document.getElementById("start-button");
    const playersButton = document.getElementById("players-button");
    const controlsButton = document.getElementById("controls-button");

    const gameArea = document.getElementById("game-area"); 
    
    const
        scoreLbl = document.getElementById("score"),
        linesLbl = document.getElementById("lines"),
        canvas = document.getElementById("game-canvas"),
        ctx = canvas.getContext("2d"),
        gameOverModal = document.getElementById("game-over-modal"),
        pauseModal = document.getElementById("pause-modal");
        gameWinModal = document.getElementById("game-win-modal"); // <-- NUEVO: Modal de Victoria
    
    const nextCanvas = document.getElementById("next-piece-canvas");
    const nextCtx = nextCanvas.getContext("2d");
    
    const restartButton = document.getElementById("restart-button");
    const menuButton = document.getElementById("menu-button");

    const resumeButton = document.getElementById("resume-button");
    const pauseMenuButton = document.getElementById("pause-menu-button");

    const quizContainer = document.getElementById("quiz-container");
    const questionText = document.getElementById("question-text");
    const answerOptions = document.getElementById("answer-options");
    const quizFeedback = document.getElementById("quiz-feedback");
    const strikesLbl = document.getElementById("strikes-lbl");
    

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
        numPlayers = 1,
        currentBaseDelay,
        quizSelectedAnswerIndex = 0,
        strikes = 0;
    
    let menuSelectionIndex = 0;
    const menuItems = [startButton, playersButton, controlsButton]; 
    let gameOverSelectionIndex = 0; 
    const gameOverItems = [restartButton, menuButton];
    let pauseSelectionIndex = 0;
    const pauseItems = [resumeButton, pauseMenuButton];

/*preguntas*/
    const questions = [
        { q: "¿Qué patrón de diseño usa JavaScript para la herencia basada en prototipos?", options: ["Singleton", "Factory", "Prototype", "Observer"], correct: 2 },

        { q: "¿En qué contexto 'this' se refiere al objeto global en modo estricto?", options: ["En funciones globales", "En métodos de objeto", "En constructores", "Nunca en modo estricto"], correct: 3 },

        { q: "¿Qué algoritmo usa Git para calcular diferencias entre archivos?", options: ["Myers diff", "Levenshtein", "Dijkstra", "Boyer-Moore"], correct: 0 },

        { q: "¿Cuál es la complejidad temporal del algoritmo QuickSort en el peor caso?", options: ["O(n log n)", "O(n²)", "O(log n)", "O(n)"], correct: 1 },

        { q: "¿Qué principio SOLID viola una clase que tiene múltiples responsabilidades?", options: ["Open/Closed", "Liskov Substitution", "Interface Segregation", "Single Responsibility"], correct: 3 },

        { q: "¿Qué estructura de datos subyace a la implementación de async/await en JavaScript?", options: ["Cola de prioridades", "Pila de llamadas", "Promises", "Generadores"], correct: 3 },

        { q: "¿En qué capa del modelo OSI opera el protocolo HTTP?", options: ["Capa de aplicación", "Capa de transporte", "Capa de sesión", "Capa de presentación"], correct: 0 },

        { q: "¿Qué técnica de optimización evita recálculos mediante almacenamiento en caché?", options: ["Memoization", "Tabulation", "Dynamic Programming", "Greedy Algorithm"], correct: 0 },

        { q: "¿Qué patrón resuelve el problema de herencia múltiple en lenguajes como Java?", options: ["Decorator", "Adapter", "Composite", "Interface"], correct: 0 },

        { q: "¿Qué estructura utiliza React para el reconciliation algorithm?", options: ["DOM Virtual", "Árbol Rojo-Negro", "Grafos de dependencia", "Fibers"], correct: 3 },

        { q: "¿Qué paradigma promueve la inmutabilidad como principio central?", options: ["Programación funcional", "Orientación a objetos", "Programación procedural", "Programación lógica"], correct: 0 },

        { q: "¿Qué algoritmo de consenso usa Blockchain en Ethereum?", options: ["Proof of Work", "Proof of Stake", "Byzantine Fault Tolerance", "Raft"], correct: 1 },

        { q: "¿Qué característica permite a un lenguaje manejar múltiples operaciones simultáneas?", options: ["Concurrencia", "Paralelismo", "Asincronía", "Multithreading"], correct: 0 },

        { q: "¿Qué patrón de arquitectura separa responsabilidades en Modelo, Vista y Controlador?", options: ["MVC", "MVVM", "MVP", "Redux"], correct: 0 },

        { q: "¿Qué protocolo proporciona comunicación cifrada segura en internet?", options: ["HTTPS", "HTTP/2", "WebSocket", "TCP/IP"], correct: 0 },

        { q: "¿Qué estructura de datos es óptima para implementar una cola de prioridad?", options: ["Heap", "Árbol binario", "Lista enlazada", "Array"], correct: 0 },

        { q: "¿Qué principio establece que 'las entidades deben estar abiertas para extensión pero cerradas para modificación'?", options: ["Open/Closed", "Liskov Substitution", "Dependency Inversion", "Interface Segregation"], correct: 0 },

        { q: "¿Qué algoritmo garantiza exclusión mutua en programación concurrente?", options: ["Mutex", "Semáforo", "Monitor", "Todos los anteriores"], correct: 3 },

        { q: "¿Qué tipo de sistema de tipos tiene TypeScript?", options: ["Estático y fuerte", "Dinámico y débil", "Estático y débil", "Dinámico y fuerte"], correct: 0 },

        { q: "¿Qué patrón permite a un objeto notificar cambios a otros objetos?", options: ["Observer", "Publisher/Subscriber", "Mediator", "Todos los anteriores"], correct: 3 }
    ];
    let currentQuestionIndex = 0;


    playersButton.onclick = () => {
        playersButton.classList.add('animate-pop');
        numPlayers = (numPlayers === 1) ? 2 : 1;
        playersButton.innerText = `Jugadores: ${numPlayers}`;
        setTimeout(() => { playersButton.classList.remove('animate-pop'); }, 300);
    };

    startButton.onclick = () => {
        menuContainer.style.display = "none";
        gameArea.style.display = "flex"; 
        
        if (numPlayers === 1) {
            quizContainer.style.display = "none"; 
        } else {
            quizContainer.style.display = "block"; 
            startQuiz(); 
        }
        setup(); 
    };

    restartButton.onclick = () => {
        reset(); 
        if (numPlayers === 2) startQuiz(); 
        draw();
    };

    menuButton.onclick = () => {
        reset(); 
        gameArea.style.display = "none"; 
        menuContainer.style.display = "flex";
        menuSelectionIndex = 0;
        updateMenuSelection();
    };
    
    controlsButton.onclick = () => {
        window.location.href = 'controles.html';
    };

    function togglePause() {
        if (isGameOver || gameArea.style.display === "none") return;

        isPaused = !isPaused;

        if (isPaused) {
            pauseModal.style.display = "block";
            pauseSelectionIndex = 0;
            updatePauseSelection();
        } else {
            pauseModal.style.display = "none"; 
            draw();
        }
    }

    resumeButton.onclick = () => togglePause();

    pauseMenuButton.onclick = () => {
        togglePause();
        reset(); 
        gameArea.style.display = "none"; 
        menuContainer.style.display = "flex";
        menuSelectionIndex = 0;
        updateMenuSelection();
    };

    function triggerGameOver() {
        isGameOver = true;
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
        
        if (numPlayers === 2) {
            currentBaseDelay = 300;
        } else {
            currentBaseDelay = Tetromino.DELAY;
        }
        
        delay = currentBaseDelay;
        score = 0;
        lines = 0;
        
        strikes = 0;
        if (typeof updateStrikesDisplay === "function") updateStrikesDisplay();

        gameOverModal.style.display = "none";
        pauseModal.style.display = "none";
        isGameOver = false;
        isPaused = false;

        nextTetromino = generateNewTetromino();
        tetromino = null;

        if (gameArea.style.display === "none") {
            quizContainer.style.display = "none";
        }
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

    function startQuiz() {
        currentQuestionIndex = 0;
        showNextQuestion();
    }

    function showNextQuestion() {
        answerOptions.innerHTML = "";
        quizSelectedAnswerIndex = 0; 
        if (currentQuestionIndex >= questions.length) {
            currentQuestionIndex = 0; 
        }
        const q = questions[currentQuestionIndex];
        questionText.innerText = q.q;
        q.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.innerText = option;
            button.style.pointerEvents = "none"; 
            if (index === quizSelectedAnswerIndex) {
                button.classList.add('selected');
            }
            answerOptions.appendChild(button);
        });
    }
    
    function updateQuizSelection() {
        const buttons = answerOptions.querySelectorAll('button');
        buttons.forEach((button, index) => {
            if (index === quizSelectedAnswerIndex) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }
    
    function updateStrikesDisplay() {
        let displayString = "";
        for(let i = 0; i < strikes; i++) {
            displayString += "X ";
        }
        if(strikesLbl) strikesLbl.innerText = displayString;
    }

    function checkAnswer(selectedIndex, correctIndex) {
        
        if (quizFeedback.className.includes('show')) {
            return;
        }

        const buttons = answerOptions.querySelectorAll('button');
        buttons.forEach(button => button.disabled = true);

        const isCorrect = (selectedIndex === correctIndex);

        if (isCorrect) {
            quizFeedback.innerText = "¡Correcto!";
            quizFeedback.className = 'correct show'; 
        } else {
            quizFeedback.innerText = "¡Incorrecto!";
            quizFeedback.className = 'incorrect show'; 
            
            strikes++; 
            updateStrikesDisplay();
            speedUpTetris(); 
        }
        
        setTimeout(() => {
            quizFeedback.className = ''; 
            
            if (strikes >= 5) {
                triggerGameOver();
            } 
            else {
                currentQuestionIndex++;

                if (currentQuestionIndex >= questions.length) {
                    triggerGameOver();
                } else {
                    showNextQuestion();
                }
            }
            
        }, 1000); 
    }

    function speedUpTetris() {
        currentBaseDelay = Math.max(50, currentBaseDelay - 50); 
        if (delay !== (currentBaseDelay / Tetromino.DELAY_INCREASED)) {
             delay = currentBaseDelay;
        }
    }

    function updateMenuSelection() {
        menuItems.forEach((item, index) => {
            if (index === menuSelectionIndex) item.classList.add('selected');
            else item.classList.remove('selected');
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
        
        if (event.key === "p" || event.key === "P") {
            togglePause();
            return;
        }

        if (isPaused) {
             switch (event.key) {
                case "a": case "A": case "ArrowLeft":
                    pauseSelectionIndex--;
                    if (pauseSelectionIndex < 0) pauseSelectionIndex = pauseItems.length - 1;
                    updatePauseSelection();
                    handled = true;
                    break;
                case "d": case "D": case "ArrowRight":
                    pauseSelectionIndex++;
                    if (pauseSelectionIndex >= pauseItems.length) pauseSelectionIndex = 0;
                    updatePauseSelection();
                    handled = true;
                    break;
                case " ": case "q": case "Q": 
                    pauseItems[pauseSelectionIndex].click();
                    handled = true;
                    break;
            }
            if (handled) event.preventDefault();
            return; 
        }

        if (menuContainer.style.display === "flex") {
            switch (event.key) {
                case "ArrowUp": case "w": case "W":
                    menuSelectionIndex--;
                    if (menuSelectionIndex < 0) menuSelectionIndex = menuItems.length - 1;
                    updateMenuSelection();
                    handled = true;
                    break;
                case "ArrowDown": case "s": case "S":
                    menuSelectionIndex++;
                    if (menuSelectionIndex >= menuItems.length) menuSelectionIndex = 0;
                    updateMenuSelection();
                    handled = true;
                    break;
                case " ": 
                    menuItems[menuSelectionIndex].click(); 
                    handled = true;
                    break;
            }
        }
        
        else if (isGameOver) {
             switch (event.key) {
                case "ArrowLeft": case "a": case "A":
                    gameOverSelectionIndex--;
                    if (gameOverSelectionIndex < 0) gameOverSelectionIndex = gameOverItems.length - 1;
                    updateGameOverSelection();
                    handled = true;
                    break;
                case "ArrowRight": case "d": case "D":
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
        
        else if (numPlayers === 2 && !quizFeedback.className.includes('show')) {
            const quizButtons = answerOptions.querySelectorAll('button');
            if (quizButtons.length > 0) {
                 switch (event.key) {
                    case "w": case "W":
                        quizSelectedAnswerIndex--;
                        if (quizSelectedAnswerIndex < 0) quizSelectedAnswerIndex = quizButtons.length - 1;
                        updateQuizSelection();
                        handled = true;
                        break;
                    case "s": case "S":
                        quizSelectedAnswerIndex++;
                        if (quizSelectedAnswerIndex >= quizButtons.length) quizSelectedAnswerIndex = 0;
                        updateQuizSelection();
                        handled = true;
                        break;
                    case "q": case "Q":
                        const q = questions[currentQuestionIndex];
                        checkAnswer(quizSelectedAnswerIndex, q.correct);
                        handled = true;
                        break;
                 }
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
                
                case "a": case "A":
                    if (!tetromino.collides(i => ({ x: tetromino.x[i] - 1, y: tetromino.y[i] })))
                        tetromino.update(i => --tetromino.x[i]);
                    handled = true;
                    break;
                case "d": case "D":
                    if (!tetromino.collides(i => ({ x: tetromino.x[i] + 1, y: tetromino.y[i] })))
                        tetromino.update(i => ++tetromino.x[i]);
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

}