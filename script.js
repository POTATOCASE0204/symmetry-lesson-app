const canvas = document.getElementById("symmetryCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  tabs: [...document.querySelectorAll(".tab")],
  guides: document.getElementById("toggleGuides"),
  labels: document.getElementById("toggleLabels"),
  grid: document.getElementById("toggleGrid"),
  emphasis: document.getElementById("toggleEmphasis"),
  shapeButtons: document.getElementById("shapeButtons"),
  check: document.getElementById("checkAnswer"),
  reveal: document.getElementById("revealAnswer"),
  reset: document.getElementById("resetScene"),
  feedback: document.getElementById("feedbackText"),
  lessonTitle: document.getElementById("lessonTitle"),
  lessonText: document.getElementById("lessonText"),
  helpDialog: document.getElementById("helpDialog"),
  openHelp: document.getElementById("openHelp"),
  closeHelp: document.getElementById("closeHelp"),
};

const gridSize = 32;
const modelUnit = gridSize * 2;

const colors = {
  figure: "#2176ae",
  figureFill: "rgba(33, 118, 174, 0.15)",
  guess: "#d94f70",
  answer: "#2f855a",
  guide: "#d7971e",
  text: "#15202b",
  grid: "rgba(55, 97, 120, 0.16)",
  gridStrong: "rgba(55, 97, 120, 0.28)",
};

const shapeData = {
  kite: {
    name: "たこ形",
    points: [
      { x: 0, y: -3, label: "A" },
      { x: -2, y: 0, label: "B" },
      { x: 0, y: 4, label: "C" },
      { x: 2, y: 0, label: "D" },
    ],
    lineAxes: [{ p1: { x: 0, y: -4 }, p2: { x: 0, y: 5 } }],
    center: null,
    note: "折るとぴったり重なる線を探します。上下の長さが違うので、半回転しても同じ形には重なりません。",
  },
  rhombus: {
    name: "ひし形",
    points: [
      { x: 0, y: -3, label: "A" },
      { x: 2, y: 0, label: "B" },
      { x: 0, y: 3, label: "C" },
      { x: -2, y: 0, label: "D" },
    ],
    lineAxes: [
      { p1: { x: 0, y: -4 }, p2: { x: 0, y: 4 } },
      { p1: { x: -3, y: 0 }, p2: { x: 3, y: 0 } },
    ],
    center: { x: 0, y: 0 },
    note: "ひし形は線対称でも点対称でもあります。2本の対角線が対称の軸になり、交わる点が対称の中心です。",
  },
  rectangle: {
    name: "長方形",
    points: [
      { x: -3, y: -2, label: "A" },
      { x: 3, y: -2, label: "B" },
      { x: 3, y: 2, label: "C" },
      { x: -3, y: 2, label: "D" },
    ],
    lineAxes: [
      { p1: { x: 0, y: -3 }, p2: { x: 0, y: 3 } },
      { p1: { x: -4, y: 0 }, p2: { x: 4, y: 0 } },
    ],
    center: { x: 0, y: 0 },
    note: "長方形は線対称でも点対称でもあります。対角線の交わるところが対称の中心です。",
  },
  square: {
    name: "正方形",
    points: [
      { x: -2, y: -2, label: "A" },
      { x: 2, y: -2, label: "B" },
      { x: 2, y: 2, label: "C" },
      { x: -2, y: 2, label: "D" },
    ],
    lineAxes: [
      { p1: { x: 0, y: -3 }, p2: { x: 0, y: 3 } },
      { p1: { x: -3, y: 0 }, p2: { x: 3, y: 0 } },
      { p1: { x: -3, y: -3 }, p2: { x: 3, y: 3 } },
      { p1: { x: -3, y: 3 }, p2: { x: 3, y: -3 } },
    ],
    center: { x: 0, y: 0 },
    note: "正方形は対称の軸が4本あります。点対称の中心は4本の軸が集まる点です。",
  },
  parallelogram: {
    name: "平行四辺形",
    points: [
      { x: -3, y: -2, label: "A" },
      { x: 2, y: -2, label: "B" },
      { x: 3, y: 2, label: "C" },
      { x: -2, y: 2, label: "D" },
    ],
    lineAxes: [],
    center: { x: 0, y: 0 },
    note: "平行四辺形はふつう線対称ではありませんが、点対称です。対角線の交わるところに注目します。",
  },
  isosceles: {
    name: "二等辺三角形",
    points: [
      { x: 0, y: -3, label: "A" },
      { x: 3, y: 2, label: "B" },
      { x: -3, y: 2, label: "C" },
    ],
    lineAxes: [{ p1: { x: 0, y: -4 }, p2: { x: 0, y: 3 } }],
    center: null,
    note: "二等辺三角形は、頂点と向かい側の辺の真ん中を結ぶ線が対称の軸になります。",
  },
};

