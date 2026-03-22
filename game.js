// ============================================================
//  Minesweeper — Bilingual Morandi Edition
// ============================================================

(function () {
  'use strict';

  // ── i18n Locales ───────────────────────────────────────────
  const i18n = {
    en: {
      title: "Minesweeper",
      beginner: "Beginner",
      intermediate: "Intermediate",
      expert: "Expert",
      custom: "Custom",
      mines: "MINES",
      time: "TIME",
      dig: "⛏️ Dig",
      flag: "🚩 Flag",
      menuTitle: "Menu",
      options: "Options",
      marks: "Marks (?)",
      more: "More",
      bestTimes: "Best Times",
      howToPlay: "How to Play",
      customTitle: "Custom Field",
      customHeight: "Height (9-24):",
      customWidth: "Width (9-30):",
      customMines: "Mines:",
      startGame: "Start Game",
      fastestTitle: "Fastest Sweepers",
      resetScores: "Reset Scores",
      winTitle: "Congratulations! 🏆",
      winPlaceholder: "Enter your name",
      saveScore: "Save Score",
      helpTitle: "How to Play",
      helpObj: "<strong>Objective:</strong> Clear the board without detonating any mines.",
      helpDig: "<strong>Dig / Left Click:</strong> Reveal a cell.",
      helpFlag: "<strong>Flag / Right Click:</strong> Mark a suspected mine 🚩.",
      helpChord: "<strong>Chord / Auto Reveal:</strong> Click on any revealed number whose surrounding flags match the number to instantly reveal remaining safe cells.",
      helpTip: "<strong>Mobile Tip:</strong> Use the Dig/Flag toggle below the timer to safely place flags on touch screens.",
      anonymous: "Anonymous",
      winMsg: (diff) => `You secured the fastest time for ${diff}!`,
      langToggleText: "中" // Click to switch to Chinese
    },
    zh: {
      title: "扫雷",
      beginner: "初级",
      intermediate: "中级",
      expert: "困难",
      custom: "自定义",
      mines: "地雷",
      time: "时间",
      dig: "⛏️ 挖开",
      flag: "🚩 插旗",
      menuTitle: "菜单",
      options: "设置选项",
      marks: "启用问号 (?)",
      more: "更多",
      bestTimes: "英雄榜",
      howToPlay: "玩法说明",
      customTitle: "自定义棋盘",
      customHeight: "高度 (9-24)：",
      customWidth: "宽度 (9-30)：",
      customMines: "地雷数量：",
      startGame: "开始游戏",
      fastestTitle: "扫雷英雄榜",
      resetScores: "重置成绩",
      winTitle: "恭喜通关！🏆",
      winPlaceholder: "输入您的名字",
      saveScore: "保存成绩",
      helpTitle: "游戏玩法",
      helpObj: "<strong>游戏目标：</strong> 避开所有地雷，挖开所有安全方块。",
      helpDig: "<strong>挖开 / 左键单击：</strong> 翻开未知方块。",
      helpFlag: "<strong>插旗 / 右键单击：</strong> 标记疑似地雷的方块 🚩。",
      helpChord: "<strong>高级高亮（双击排雷）：</strong> 直接点击已翻开的数字，如果周围已插旗数等于该数字，瞬间翻开周围的安全区域！",
      helpTip: "<strong>手机端提示：</strong> 使用计时器下方的开关，即可安全轻松地切换挖开与插旗模式。",
      anonymous: "佚名",
      winMsg: (diff) => `太棒了！您刷新了【${diff}】的最快记录！`,
      langToggleText: "EN" // Click to switch to English
    }
  };

  let currentLang = localStorage.getItem('minesweeper-lang') || 'zh';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('minesweeper-lang', lang);
    const t = i18n[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    document.getElementById('help-obj').innerHTML = t.helpObj;
    document.getElementById('help-dig').innerHTML = t.helpDig;
    document.getElementById('help-flag').innerHTML = t.helpFlag;
    document.getElementById('help-chord').innerHTML = t.helpChord;
    document.getElementById('help-tip').innerHTML = t.helpTip;

    document.getElementById('winner-name').placeholder = t.winPlaceholder;
    document.getElementById('btn-lang').textContent = t.langToggleText;
    
    // Update best times anonymous names if they are currently default
    ['beginner', 'intermediate', 'expert'].forEach(key => {
      const nmEl = document.getElementById(`name-${key}`);
      if (nmEl.textContent === i18n.en.anonymous || nmEl.textContent === i18n.zh.anonymous) {
        nmEl.textContent = t.anonymous;
      }
    });
  }

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
  const langBtn        = document.getElementById('btn-lang');

  const confettiContainer = document.createElement('div');
  confettiContainer.id = 'confetti-container';
  document.body.appendChild(confettiContainer);

  // Handle Resize
  window.addEventListener('resize', resizeBoard);

  // ── Init ───────────────────────────────────────────────────
  applyLanguage(currentLang);
  initGame(PRESETS.expert);
  setupMenu();
  setupDialogs();
  setupFaceButton();
  setupModeToggle();

  langBtn.addEventListener('click', () => {
    applyLanguage(currentLang === 'zh' ? 'en' : 'zh');
  });

  function initGame(config, keepConfig = false) {
    if(!keepConfig) {
      let r = config.rows;
      let c = config.cols;
      
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
    
    const cellW = maxWidth / cols;
    const cellH = maxHeight / rows;
    
    let size = Math.floor(Math.min(cellW, cellH)); 
    
    // Ensure size is at least 32px so fingers can actually tap it on mobile!
    if (size < 32) size = 32;
    // Cap at 44px
    if (size > 44) size = 44;
    
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
        el.addEventListener('touchstart', onCellTouchStart, { passive: true });
        el.addEventListener('touchmove', onCellTouchMove, { passive: true });
        el.addEventListener('touchend', onCellTouchEnd);
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

    const mouseButtonsDown = e.buttons !== undefined ? e.buttons : 1; 
    
    if ((board[r][c].revealed && board[r][c].number > 0) || mouseButtonsDown === 3 || e.button === 1 || e.detail >= 2) {
      clearChordHighlight();
      if (board[r][c].revealed && board[r][c].number > 0) {
        chordCandidate = { r, c };
        highlightNeighbours(r, c);
      }
      setFace('😮');
      return;
    }

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

  let touchTimer = null;
  let touchMoved = false;
  let ignoreNextMouseUp = false;

  function onCellTouchStart(e) {
    if (gameState === 'won' || gameState === 'lost') return;
    if (e.touches.length > 1) return;
    touchMoved = false;
    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;

    if (!board[r][c].revealed && !board[r][c].flagged) {
      board[r][c].el.classList.add('pressed');
      setFace('😮');
    }

    touchTimer = setTimeout(() => {
      if (!touchMoved && !board[r][c].revealed) {
        handleFlag(r, c);
        ignoreNextMouseUp = true; 
        if(navigator.vibrate) navigator.vibrate(50);
        board[r][c].el.classList.remove('pressed');
        setFace('😊');
      }
    }, 350);
  }

  function onCellTouchMove() {
    touchMoved = true;
    clearPressedCells();
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  }

  function onCellTouchEnd() {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  }

  function onCellMouseUp(e) {
    if (gameState === 'won' || gameState === 'lost') return;

    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;

    clearPressedCells();
    clearChordHighlight();

    if (ignoreNextMouseUp) {
      ignoreNextMouseUp = false;
      return;
    }

    if (gameState !== 'lost' && gameState !== 'won') setFace('😊');

    if (board[r][c].revealed) {
       if (board[r][c].number > 0) {
          chord(r, c);
       }
       return;
    }

    if (e.button === 0) {
      if (inputMode === 'flag') {
        handleFlag(r, c);
      } else {
        if (board[r][c].flagged || board[r][c].question) return;
        handleReveal(r, c, 0);
      }
    } 
    else if (e.button === 2) {
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
      beginner:     { time: 999, name: i18n[currentLang].anonymous },
      intermediate: { time: 999, name: i18n[currentLang].anonymous },
      expert:       { time: 999, name: i18n[currentLang].anonymous },
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
    const dStr = i18n[currentLang][diffKey];
    document.getElementById('winner-msg').textContent = i18n[currentLang].winMsg(dStr);
    
    // Auto-fill previous name if exists
    let prevName = "";
    if (bestTimes[diffKey].name !== i18n.en.anonymous && bestTimes[diffKey].name !== i18n.zh.anonymous) {
      prevName = bestTimes[diffKey].name;
    }
    document.getElementById('winner-name').value = prevName;

    showDialog('winner-dialog');

    document.getElementById('winner-ok').onclick = () => {
      const name = document.getElementById('winner-name').value.trim() || i18n[currentLang].anonymous;
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
        beginner:     { time: 999, name: i18n[currentLang].anonymous },
        intermediate: { time: 999, name: i18n[currentLang].anonymous },
        expert:       { time: 999, name: i18n[currentLang].anonymous },
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
