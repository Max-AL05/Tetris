window.onload = () => {

    const menuContainer = document.getElementById("menu-container");
    const startButton = document.getElementById("start-button");
    const playersButton = document.getElementById("players-button");
    const wrapper = document.getElementById("wrapper");

    const gameArea = document.getElementById("game-area");
    
    const
        background = document.getElementById("background"),
        scoreLbl = document.getElementById("score"),
        linesLbl = document.getElementById("lines"),
        canvas = document.getElementById("game-canvas"),
        ctx = canvas.getContext("2d"),
        gameOverModal = document.getElementById("game-over-modal");
    
    const restartButton = document.getElementById("restart-button");
    const menuButton = document.getElementById("menu-button");

    const quizContainer = document.getElementById("quiz-container");
    const questionText = document.getElementById("question-text");
    const answerOptions = document.getElementById("answer-options");
    const quizFeedback = document.getElementById("quiz-feedback"); 

    class Tetromino {
        static COLORS = ["blue", "green", "yellow", "red", "orange", "light-blue", "purple"];
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
                this.img.src = `resources/${Tetromino.COLORS[color]}.jpg`
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

        draw() {
            if (!this.img.complete) {
                this.img.onload = () => this.draw();
                return;
            }
            for (let i = 0; i < this.length; ++i) {
                ctx.drawImage(
                    this.img,
                    this.x[i] * Tetromino.BLOCK_SIZE,
                    this.y[i] * Tetromino.BLOCK_SIZE,
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
        TETROMINOES = [
            new Tetromino([0, 0, 0, 0], [0, 1, 2, 3]),
            new Tetromino([0, 0, 1, 1], [0, 1, 0, 1]),
            new Tetromino([0, 1, 1, 1], [0, 0, 1, 2]),
            new Tetromino([0, 0, 0, 1], [0, 1, 2, 0]),
            new Tetromino([0, 1, 1, 2], [0, 0, 1, 1]),
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 1]),
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 0])
        ];

    let tetromino = null,
        delay,
        score,
        lines,
        isGameOver = false,
        numPlayers = 1, 
        currentBaseDelay;

    const questions = [
        {
            q: "¿Qué lenguaje se usa para estilizar una página web?",
            options: ["JavaScript", "CSS", "HTML", "Python"],
            correct: 1
        },
        {
            q: "¿Qué significa 'DOM'?",
            options: ["Document Object Model", "Data Object Model", "Direct Output Mainframe", "Digital Order Module"],
            correct: 0
        },
        {
            q: "La etiqueta <p> se usa para...",
            options: ["Imágenes", "Enlaces", "Párrafos", "Listas"],
            correct: 2
        },
        {
            q: "¿Cuál NO es un tipo de dato primitivo en JS?",
            options: ["String", "Number", "Boolean", "Object"],
            correct: 3
        }
    ];
    let currentQuestionIndex = 0;

    playersButton.onclick = () => {
        numPlayers = (numPlayers === 1) ? 2 : 1;
        playersButton.innerText = `Jugadores: ${numPlayers}`;
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
    };

    function setup() {
        canvas.style.top = Tetromino.BLOCK_SIZE;
        canvas.style.left = Tetromino.BLOCK_SIZE;

        ctx.canvas.width = FIELD_WIDTH * Tetromino.BLOCK_SIZE;
        ctx.canvas.height = FIELD_HEIGHT * Tetromino.BLOCK_SIZE;

        const scale = Tetromino.BLOCK_SIZE / 13.83333333333;
        background.style.width = scale * 166;
        background.style.height = scale * 304;

        const middle = Math.floor(FIELD_WIDTH / 2);
        for (const t of TETROMINOES) t.x = t.x.map(x => x + middle);

        reset();
        draw();
    }

    function reset() {
        FIELD.forEach((_, y) => FIELD[y] = Array.from({ length: FIELD_WIDTH }).map(_ => false));
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        currentBaseDelay = Tetromino.DELAY; 
        delay = currentBaseDelay;
        score = 0;
        lines = 0;

        gameOverModal.style.display = "none";
        isGameOver = false;

        if (gameArea.style.display === "none") {
            quizContainer.style.display = "none";
        }
    }

    function draw() {
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
                        gameOverModal.style.display = "block";
                        isGameOver = true;
                    }
                }
            } else
                tetromino.update(i => ++tetromino.y[i]);
        }
        else {
            scoreLbl.innerText = score;
            linesLbl.innerText = lines;
            tetromino = (({ x, y }, color) =>
                new Tetromino([...x], [...y], color)
            )(
                TETROMINOES[Math.floor(Math.random() * (TETROMINOES.length - 1))],
                Math.floor(Math.random() * (Tetromino.COLORS.length - 1))
            );
            tetromino.draw();
        }

        if (!isGameOver) {
            if (delay !== (currentBaseDelay / Tetromino.DELAY_INCREASED)) {
                delay = currentBaseDelay;
            }
            setTimeout(draw, delay);
        }
    }
    
    function startQuiz() {
        currentQuestionIndex = 0;
        showNextQuestion();
    }

    function showNextQuestion() {
        answerOptions.innerHTML = "";

        if (currentQuestionIndex >= questions.length) {
            currentQuestionIndex = 0; 
        }

        const q = questions[currentQuestionIndex];
        questionText.innerText = q.q;

        q.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.innerText = option;
            button.onclick = () => checkAnswer(index, q.correct);
            answerOptions.appendChild(button);
        });
    }

function checkAnswer(selectedIndex, correctIndex) {
    
    const buttons = answerOptions.querySelectorAll('button');
    buttons.forEach(button => button.disabled = true);

    const isCorrect = (selectedIndex === correctIndex);

    if (isCorrect) {
        quizFeedback.innerText = "¡Correcto!";
        quizFeedback.className = 'correct show'; 
    } else {
        quizFeedback.innerText = "¡Incorrecto!";
        quizFeedback.className = 'incorrect show';
        
        speedUpTetris();
    }
    
    setTimeout(() => {
        
        quizFeedback.className = ''; 
        
        currentQuestionIndex++;
        showNextQuestion();

    }, 1000);
}

    function speedUpTetris() {
        currentBaseDelay = Math.max(50, currentBaseDelay - 50); 
    
        if (delay !== (currentBaseDelay / Tetromino.DELAY_INCREASED)) {
             delay = currentBaseDelay;
        }
    }

    window.onkeydown = event => {
        if (isGameOver) {
            return; 
        }
        if (gameArea.style.display === "none") return;
        
        switch (event.key) {
            case "ArrowLeft":
                if (!tetromino.collides(i => ({ x: tetromino.x[i] - 1, y: tetromino.y[i] })))
                    tetromino.update(i => --tetromino.x[i]);
                break;
            case "ArrowRight":
                if (!tetromino.collides(i => ({ x: tetromino.x[i] + 1, y: tetromino.y[i] })))
                    tetromino.update(i => ++tetromino.x[i]);
                break;
            case "ArrowDown":
                delay = currentBaseDelay / Tetromino.DELAY_INCREASED;
                break;
            case " ":
                tetromino.rotate();
                break;
        }
    }
    window.onkeyup = event => {
        if (isGameOver) return;
        if (gameArea.style.display === "none") return; 
        if (event.key === "ArrowDown")
            delay = currentBaseDelay;
    }
}