const state = {
  mode: "line",
  shapeId: "kite",
  showGuides: true,
  showLabels: true,
  showGrid: true,
  emphasize: true,
  showAnswer: false,
  dragging: null,
  pointerStart: null,
  guessLine: {
    p1: { x: 0, y: -4 },
    p2: { x: 0, y: 4 },
  },
  guessCenter: { x: 1, y: 0 },
};

const lessons = {
  line: {
    title: "線対称の見どころ",
    text:
      "1つの図形を折ったとき、両側がぴったり重なる線が対称の軸です。まずは図形の真ん中を通りそうな線を予想します。",
    feedback: "線の端を動かして、対称の軸を予想します。",
  },
  point: {
    title: "点対称の見どころ",
    text:
      "図形をある点のまわりに半回転させたとき、もとの図形とぴったり重なる点が対称の中心です。",
    feedback: "赤い中心を動かして、対称の中心を予想します。",
  },
};

function canvasSize() {
  const rect = canvas.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function origin() {
  const { width, height } = canvasSize();
  return {
    x: Math.round((width * 0.5) / gridSize) * gridSize,
    y: Math.round((height * 0.52) / gridSize) * gridSize,
  };
}

function toScreen(point) {
  const o = origin();
  return { x: o.x + point.x * modelUnit, y: o.y + point.y * modelUnit };
}

function toModel(point) {
  const o = origin();
  return { x: (point.x - o.x) / modelUnit, y: (point.y - o.y) / modelUnit };
}

function snapModel(point) {
  return {
    x: Math.round(point.x * 2) / 2,
    y: Math.round(point.y * 2) / 2,
  };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw();
}

function currentShape() {
  return shapeData[state.shapeId];
}

function drawGrid(width, height) {
  if (!state.showGrid) return;

  ctx.save();
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.strokeStyle = x % (gridSize * 5) === 0 ? colors.gridStrong : colors.grid;
    ctx.lineWidth = x % (gridSize * 5) === 0 ? 1.4 : 1;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.strokeStyle = y % (gridSize * 5) === 0 ? colors.gridStrong : colors.grid;
    ctx.lineWidth = y % (gridSize * 5) === 0 ? 1.4 : 1;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFigure(shape) {
  const points = shape.points.map(toScreen);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fillStyle = colors.figureFill;
  ctx.strokeStyle = colors.figure;
  ctx.lineWidth = 5;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  points.forEach((point, index) => drawPoint(point, shape.points[index].label, colors.figure));
}

function drawPoint(point, label, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(point.x, point.y, 11, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();

  if (state.showLabels) {
    ctx.fillStyle = colors.text;
    ctx.font = "800 18px Yu Gothic UI, Meiryo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, point.x, point.y - 28);
  }
  ctx.restore();
}

function drawLine(line, color, label, dashed = false) {
  const a = toScreen(line.p1);
  const b = toScreen(line.p2);
  const extended = extendLineToCanvas(a, b);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = color === colors.answer && state.emphasize ? 6 : 4;
  ctx.lineCap = "round";
  if (dashed) ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(extended.p1.x, extended.p1.y);
  ctx.lineTo(extended.p2.x, extended.p2.y);
  ctx.stroke();
  ctx.restore();

  if (label) drawBadge((a.x + b.x) / 2, (a.y + b.y) / 2 - 30, label, color);
}

function drawCenter(point, color, label) {
  const p = toScreen(point);
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, color === colors.answer && state.emphasize ? 17 : 14, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(p.x - 22, p.y);
  ctx.lineTo(p.x + 22, p.y);
  ctx.moveTo(p.x, p.y - 22);
  ctx.lineTo(p.x, p.y + 22);
  ctx.stroke();
  ctx.restore();

  if (label) drawBadge(p.x, p.y - 34, label, color);
}

function drawHandles() {
  if (state.mode !== "line") return;
  [state.guessLine.p1, state.guessLine.p2].forEach((point) => {
    const p = toScreen(point);
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
    ctx.fillStyle = colors.guess;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

function drawGuides(shape) {
  if (!state.showGuides) return;

  ctx.save();
  ctx.strokeStyle = colors.guide;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 8]);

  if (state.mode === "line") {
    shape.lineAxes.forEach((axis) => {
      shape.points.forEach((point) => {
        const reflected = reflectPointAcrossLine(point, axis.p1, axis.p2);
        const match = shape.points.find((candidate) => distance(candidate, reflected) < 0.08);
        if (match && point.label < match.label) {
          drawGuideSegment(point, match);
        }
      });
    });
  } else if (shape.center) {
    shape.points.forEach((point) => {
      const opposite = {
        x: shape.center.x * 2 - point.x,
        y: shape.center.y * 2 - point.y,
      };
      const match = shape.points.find((candidate) => distance(candidate, opposite) < 0.08);
      if (match && point.label < match.label) {
        drawGuideSegment(point, match);
      }
    });
  }

  ctx.restore();
}

function drawGuideSegment(aModel, bModel) {
  const a = toScreen(aModel);
  const b = toScreen(bModel);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawBadge(x, y, text, color) {
  ctx.save();
  ctx.font = "800 16px Yu Gothic UI, Meiryo, sans-serif";
  const width = ctx.measureText(text).width + 22;
  const px = Math.min(Math.max(x - width / 2, 12), canvasSize().width - width - 12);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  roundRect(px, y - 15, width, 30, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, px + width / 2, y);
  ctx.restore();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function extendLineToCanvas(a, b) {
  const { width, height } = canvasSize();
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const far = Math.max(width, height) * 1.4;
  return {
    p1: { x: mid.x - ux * far, y: mid.y - uy * far },
    p2: { x: mid.x + ux * far, y: mid.y + uy * far },
  };
}

function draw() {
  const { width, height } = canvasSize();
  const shape = currentShape();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfdfb";
  ctx.fillRect(0, 0, width, height);

  drawGrid(width, height);
  drawGuides(shape);
  drawFigure(shape);

  if (state.mode === "line") {
    drawLine(state.guessLine, colors.guess, "予想した軸", true);
    drawHandles();
    if (state.showAnswer) {
      shape.lineAxes.forEach((axis, index) => drawLine(axis, colors.answer, `答え${index + 1}`));
      if (shape.lineAxes.length === 0) drawNoAnswer("対称の軸はありません");
    }
  } else {
    drawCenter(state.guessCenter, colors.guess, "予想した中心");
    if (state.showAnswer) {
      if (shape.center) drawCenter(shape.center, colors.answer, "答え");
      else drawNoAnswer("対称の中心はありません");
    }
  }
}

function drawNoAnswer(text) {
  const { width } = canvasSize();
  drawBadge(width / 2, 54, text, colors.answer);
}

function reflectPointAcrossLine(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq;
  const foot = { x: a.x + t * dx, y: a.y + t * dy };
  return { x: 2 * foot.x - point.x, y: 2 * foot.y - point.y };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getPointer(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function hitTest(pointer) {
  const model = toModel(pointer);

  if (state.mode === "line") {
    const p1 = toScreen(state.guessLine.p1);
    const p2 = toScreen(state.guessLine.p2);
    if (distance(pointer, p1) < 24) return { type: "lineHandle", key: "p1" };
    if (distance(pointer, p2) < 24) return { type: "lineHandle", key: "p2" };
    if (pointToLineDistance(pointer, p1, p2) < 18) return { type: "lineMove", start: model };
  }

  if (state.mode === "point" && distance(pointer, toScreen(state.guessCenter)) < 28) {
    return { type: "center" };
  }

  return null;
}

function pointToLineDistance(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  return Math.abs(dy * point.x - dx * point.y + b.x * a.y - b.y * a.x) / length;
}

function updateDrag(pointer) {
  const model = snapModel(toModel(pointer));
  const target = state.dragging;
  if (!target) return;

  if (target.type === "lineHandle") {
    state.guessLine[target.key] = clampModel(model);
  }

  if (target.type === "lineMove") {
    const dx = model.x - target.start.x;
    const dy = model.y - target.start.y;
    state.guessLine.p1 = clampModel(snapModel({ x: state.guessLine.p1.x + dx, y: state.guessLine.p1.y + dy }));
    state.guessLine.p2 = clampModel(snapModel({ x: state.guessLine.p2.x + dx, y: state.guessLine.p2.y + dy }));
    target.start = model;
  }

  if (target.type === "center") {
    state.guessCenter = clampModel(model);
  }

  draw();
}

function moveGuessTo(pointer) {
  const model = clampModel(snapModel(toModel(pointer)));

  if (state.mode === "line") {
    const mid = {
      x: (state.guessLine.p1.x + state.guessLine.p2.x) / 2,
      y: (state.guessLine.p1.y + state.guessLine.p2.y) / 2,
    };
    const dx = model.x - mid.x;
    const dy = model.y - mid.y;
    state.guessLine.p1 = clampModel(snapModel({ x: state.guessLine.p1.x + dx, y: state.guessLine.p1.y + dy }));
    state.guessLine.p2 = clampModel(snapModel({ x: state.guessLine.p2.x + dx, y: state.guessLine.p2.y + dy }));
  } else {
    state.guessCenter = model;
  }

  draw();
}

function clampModel(point) {
  return {
    x: Math.min(Math.max(point.x, -5), 5),
    y: Math.min(Math.max(point.y, -4), 4),
  };
}

function checkAnswer() {
  const shape = currentShape();
  if (state.mode === "line") {
    if (shape.lineAxes.length === 0) {
      ui.feedback.textContent = "この図形には対称の軸がありません。答えを表示して確認しましょう。";
      return;
    }

    const matched = shape.lineAxes.some((axis) => sameLine(state.guessLine, axis));
    ui.feedback.textContent = matched
      ? "よい予想です。折ると左右がぴったり重なります。"
      : "まだずれています。線が図形を同じ形の2つに分けるか見てみましょう。";
  } else {
    if (!shape.center) {
      ui.feedback.textContent = "この図形には対称の中心がありません。半回転しても重なりません。";
      return;
    }

    const matched = distance(state.guessCenter, shape.center) < 0.1;
    ui.feedback.textContent = matched
      ? "よい予想です。半回転すると同じ図形に重なります。"
      : "まだずれています。対応する点どうしを結んだ線が集まる場所を探しましょう。";
  }
}

function sameLine(a, b) {
  const va = { x: a.p2.x - a.p1.x, y: a.p2.y - a.p1.y };
  const vb = { x: b.p2.x - b.p1.x, y: b.p2.y - b.p1.y };
  const cross = Math.abs(va.x * vb.y - va.y * vb.x);
  const lengths = Math.hypot(va.x, va.y) * Math.hypot(vb.x, vb.y) || 1;
  const angleClose = cross / lengths < 0.08;
  const distanceClose = pointToLineDistanceModel(a.p1, b.p1, b.p2) < 0.12;
  return angleClose && distanceClose;
}

function pointToLineDistanceModel(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  return Math.abs(dy * point.x - dx * point.y + b.x * a.y - b.y * a.x) / length;
}

function resetGuess() {
  state.showAnswer = false;
  ui.reveal.setAttribute("aria-pressed", "false");
  if (state.mode === "line") {
    state.guessLine = {
      p1: { x: 0, y: -4 },
      p2: { x: 0, y: 4 },
    };
  } else {
    state.guessCenter = { x: 1, y: 0 };
  }
  ui.feedback.textContent = lessons[state.mode].feedback;
  draw();
}

function setMode(mode) {
  state.mode = mode;
  ui.tabs.forEach((item) => {
    const active = item.dataset.mode === mode;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  });
  ui.lessonTitle.textContent = lessons[mode].title;
  ui.lessonText.textContent = lessons[mode].text;
  resetGuess();
}

function setShape(shapeId) {
  state.shapeId = shapeId;
  [...ui.shapeButtons.querySelectorAll("button")].forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.shape === shapeId));
  });
  ui.lessonText.textContent = currentShape().note;
  resetGuess();
}

function renderShapeButtons() {
  ui.shapeButtons.innerHTML = "";
  Object.entries(shapeData).forEach(([id, shape]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.shape = id;
    button.textContent = shape.name;
    button.setAttribute("aria-pressed", String(id === state.shapeId));
    button.addEventListener("click", () => setShape(id));
    ui.shapeButtons.appendChild(button);
  });
}

canvas.addEventListener("pointerdown", (event) => {
  const pointer = getPointer(event);
  const target = hitTest(pointer);
  state.pointerStart = pointer;
  if (!target) return;
  if (target.start) target.start = snapModel(target.start);
  state.dragging = target;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.dragging) return;
  updateDrag(getPointer(event));
});

canvas.addEventListener("pointerup", (event) => {
  const pointer = getPointer(event);
  const moved = state.pointerStart && distance(pointer, state.pointerStart) > 6;
  if (!state.dragging && !moved) {
    moveGuessTo(pointer);
  }
  state.dragging = null;
  state.pointerStart = null;
  canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener("pointercancel", () => {
  state.dragging = null;
  state.pointerStart = null;
});

ui.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

[
  [ui.guides, "showGuides"],
  [ui.labels, "showLabels"],
  [ui.grid, "showGrid"],
  [ui.emphasis, "emphasize"],
].forEach(([control, key]) => {
  control.addEventListener("change", () => {
    state[key] = control.checked;
    draw();
  });
});

ui.check.addEventListener("click", checkAnswer);
ui.reveal.addEventListener("click", () => {
  state.showAnswer = !state.showAnswer;
  ui.reveal.setAttribute("aria-pressed", String(state.showAnswer));
  draw();
});
ui.reset.addEventListener("click", resetGuess);
ui.openHelp.addEventListener("click", () => ui.helpDialog.showModal());
ui.closeHelp.addEventListener("click", () => ui.helpDialog.close());
ui.helpDialog.addEventListener("click", (event) => {
  if (event.target === ui.helpDialog) ui.helpDialog.close();
});
window.addEventListener("resize", resizeCanvas);

renderShapeButtons();
resizeCanvas();
setMode("line");
