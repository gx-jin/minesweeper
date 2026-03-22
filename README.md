# 💣 Minesweeper | 扫雷

> [English](#english-documentation) | [中文说明](#chinese-documentation-中文说明)

A beautifully modernized, responsive, and mobile-friendly recreation of the classic Minesweeper game built with pure HTML, CSS, and JavaScript. Zero frameworks, zero dependencies — just three carefully crafted files.

---

## English Documentation

### ✨ New Features & Improvements

### 🎮 Classic Mechanics (Preserved & Enhanced)

- **Three difficulty levels**: Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), Expert (16×30, 99 mines) — **Defaults to Expert!**
- **Custom game**: Set your own grid dimensions and mine count.
- **Advanced Chording**: 
  - Click any *revealed number* to highlight its surrounding neighbors.
  - If the number of adjacent flags matches the number, it automatically reveals the remaining safe tiles! 
- **First-Click Safety**: You will never hit a mine on your first click.
- **Best Times Tracking**: Saves your fastest completions to LocalStorage.

---

## Chinese Documentation (中文说明)

这是一个经过全面现代化重构、深度针对移动端优化，并采用纯正 HTML/CSS/JS 编写的经典扫雷游戏。真正的 0 框架、0 依赖，极致轻量（仅 3 个文件）。

### 🎮 经典机制（保留且进化）

- **默认困难模式发车**：初级（9×9，10雷）、中级（16×16，40雷）、困难（16×30，99雷）。
- **自由掌控的自定义模式**：可自定义网格高度与地雷密度。
- **高级双击排雷（极速版）**：
  - 点击任何**已翻开的数字**即可高亮预览周围未揭开的方块；
  - 若周围插旗数已经满足该数字条件，再次点击数字将瞬间解开所有相邻安全块！
- **第一步永不触雷假死保护**：您的第一次点击永远是绝对安全的。
- **荣誉排行榜记录**：将您的最快速度记入本地最高成绩榜单（最高可挑战 999 秒极限）。
