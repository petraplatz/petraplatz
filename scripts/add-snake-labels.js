const fs = require("fs");

// Adds GitHub-style month and weekday labels around the snk contribution grid.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = { 1: "Mon", 3: "Wed", 5: "Fri" };
const CELL = 16;
const LEFT = 40;

const now = new Date();
const lastSunday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
lastSunday.setUTCDate(lastSunday.getUTCDate() - lastSunday.getUTCDay());

const files = [
  ["dist/github-snake.svg", "#57606a"],
  ["dist/github-snake-dark.svg", "#8b949e"],
];

for (const [file, color] of files) {
  let svg = fs.readFileSync(file, "utf8");
  const xs = [...svg.matchAll(/<rect class="c[^"]*" x="(\d+)"/g)].map((m) => +m[1]);
  const cols = Math.max(...xs.map((x) => (x - 2) / CELL)) + 1;

  const labels = [];
  let prevMonth = -1;
  let prevCol = -10;
  for (let c = 0; c < cols; c++) {
    const d = new Date(lastSunday);
    d.setUTCDate(d.getUTCDate() - (cols - 1 - c) * 7);
    const m = d.getUTCMonth();
    if (m !== prevMonth) {
      if (c - prevCol >= 3) {
        labels.push(`<text x="${c * CELL + 2}" y="-10">${MONTHS[m]}</text>`);
        prevCol = c;
      }
      prevMonth = m;
    }
  }
  for (const [row, name] of Object.entries(DAYS)) {
    labels.push(`<text x="-6" y="${row * CELL + 12}" text-anchor="end">${name}</text>`);
  }

  svg = svg.replace(/viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)" width="([\d.]+)"/, (_, x, y, w, h, width) =>
    `viewBox="${+x - LEFT} ${y} ${+w + LEFT} ${h}" width="${+width + LEFT}"`);
  svg = svg.replace(
    "</svg>",
    `<g fill="${color}" font-size="12" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">${labels.join("")}</g></svg>`,
  );
  fs.writeFileSync(file, svg);
}
