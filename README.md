# 💣 Minesweeper — Premium Morandi Edition | 扫雷莫兰迪典藏版

> [English](#english-documentation) | [中文说明](#chinese-documentation-中文说明)

A beautifully modernized, responsive, and mobile-friendly recreation of the classic Minesweeper game built with pure HTML, CSS, and JavaScript. Zero frameworks, zero dependencies — just three carefully crafted files.

---

## English Documentation

### ✨ New Features & Improvements

- **Premium Morandi Aesthetic**: Features a highly legible, extremely clean "Slate & Sky Blue" Morandi color palette. High contrast between unrevealed (bright white/sky) and revealed (deep slate) cells.
- **Bilingual Support (EN/ZH)**: Seamlessly toggle between language interfaces via the `[ EN | 中 ]` button in the header. Language preferences are saved automatically!
- **Auto-Fitting Smart Grid**: No more scrollbars! The game board dynamically calculates cell sizes to perfectly fit your device's screen, ensuring 100% visibility of the grid at all times up to 44px per cell.
- **Smart Portrait Rotation**: If you play on mobile (portrait orientation) and select a wide difficulty like Expert (30x16), the game intelligently rotates the board to 16x30 to maximize screen space!
- **Mobile-First "Dig / Flag" Toggle**: Flawless touch support. A hardware-like switch below the timer lets you toggle between revealing cells and placing flags with simple taps—bypassing the clunky long-press logic on smartphones.
- **Snappy 3D Click Feel**: Satisfying physics-based CSS transitions simulate the feeling of pressing down real, tactile keys.
- **Immersive Effects**: 
  - Staggered ripple/pop animations when large empty areas are flood-revealed.
  - Screen shake and cascading mine explosions on losses.
  - Lightweight CSS-based confetti showers when you win.
- **Modern Glassmorphism Modals**: Replaced the classic clunky popup windows with elegant, blurred backdrop modals for settings, custom game configs, and best times.

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

### ✨ 全新特性与改进

- **高对比度莫兰迪视觉**：采用阅读体验极佳的“Slate & Sky Blue（灰蓝/天蓝）”莫兰迪色系。极其清晰明锐的棋盘边缘，未挖开格子的“纯白高亮”与已挖开区域的“沉浸深蓝”形成完美对比。
- **中英双语无缝切换**：点击顶部菜单 `[ EN | 中 ]` 按钮可瞬间切换全站语言界面，自动记忆您的语言偏好！
- **自适应无缝缩放网格**：彻底告别滚动条！棋盘大小会通过算法严格吸附可用屏幕面积进行计算，在任何设备上都能 100% 完美铺满（单个格子最大被限制为 44px 防拉伸）。
- **竖屏智能旋转机制**：当您处于手机竖屏且游戏列数大于行数时（例如困难模式 30x16），界面会自动将其转变为 16x30 竖状展现，极其人性化。
- **手机专属【挖开/插旗】切换拨杆**：针对触摸屏长按体验极差的痛点痛下狠手！在计时器下方新增了一个物理拨杆，滑动以全局切换点击行为，手指乱点也不怕误触地雷。
- **扎实的 3D 按键触感**：精调过的物理阻尼动画，为您还原每一次按下机械键盘般干脆的微缩手感。
- **炫目的视觉特效**：
  - 点中空地时向外平滑扩散的连锁水波纹动画；
  - 踩中地雷后的屏幕震动以及以爆点为中心的递进式连锁爆炸；
  - 胜利瞬间的五彩纸片撒花（Confetti）。
- **现代毛玻璃面板**：抛弃了经典扫雷简陋灰暗的弹窗，所有选项、自定义框与历史记录排行榜均重构为了高度精细的磨砂毛玻璃半透明材质。

### 🎮 经典机制（保留且进化）

- **默认困难模式发车**：初级（9×9，10雷）、中级（16×16，40雷）、困难（16×30，99雷）。
- **自由掌控的自定义模式**：可自定义网格高度与地雷密度。
- **高级双击排雷（极速版）**：
  - 点击任何**已翻开的数字**即可高亮预览周围未揭开的方块；
  - 若周围插旗数已经满足该数字条件，再次点击数字将瞬间解开所有相邻安全块！
- **第一步永不触雷假死保护**：您的第一次点击永远是绝对安全的。
- **荣誉排行榜记录**：将您的最快速度记入本地最高成绩榜单（最高可挑战 999 秒极限）。
