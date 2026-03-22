# 💣 Minesweeper — Classic Windows Edition

A pixel-perfect recreation of the classic Windows 95/98 Minesweeper game built with pure HTML, CSS, and JavaScript. No frameworks, no dependencies — just three files.

## Features

- **Three difficulty levels**: Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), Expert (16×30, 99 mines)
- **Custom game**: set your own grid size and mine count
- **Classic Windows UI**: authentic 3D-bevel borders, LCD counters, smiley face button
- **Full game mechanics**:
  - Left click to reveal
  - Right click to flag 🚩 → question mark ❓ → clear cycle
  - Chord reveal (both mouse buttons or middle click) when flag count matches number
  - Flood-fill auto-reveal for blank areas
  - First-click safety (no mine on first click or its neighbors)
- **Best Times** tracking with name entry (localStorage)
- **Marks (?)** toggle in menu
- **F2** keyboard shortcut to start a new game
- **Menu bar**: Game / Help menus with all classic options

## Project Structure

```
minesweeper/
├── index.html   # Game markup & dialogs
├── style.css    # Windows 95/98 pixel-art styling
├── game.js      # All game logic
└── README.md
```

## Controls

| Action | Control |
|--------|---------|
| Reveal cell | Left Click |
| Flag / Question / Clear | Right Click (cycles) |
| Chord reveal | Both Buttons or Middle Click |
| New Game | Smiley Button or F2 |

## License

MIT
