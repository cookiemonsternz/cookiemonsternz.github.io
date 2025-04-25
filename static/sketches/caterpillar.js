function extractFunctionBody(text) {
  let match = text.match(/function\s+\w+\s*\([^)]*\)\s*{([\s\S]*?)}/);
  return match ? match[1].trim() : '';
}

function extractColorDeclarations(text) {
  const regex = /\b(?:let|const|var)\s+(bg_color|start_color|dest_color)\s*=\s*[^;]+;/g;
  const matches = [...text.matchAll(regex)];
  return matches.map(m => m[0]);
};

function convertToCamelCase(lines) {
  return lines.map(line =>
    line.replace(/^(?:let|const|var)\s+(\w+)_([a-z]+)\s*=\s*/, (_, p1, p2) => {
      return `${p1}${p2[0].toUpperCase() + p2.slice(1)} = `;
    })
  );
};

function hasAllSemicolons(code) {
  return code
    .split('\n')
    .filter(line => line.trim() !== '' && !line.trim().startsWith('//')) // skip empty and comment lines
    .every(line => /;\s*$/.test(line));
};

function getNumDir(code) {
  const match = code.match(/\b(?:const|let|var)\s+num_dir\s*=\s*(\d+);/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

function validateDeclarations(declarations) {
  let REQUIRED_COLOR_VARS = ['bg_color', 'start_color', 'dest_color'];
  const declaredVars = declarations.map(line => {
    const match = line.match(/\b(?:let|const|var)\s+(\w+)/);
    return match ? match[1] : null;
  }).filter(Boolean);

  for (let required of REQUIRED_COLOR_VARS) {
    if (!declaredVars.includes(required)) {
      return false;
    }
  }
  return true;
}

function errorToast(e) {
  if (e) {
    console.log(e)
  }
  Toastify({
    text: "Compile Failed",
    duration: 2000,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "left", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right,rgb(156, 105, 43),rgb(201, 61, 61))",
    },
    onClick: function(){} // Callback after click
  }).showToast();
}

let color_decs_g = ['let bg_color = color(79, 77, 68);', 'let start_color = color(79, 77, 68);', 'let dest_color = color(255, 255, 150);'];

function compile(text) {
  // code has comments + function def, we need only the contents of the function
  let code = extractFunctionBody(text)
  let color_decs = extractColorDeclarations(text)
  try {
    let pos = createVector(1.0, 1.0);
    let testFunc = new Function("pos", code);
    testFunc(pos);
    let color_decs = extractColorDeclarations(text)
    if (!hasAllSemicolons(code)) {
      // console.log("BY")
      errorToast(null)
      return;
    }
    if (!validateDeclarations(color_decs)) {
      // console.log("HI")
      errorToast(null)
      return;
    }
    let constructedString = color_decs.join('\n');
    let testFunc2 = new Function(constructedString);
    try {
      testFunc2();
    } catch (e) {
      errorToast(e)
      return;
    }
    if (getNumDir(text) !== null) {
      num_dir = getNumDir(text);
    } else {
      num_dir = 16;
    }
    console.log(num_dir)
  } catch {
    errorToast(null)
    return;
  }
  f = new Function("pos", code);
  color_decs_g = extractColorDeclarations(text)
  Toastify({
    text: "Compiled",
    duration: 2000,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "left", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right,rgb(45, 112, 109), #96c93d)",
    },
    onClick: function(){} // Callback after click
  }).showToast();
  
}

function resetSketch() {
  let colorDecs = convertToCamelCase(color_decs_g);
  for (let i = 0; i < colorDecs.length; i++) {
    eval(colorDecs[i]);
  }
  background(bgColor);
  // Reset walkers
  for (let i = 0; i < walkers.length; i++) {
    deleteWalker(walkers[i]);
  }
  for (var i = 0; i < 1000; i++) {
    walkers[i] = new Walker(createVector(Math.random() * width, Math.random() * height), 0, 0.4);
  }
}

let f = new Function("pos", 'let scale = 0.01; return noise(pos.x * scale, pos.y * scale);');

function sdf(pos) {
  if (!f) {
    console.log("no f");
    return 0;
  }
  if (typeof f !== 'function') {
    console.log("no f");
    return 0;
  }
  if (!pos) {
    console.log("no pos");
    return 0;
  }
  //return noise(pos.x * scale, pos.y * scale)
  return f(pos);
}

