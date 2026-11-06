document.addEventListener('DOMContentLoaded', () => {
    // 1. Animaciones de entrada al hacer Scroll (IntersectionObserver)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-card').forEach(card => observer.observe(card));

    // 2. Lógica del Videojuego de Memoria de Tarjetas
    const gameData = [
        { concept: "Estadio", matchId: 1 },
        { concept: "Chillán (Nelson Oyarzún)", matchId: 1 },
        { concept: "Arquero Albo", matchId: 2 },
        { concept: "Vozinha", matchId: 2 },
        { concept: "Puntos Colo-Colo", matchId: 3 },
        { concept: "58 Puntos", matchId: 3 },
        { concept: "Objetivo Albo", matchId: 4 },
        { concept: "Estrella 35", matchId: 4 },
        { concept: "DT Ñublense", matchId: 5 },
        { concept: "Vicente Núñez", matchId: 5 },
        { concept: "Fecha Decisiva", matchId: 6 },
        { concept: "Fecha 27", matchId: 6 }
    ];

    const gameGrid = document.getElementById('game-grid');
    const movesDisplay = document.getElementById('moves-count');
    const pairsDisplay = document.getElementById('pairs-count');
    const timerDisplay = document.getElementById('timer');
    const resetBtn = document.getElementById('reset-btn');
    const winModal = document.getElementById('win-modal');
    const modalMoves = document.getElementById('modal-moves');
    const modalTime = document.getElementById('modal-time');
    const modalRestart = document.getElementById('modal-restart');

    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer = 0;
    let timerInterval = null;
    let gameStarted = false;

    // Efectos de sonido con Web Audio API
    function playAudioTone(freq, type = 'sine', duration = 0.15) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // AudioContext no disponible o bloqueado por interacción previa
        }
    }

    function startTimer() {
        if (!gameStarted) {
            gameStarted = true;
            timerInterval = setInterval(() => {
                timer++;
                timerDisplay.textContent = `${timer}s`;
            }, 1000);
        }
    }

    function stopTimer() {
        clearInterval(timerInterval);
        gameStarted = false;
    }

    function shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    function initGame() {
        stopTimer();
        timer = 0;
        moves = 0;
        matchedPairs = 0;
        flippedCards = [];
        movesDisplay.textContent = '0';
        pairsDisplay.textContent = '0 / 6';
        timerDisplay.textContent = '0s';
        gameGrid.innerHTML = '';
        winModal.classList.add('hidden');
        winModal.classList.remove('opacity-100');

        const shuffledData = shuffle([...gameData]);

        shuffledData.forEach((item) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card-game';
            cardEl.dataset.matchId = item.matchId;

            cardEl.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <span class="font-header tracking-widest text-brand-gold">LOS REALES</span>
                    </div>
                    <div class="card-back">
                        <span>${item.concept}</span>
                    </div>
                </div>
            `;

            cardEl.addEventListener('click', () => handleCardClick(cardEl));
            gameGrid.appendChild(cardEl);
        });
    }

    function handleCardClick(card) {
        if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
            return;
        }

        startTimer();
        playAudioTone(440, 'sine', 0.1);
        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            checkMatch();
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.matchId === card2.dataset.matchId;

        if (isMatch) {
            playAudioTone(600, 'triangle', 0.2);
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            pairsDisplay.textContent = `${matchedPairs} / 6`;
            flippedCards = [];

            if (matchedPairs === 6) {
                stopTimer();
                setTimeout(showWinModal, 500);
            }
        } else {
            playAudioTone(200, 'sawtooth', 0.25);
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 900);
        }
    }

    function showWinModal() {
        modalMoves.textContent = moves;
        modalTime.textContent = `${timer} segundos`;
        winModal.classList.remove('hidden');
        setTimeout(() => winModal.classList.add('opacity-100'), 10);
        playAudioTone(800, 'sine', 0.4);
    }

    resetBtn.addEventListener('click', initGame);
    modalRestart.addEventListener('click', initGame);

    // Inicializar el juego en la primera carga
    initGame();
});