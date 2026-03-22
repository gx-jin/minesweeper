// ============================================================
//  Minesweeper — Morandi High-Contrast Theme + Auto-Fit Grid
// ============================================================

(function () {
  'use strict';

  // ── Difficulty presets ─────────────────────────────────────
  const PRESETS = {
    beginner:     { rows: 9,  cols: 9,  mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert:       { rows: 16, cols: 30, mines: 99 },
  };

  // ── State ──────────────────────────────────────────────────
  let rows = 0, cols = 0, totalMines = 0;
  let board = [];        
  let gameState;         // 'idle' | 'playing' | 'won' | 'lost'
  let firstClick = true;
  let timerValue = 0;
  let timerInterval = null;
  let flagsPlaced = 0;
  let currentDifficulty = 'expert';
  let marksEnabled = true;   
  let pendingChord = [];     
  
  let inputMode = 'dig';

  let bestTimes = loadBestTimes();

  // ── DOM refs ───────────────────────────────────────────────
  const boardContainer = document.getElementById('board-container');
  const boardEl        = document.getElementById('board');
  const faceBtn        = document.getElementById('face-btn');
  const mineCountEl    = document.getElementById('mine-count');
  const timerEl        = document.getElementById('timer-count');
  const modeToggle     = document.getElementById('mode-toggle');

  const confettiContainer = document.createElement('div');
  confettiContainer.id = 'confetti-container';
  document.body.appendChild(confettiContainer);

  // Handle Resize
  window.addEventListener('resize', resizeBoard);

  // ── Init ───────────────────────────────────────────────────
  initGame(PRESETS.expert);
  setupMenu();
  setupDialogs();
  setupFaceButton();
  setupModeToggle();

  function initGame(config, keepConfig = false) {
    if(!keepConfig) {
      let r = config.rows;
      let c = config.cols;
      
      // Auto-rotate board for portrait screens (Make the board vertical)
      if (window.innerHeight > window.innerWidth && c > r) {
        rows = c;
        cols = r;
      } else {
        rows = r;
        cols = c;
      }
      totalMines = config.mines;
    }

    stopTimer();
    gameState = 'idle';
    firstClick = true;
    flagsPlaced = 0;
    timerValue = 0;
    pendingChord = [];

    updateMineCounter();
    updateTimer();
    setFace('😊');
    boardContainer.classList.remove('shake');
    confettiContainer.innerHTML = '';

    board = [];
    for (let r = 0; r < rows; r++) {
      board[r] = [];
      for (let c = 0; c < cols; c++) {
        board[r][c] = {
          mine: false,
          revealed: false,
          flagged: false,
          question: false,
          number: 0,
          el: null,
        };
      }
    }
    renderBoard();
  }

  function resizeBoard() {
    if (!boardContainer || rows === 0 || cols === 0) return;
    
    // Account for container padding/borders
    const maxWidth = boardContainer.clientWidth - 12; 
    const maxHeight = boardContainer.clientHeight - 12;
    
    // Calculate max cell size to fit cleanly
    const cellW = maxWidth / cols;
    const cellH = maxHeight / rows;
    
    // Cap at 44px so it doesn't get ridiculously large on giant screens
    const size = Math.floor(Math.min(cellW, cellH, 44)); 
    
    boardEl.style.setProperty('--cell-size', `${size}px`);
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.setProperty('--cols', cols);
    boardEl.style.setProperty('--rows', rows);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'cell';
        el.dataset.r = r;
        el.dataset.c = c;

        el.addEventListener('mousedown', onCellMouseDown);
        el.addEventListener('mouseup',   onCellMouseUp);
        el.addEventListener('mouseleave',   onCellMouseLeave);
        el.addEventListener('contextmenu', e => e.preventDefault());

        board[r][c].el = el;
        boardEl.appendChild(el);
      }
    }
    
    resizeBoard();
  }

  function placeMines(safeR, safeC) {
    const safe = new Set();
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = safeR + dr, nc = safeC + dc;
        if (inBounds(nr, nc)) safe.add(nr * cols + nc);
      }

    let placed = 0;
    while (placed < totalMines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      const key = r * cols + c;
      if (!board[r][c].mine && !safe.has(key)) {
        board[r][c].mine = true;
        placed++;
      }
    }

    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (!board[r][c].mine)
          board[r][c].number = countAdjacentMines(r, c);
  }

  function updateCellEl(r, c) {
    const cell = board[r][c];
    const el = cell.el;
    if (!el) return;

    const isAnimated = el.classList.contains('animated');
    el.className = 'cell' + (isAnimated ? ' animated' : '');
    el.textContent = '';

    if (cell.revealed) {
      el.classList.add('revealed');
      if (cell.mine) {
        el.classList.add('mine-hit');
      } else if (cell.number > 0) {
        el.classList.add(`n${cell.number}`);
        el.textContent = cell.number;
      }
    } else if (cell.flagged) {
      el.classList.add('flagged');
    } else if (cell.question) {
      el.classList.add('question');
    }
  }

  let chordCandidate = null;

  function onCellMouseDown(e) {
    if (gameState === 'won' || gameState === 'lost') return;

    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;

    // Determine if it was chorded structurally
    const mouseButtonsDown = e.buttons !== undefined ? e.buttons : 1; 
    
    // FIX: A single standard mouse click on a **REVEALED NUMBER** configures chords automatically!
    // This allows very clean highlight triggering, even purely left-click without right-clicking etc.
    if ((board[r][c].revealed && board[r][c].number > 0) || mouseButtonsDown === 3 || e.button === 1 || e.detail >= 2) {
      clearChordHighlight();
      if (board[r][c].revealed && board[r][c].number > 0) {
        chordCandidate = { r, c };
        highlightNeighbours(r, c);
      }
      setFace('😮');
      return;
    }

    // Normal non-revealed tile click
    if (e.button === 0 || e.type === 'touchstart') {
      if (!board[r][c].revealed && !board[r][c].flagged) {
        board[r][c].el.classList.add('pressed');
        setFace('😮');
      }
      chordCandidate = null;
    }
  }

  function onCellMouseLeave(e) {
    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;
    board[r][c].el.classList.remove('pressed');
  }

  function onCellMouseUp(e) {
    if (gameState === 'won' || gameState === 'lost') return;

    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;

    clearPressedCells();
    clearChordHighlight();

    if (gameState !== 'lost' && gameState !== 'won') setFace('😊');

    const mouseButtonsDown = e.buttons !== undefined ? e.buttons : 0;

    // If chord candidate was formed on revealed numbers via single clicks, right clicks or double clicks
    if (board[r][c].revealed) {
       // Only execute the chord if it's the actual mouse leaving or middle click/chord release!
       // Even a single left-click on a revealed number will chord it dynamically since we enabled standard clicking interactions
       if (board[r][c].number > 0) {
          chord(r, c);
       }
       return;
    }

    if (e.button === 0) {
      // Flag Mode
      if (inputMode === 'flag') {
        handleFlag(r, c);
      } else {
        // Dig Mode
        if (board[r][c].flagged || board[r][c].question) return;
        handleReveal(r, c, 0);
      }
    } 
    else if (e.button === 2) {
      // Right Click
      handleFlag(r, c);
    }
  }

  function clearPressedCells() {
    document.querySelectorAll('.cell.pressed').forEach(el => el.classList.remove('pressed'));
  }

  function highlightNeighbours(r, c) {
    forNeighbours(r, c, (nr, nc) => {
      const cell = board[nr][nc];
      if (!cell.revealed && !cell.flagged && !cell.question) {
        cell.el.classList.add('chord-highlight');
        pendingChord.push({ r: nr, c: nc });
      }
    });
  }

  function clearChordHighlight() {
    pendingChord.forEach(({ r, c }) => board[r][c].el.classList.remove('chord-highlight'));
    pendingChord = [];
    chordCandidate = null;
  }

  function setupModeToggle() {
    modeToggle.addEventListener('change', (e) => {
      inputMode = e.target.checked ? 'flag' : 'dig';
    });
  }

  function handleReveal(r, c, dist = 0) {
    if (gameState === 'won' || gameState === 'lost') return;

    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      startTimer();
      gameState = 'playing';
      boardContainer.classList.remove('shake');
    }

    if (board[r][c].mine) {
      revealMine(r, c);
      return;
    }

    floodReveal(r, c, r, c);
    checkWin();
  }

  function handleFlag(r, c) {
    if (gameState === 'won' || gameState === 'lost') return;
    if (board[r][c].revealed) return;

    if (!board[r][c].flagged && !board[r][c].question) {
      board[r][c].flagged = true;
      flagsPlaced++;
    } else if (board[r][c].flagged) {
      board[r][c].flagged = false;
      flagsPlaced--;
      if (marksEnabled) {
        board[r][c].question = true;
      }
    } else if (board[r][c].question) {
      board[r][c].question = false;
    }

    updateCellEl(r, c);
    updateMineCounter();
  }

  function chord(r, c) {
    if (!board[r][c].revealed || board[r][c].number === 0) return;
    const adjFlags = countAdjacentFlags(r, c);
    if (adjFlags !== board[r][c].number) return;

    let hitMine = false;
    forNeighbours(r, c, (nr, nc) => {
      const cell = board[nr][nc];
      if (!cell.revealed && !cell.flagged && !cell.question) {
        if (cell.mine) {
          hitMine = true;
          revealMine(nr, nc);
        } else {
          floodReveal(nr, nc, r, c);
        }
      }
    });

    if (!hitMine) checkWin();
  }

  function floodReveal(r, c, originR, originC) {
    if (!inBounds(r, c)) return;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged || cell.mine) return;

    cell.revealed = true;
    
    const dist = Math.max(Math.abs(r - originR), Math.abs(c - originC));
    if (dist > 0) {
      cell.el.style.animationDelay = `${dist * 0.03}s`;
    }
    cell.el.classList.add('animated');

    updateCellEl(r, c);

    if (cell.number === 0) {
      forNeighbours(r, c, (nr, nc) => floodReveal(nr, nc, originR, originC));
    }
  }

  function revealMine(hitR, hitC) {
    gameState = 'lost';
    stopTimer();
    setFace('😵');

    boardContainer.classList.add('shake');

    board[hitR][hitC].revealed = true;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (cell.flagged && !cell.mine) {
          cell.el.className = 'cell revealed wrong-flag';
        } else if (cell.mine && !cell.flagged) {
          cell.revealed = true;
          const dist = Math.max(Math.abs(r - hitR), Math.abs(c - hitC));
          cell.el.style.animationDelay = `${dist * 0.05}s`;
          cell.el.className = 'cell revealed mine-revealed';
        }
      }
    }

    board[hitR][hitC].el.style.animationDelay = '0s';
    board[hitR][hitC].el.className = 'cell revealed mine-hit animated';
  }

  function checkWin() {
    let unrevealedSafe = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (!board[r][c].revealed && !board[r][c].mine)
          unrevealedSafe++;

    if (unrevealedSafe === 0) {
      gameState = 'won';
      stopTimer();
      setFace('😎');

      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (board[r][c].mine && !board[r][c].flagged) {
            board[r][c].flagged = true;
            flagsPlaced++;
            updateCellEl(r, c);
          }

      updateMineCounter();
      spawnConfetti();
      
      setTimeout(() => checkBestTime(), 1500);
    }
  }

  function spawnConfetti() {
    const colors = ['#0284c7', '#38bdf8', '#fb7185', '#818cf8', '#64748b'];
    for(let i = 0; i < 100; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
        conf.style.animationDelay = (Math.random() * 0.5) + 's';
        
        if(Math.random() > 0.5) conf.style.borderRadius = '50%';
        else {
            conf.style.width = (Math.random() * 10 + 5) + 'px';
            conf.style.height = (Math.random() * 5 + 5) + 'px';
        }

        confettiContainer.appendChild(conf);
    }
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 5000);
  }

  function startTimer() {
    timerValue = 0;
    updateTimer();
    timerInterval = setInterval(() => {
      if (timerValue < 999) {
        timerValue++;
        updateTimer();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimer() {
    timerEl.textContent = String(timerValue).padStart(3, '0');
  }

  function updateMineCounter() {
    const remaining = totalMines - flagsPlaced;
    const clamped = Math.max(-99, Math.min(999, remaining));
    if (clamped < 0) {
      mineCountEl.textContent = '-' + String(Math.abs(clamped)).padStart(2, '0');
    } else {
      mineCountEl.textContent = String(clamped).padStart(3, '0');
    }
  }

  function setFace(emoji) {
    faceBtn.textContent = emoji;
  }

  function setupFaceButton() {
    faceBtn.addEventListener('click', () => {
      let baseConfig;
      if (currentDifficulty === 'custom') {
        let h = parseInt(document.getElementById('custom-height').value) || rows;
        let w = parseInt(document.getElementById('custom-width').value)  || cols;
        baseConfig = { rows: h, cols: w, mines: totalMines };
      } else {
        baseConfig = PRESETS[currentDifficulty];
      }
      initGame(baseConfig);
    });
  }

  function inBounds(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols;
  }

  function forNeighbours(r, c, fn) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc)) fn(nr, nc);
      }
  }

  function countAdjacentMines(r, c) {
    let count = 0;
    forNeighbours(r, c, (nr, nc) => { if (board[nr][nc].mine) count++; });
    return count;
  }

  function countAdjacentFlags(r, c) {
    let count = 0;
    forNeighbours(r, c, (nr, nc) => { if (board[nr][nc].flagged) count++; });
    return count;
  }

  function loadBestTimes() {
    try {
      const saved = localStorage.getItem('minesweeper-mod-best');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      beginner:     { time: 999, name: 'Anonymous' },
      intermediate: { time: 999, name: 'Anonymous' },
      expert:       { time: 999, name: 'Anonymous' },
    };
  }

  function saveBestTimes() {
    try {
      localStorage.setItem('minesweeper-mod-best', JSON.stringify(bestTimes));
    } catch (_) {}
  }

  function checkBestTime() {
    const key = currentDifficulty;
    if (!PRESETS[key]) return;  
    if (timerValue < bestTimes[key].time) {
      showWinnerDialog(key);
    }
  }

  function showWinnerDialog(diffKey) {
    const labels = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' };
    document.getElementById('winner-msg').textContent =
      `You secured the fastest time for ${labels[diffKey]} level!`;
    document.getElementById('winner-name').value = '';

    showDialog('winner-dialog');

    document.getElementById('winner-ok').onclick = () => {
      const name = document.getElementById('winner-name').value.trim() || 'Anonymous';
      bestTimes[diffKey] = { time: timerValue, name };
      saveBestTimes();
      hideDialog('winner-dialog');
    };
  }

  function setupMenu() {
    document.getElementById('btn-settings').addEventListener('click', () => {
      showDialog('settings-modal');
    });

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        handleMenuAction(e.target.dataset.action);
      });
    });

    document.querySelectorAll('.menu-btn[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleMenuAction(btn.dataset.action);
      });
    });

    document.getElementById('opt-marks').addEventListener('change', (e) => {
      marksEnabled = e.target.checked;
    });

    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        hideDialog(btn.dataset.close);
      });
    });

    document.getElementById('overlay').addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => hideDialog(m.id));
    });
  }

  function handleMenuAction(action) {
    switch (action) {
      case 'beginner':
        currentDifficulty = 'beginner';
        initGame(PRESETS.beginner);
        break;
      case 'intermediate':
        currentDifficulty = 'intermediate';
        initGame(PRESETS.intermediate);
        break;
      case 'expert':
        currentDifficulty = 'expert';
        initGame(PRESETS.expert);
        break;
      case 'custom':
        showDialog('custom-dialog');
        break;
      case 'best-times':
        hideDialog('settings-modal');
        showBestTimesDialog();
        break;
      case 'how-to':
        hideDialog('settings-modal');
        showDialog('help-dialog');
        break;
    }
  }

  function showDialog(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
  }

  function hideDialog(id) {
    const el = document.getElementById(id);
    if(el) el.classList.add('hidden');
    
    const openModals = document.querySelectorAll('.modal:not(.hidden)');
    if (openModals.length === 0) {
      document.getElementById('overlay').classList.add('hidden');
    }
  }

  function setupDialogs() {
    document.getElementById('custom-ok').addEventListener('click', () => {
      let h = parseInt(document.getElementById('custom-height').value) || 9;
      let w = parseInt(document.getElementById('custom-width').value)  || 9;
      let m = parseInt(document.getElementById('custom-mines').value)  || 10;

      h = Math.max(9, Math.min(24, h));
      w = Math.max(9, Math.min(30, w));
      const maxMines = (h - 1) * (w - 1);
      m = Math.max(10, Math.min(maxMines, m));

      document.getElementById('custom-height').value = h;
      document.getElementById('custom-width').value  = w;
      document.getElementById('custom-mines').value  = m;

      currentDifficulty = 'custom';
      hideDialog('custom-dialog');
      initGame({ rows: h, cols: w, mines: m });
    });

    document.getElementById('times-reset').addEventListener('click', () => {
      bestTimes = {
        beginner:     { time: 999, name: 'Anonymous' },
        intermediate: { time: 999, name: 'Anonymous' },
        expert:       { time: 999, name: 'Anonymous' },
      };
      saveBestTimes();
      populateBestTimesDialog();
    });
  }

  function showBestTimesDialog() {
    populateBestTimesDialog();
    showDialog('times-dialog');
  }

  function populateBestTimesDialog() {
    ['beginner', 'intermediate', 'expert'].forEach(key => {
      document.getElementById(`time-${key}`).textContent = bestTimes[key].time;
      document.getElementById(`name-${key}`).textContent = bestTimes[key].name;
    });
  }

  boardEl.addEventListener('contextmenu', e => e.preventDefault());
  document.getElementById('panel').addEventListener('contextmenu', e => e.preventDefault());

})();