// **** ACE ****
var editor = ace.edit("editor", {
  mode: "ace/mode/javascript",
  selectionStyle: "text",
});
editor.setTheme("ace/theme/monokai");
let defaultCode = 
`// ctrl + s to compile (cmd + s on mac)
// use semicolons to end lines or else my regex breaks
// all standard js libraries are available + p5.js 
// e.g date, math, string, etc

// number of directions each walker checks
// lower number = more performance
const num_dir = 36;

let bg_color = color('#123333');
let start_color = color('#385B99');
let dest_color = color(0.0, 255.0, 128.0, 120.0);

// Pos is a p5.js vector
function sdf(pos) {
    let scale = 0.01;
    return noise(pos.x * scale, pos.y * scale);
    // return Math.sin(pos.x * scale * 5) + Math.cos(pos.y * scale * 5);
    // return Math.tan(pos.x * scale) / Math.tan(pos.y * scale);
    // return Math.max(Math.tan(pos.x * scale), Math.sin(pos.y * scale));
}`
editor.setValue(defaultCode, -1)

editor.commands.addCommand({
    name: 'compile',
    bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
    sender: 'editor|cli',
    exec: function(editor) {
        console.log("Compiling")
        compile(editor.getValue())
        resetSketch()
    }
})
let isFullscreen = false;

function toggleFullscreen() {
  isFullscreen = !isFullscreen;
  if (isFullscreen) {
    openFullscreen();
  } else {
    closeFullscreen();
  }
  
}

window.addEventListener('resize', () => {
  let containerElement = document.getElementById("canvas-container");
  resizeCanvas(containerElement.clientWidth, containerElement.clientHeight, false);
  // resetSketch();
  setTimeout(() => {
    resetSketch();
  }, 50);
});

function closeFullscreen() {
  if (document.exitFullscreen) {
      document.exitFullscreen();
  }
  else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
  }
  else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
  }
  document.getElementsByTagName("nav")[0].style.display = "block";
  document.getElementById("fullscreen-button").style.top = "calc(10% + 10px)";
  document.getElementById("editor").style.height = "90%";
  document.getElementById("editor").style.bottom = "0px";

}
function openFullscreen() {
  if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
  }
  else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
      document.documentElement.webkitRequestFullscreen();
  }
  else if (document.documentElement.msRequestFullscreen) { /* IE11 */
      document.documentElement.msRequestFullscreen();
  }
  document.getElementsByTagName("nav")[0].style.display = "none";
  document.getElementById("fullscreen-button").style.top = "10px";
  document.getElementById("editor").style.height = "100%";
  document.getElementById("editor").style.bottom = "0px";
}


class Walker {
  constructor(position, bias, jumpDist) {
    this.pos = position;
    this.bias = bias;
    this.jumpDist = jumpDist;
    this.life = 0;
  }

  getIdealNeightbour() {
    var currentHighest = -Infinity;
    var idealNeighbour = null;
    for (var i = 0; i < num_dir; i++) {
      let direction = p5.Vector.random2D();
      var x = p5.Vector.add(this.pos, p5.Vector.mult(direction, this.jumpDist));
      let val = sdf(x);
      if (val > currentHighest) {
        currentHighest = val;
        idealNeighbour = x;
        if (val === 1) break;
      }
    }
    return idealNeighbour;
  }

  walk() {
    this.life += 1;
    var idealNeighbour = this.getIdealNeightbour();
    // console.log(idealNeighbour)
    if (sdf(idealNeighbour) + this.bias >= sdf(this.pos)) {
      this.pos = idealNeighbour;
    } else {
      deleteWalker(this);
    }
  }
}

let bgColor
let destColor
let startColor

var walkers = [];
const jumpSize = 5;
var num_dir = 36;

function deleteWalker(walker) {
  let index = walkers.indexOf(walker);
  if (index !== -1) {
    walkers.splice(index, 1);
  }
}

// Monaco setup
const editorElement = document.getElementById("editor__code");

function setup() {
  let containerElement = document.getElementById("canvas-container");
  console.log(containerElement);
  let myCanvas = createCanvas(containerElement.clientWidth, containerElement.clientHeight);
  myCanvas.parent("canvas-container");
  for (var i = 0; i < 1000; i++) {
    walkers[i] = new Walker(createVector(Math.random() * width, Math.random() * height), 0, 0.4);
  }
  background(79, 77, 68);
  destColor = color(255, 255, 150);
  startColor = color(79, 77, 68);
}

function draw() {
  noStroke();

  for (let i = walkers.length - 1; i >= 0; i--) {
    let walker = walkers[i];
    walker.walk();

    if (walkers[i] === walker) {
      let w_life = min(walker.life * 3, 255)
      fill(map(w_life, 0, 255, startColor.levels[0], destColor.levels[0]), map(w_life, 0, 255, startColor.levels[1], destColor.levels[1]), map(w_life, 0, 255, startColor.levels[2], destColor.levels[2]), map(w_life, 0, 255, startColor.levels[3], destColor.levels[3]));
      circle(walker.pos.x, walker.pos.y, 1);
    }
  }
  if (walkers.length > 1000) return;
  for (let i = 0; i < 50; i++) {
    walkers.push(new Walker(createVector(random(width), random(height)), 0, 0.4));
  }
}
