function extractFunctionBody(text) {
    let match = text.match(/function\s+\w+\s*\([^)]*\)\s*{([\s\S]*?)}/);
    return match ? match[1].trim() : "";
  }
  
  function extractColorDeclarations(text) {
    const regex = /\b(?:let|const|var)\s+(bg_color|start_color|dest_color)\s*=\s*[^;]+;/g;
    const matches = [...text.matchAll(regex)];
    return matches.map((m) => m[0]);
  }
  
  function convertToCamelCase(lines) {
    return lines.map((line) =>
      line.replace(/^(?:let|const|var)\s+(\w+)_([a-z]+)\s*=\s*/, (_, p1, p2) => {
        return `${p1}${p2[0].toUpperCase() + p2.slice(1)} = `;
      })
    );
  }
  
  function hasAllSemicolons(code) {
    return code
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trim().startsWith("//")) // skip empty and comment lines
      .every((line) => /;\s*$/.test(line));
  }
  
  function getNumDir(code) {
    const match = code.match(/\b(?:const|let|var)\s+num_dir\s*=\s*(\d+);/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }
  
  function validateDeclarations(declarations) {
    let REQUIRED_COLOR_VARS = ["bg_color", "start_color", "dest_color"];
    const declaredVars = declarations
      .map((line) => {
        const match = line.match(/\b(?:let|const|var)\s+(\w+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
  
    for (let required of REQUIRED_COLOR_VARS) {
      if (!declaredVars.includes(required)) {
        return false;
      }
    }
    return true;
  }
  
  function errorToast(e) {
    if (e) {
      console.log(e);
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
      onClick: function () {}, // Callback after click
    }).showToast();
  }
  
  let color_decs_g = ["let bg_color = color(79, 77, 68);", "let start_color = color(79, 77, 68);", "let dest_color = color(255, 255, 150);"];
  
  function compile(text) {
    // code has comments + function def, we need only the contents of the function
    let code = extractFunctionBody(text);
    let color_decs = extractColorDeclarations(text);
    try {
      let pos = createVector(1.0, 1.0);
      let testFunc = new Function("pos", code);
      testFunc(pos);
      let color_decs = extractColorDeclarations(text);
      if (!hasAllSemicolons(code)) {
        // console.log("BY")
        errorToast(null);
        return;
      }
      if (!validateDeclarations(color_decs)) {
        // console.log("HI")
        errorToast(null);
        return;
      }
      let constructedString = color_decs.join("\n");
      let testFunc2 = new Function(constructedString);
      try {
        testFunc2();
      } catch (e) {
        errorToast(e);
        return;
      }
      if (getNumDir(text) !== null) {
        num_dir = getNumDir(text);
      } else {
        num_dir = 16;
      }
      console.log(num_dir);
    } catch {
      errorToast(null);
      return;
    }
    f = new Function("pos", code);
    color_decs_g = extractColorDeclarations(text);
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
      onClick: function () {}, // Callback after click
    }).showToast();
  }
  
  function resetSketch() {
    // let colorDecs = convertToCamelCase(color_decs_g);
    // for (let i = 0; i < colorDecs.length; i++) {
    //   eval(colorDecs[i]);
    // }
    background(bgColor);
    // Reset walkers
    for (let i = 0; i < walkers.length; i++) {
      deleteWalker(walkers[i]);
    }
    for (var i = 0; i < 1000; i++) {
      walkers[i] = new Walker(createVector(Math.random() * width, Math.random() * height), 0, 0.4);
    }
  }
  
  let f = new Function("pos", "let scale = 0.01; return noise(pos.x * scale, pos.y * scale);");
  
  function sdf(pos) {
    if (!f) {
      console.log("no f");
      return 0;
    }
    if (typeof f !== "function") {
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
  // var editor = ace.edit("editor", {
  //   mode: "ace/mode/javascript",
  //   selectionStyle: "text",
  // });
  // editor.setTheme("ace/theme/monokai");
  let defaultCode = `// ctrl + s to compile (cmd + s on mac)
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
  }`;
  // editor.setValue(defaultCode, -1)
  
  // editor.commands.addCommand({
  //     name: 'compile',
  //     bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
  //     sender: 'editor|cli',
  //     exec: function(editor) {
  //         console.log("Compiling")
  //         compile(editor.getValue())
  //         resetSketch()
  //     }
  // })
  let isFullscreen = false;
  
  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      openFullscreen();
    } else {
      closeFullscreen();
    }
  }
  
  window.addEventListener("resize", () => {
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
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
    document.getElementsByTagName("nav")[0].style.display = "block";
    document.getElementById("fullscreen-button").style.top = "calc(10% + 10px)";
  }
  
  function openFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      /* Safari */
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      /* IE11 */
      document.documentElement.msRequestFullscreen();
    }
    document.getElementsByTagName("nav")[0].style.display = "none";
    document.getElementById("fullscreen-button").style.top = "10px";
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
  
  let bgColor;
  let destColor;
  let startColor;
  
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
    change_colors();
    let containerElement = document.getElementById("canvas-container");
    console.log(containerElement);
    let myCanvas = createCanvas(containerElement.clientWidth, containerElement.clientHeight);
    myCanvas.parent("canvas-container");
    for (var i = 0; i < 1000; i++) {
      walkers[i] = new Walker(createVector(Math.random() * width, Math.random() * height), 0, 0.4);
    }
    background(0)
    // bgColor = color(79, 77, 68);
    destColor = color(255, 255, 150);
    startColor = color(79, 77, 68);
  }
  
  async function get_color_pallet(seed) {
    try {
      const target = `https://www.thecolorapi.com/scheme?hex=${encodeURIComponent(seed.color)}&mode=${encodeURIComponent(seed.mode)}&count=3`;
  
      const response = await fetch(target, {
        method: "GET"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log(data);
      // find exact matches
      let colors = data.colors.map(color => color.hex.value);
      return colors;          // ← this array now actually gets returned
    } catch (err) {
      console.error("get_color_pallet error:", err);
      return [];                   // return an empty array on failure
    }
  }
  
  //mode
  // string (optional) Default: monochrome Example: analogic
  
  // Define mode by which to generate the scheme from the seed color
  
  // Choices: monochrome monochrome-dark monochrome-light analogic complement analogic-complement triad 
  // Going for oceany themes
  let seeds = [
    { color: "#002564", mode: "monochrome-light" },
    { color: "#248CC0", mode: "monochrome-dark" },
    { color: "#7AA9B3", mode: "monochrome-dark" },
    { color: "#008171", mode: "analogic" },
    { color: "#004967", mode: "analogic" },
    { color: "#003955", mode: "analogic-complement" },
    { color: "#00112C", mode: "analogic-complement" },
    { color: "#14867B", mode: "monochrome-dark" },
    { color: "#003B73", mode: "analogic" },
    { color: "#004A51", mode: "analogic" },
    { color: "#001737", mode: "monochrome-dark" },
    { color: "#519AA8", mode: "analogic" },
    { color: "#002B4F", mode: "analogic-complement" },
    { color: "#669B93", mode: "monochrome-dark" }
  ];
  
  let functions = [
    "let scale = 0.01; return noise(pos.x * scale, pos.y * scale);",
    "let scale = 0.01; return Math.sin(pos.x * scale * 5) + Math.cos(pos.y * scale * 5);",
    "let scale = 0.01; return Math.sin(pos.x * scale * 8) + Math.cos(pos.y * scale * 8) + Math.sin((pos.x + pos.y) * scale * 6);",
    "let scale = 0.01; return Math.max(Math.sin(pos.x * scale * 7), Math.cos(pos.y * scale * 9));",
    "let scale = 0.01; let len = Math.sqrt(pos.x * pos.x + pos.y * pos.y); return Math.sin(len * scale * 15);",
    "let scale = 0.01; return Math.cos(Math.atan2(pos.y, pos.x) * 6);",
    "let scale = 0.01; let len = Math.sqrt(pos.x * pos.x + pos.y * pos.y); return Math.sin(len * scale * 10) * Math.cos(Math.atan2(pos.y, pos.x) * 8);",
    "let scale = 0.01; return Math.sin(pos.x * scale * 10) * Math.sin(pos.y * scale * 10);",
    "let scale = 0.01; return Math.abs(pos.x * scale) + Math.abs(pos.y * scale);",
    "let scale = 0.01; return Math.max(Math.abs(pos.x * scale), Math.abs(pos.y * scale));",
    // "let scale = 0.01; let len = Math.sqrt(pos.x * pos.x + pos.y * pos.y); return Math.sin(Math.pow(len * scale, 2) * 20);",
    "let scale = 0.01; return Math.sin(pos.x * scale * 7) * Math.cos(pos.y * scale * 9) + Math.sin((pos.x + pos.y) * scale * 5);",
    "let scale = 0.01; let ix = Math.floor(pos.x * scale * 5); let iy = Math.floor(pos.y * scale * 5); return Math.sin((pos.x * scale * 5 - ix) * Math.PI) * Math.sin((pos.y * scale * 5 - iy) * Math.PI);",
    "let scale = 0.01; let len = Math.sqrt(pos.x * pos.x + pos.y * pos.y); return len === 0 ? 0 : Math.atan2(pos.y, pos.x) / len * scale;",
    "let scale = 0.01; return Math.sin((pos.x * scale) * (pos.y * scale) * 25);",
    // "let scale = 0.01; let len = Math.sqrt(pos.x * pos.x + pos.y * pos.y); return Math.cos(Math.pow(len * scale * 12, 0.8) * 30);",
    "let scale = 0.01; let len = Math.sqrt(pos.x * pos.x + pos.y * pos.y); return Math.sin(Math.atan2(pos.y, pos.x) * 9 + len * scale * 7);",
    "let scale = 0.01; return (pos.x * scale) * Math.sin(pos.y * scale * 18) - (pos.y * scale) * Math.cos(pos.x * scale * 18);",
    "let scale = 0.01; return Math.sin((pos.x + pos.y) * scale * 12) + Math.sin((pos.x - pos.y) * scale * 12);",
    "let scale = 0.01; let lenSq = pos.x * pos.x + pos.y * pos.y; let len = Math.sqrt(lenSq); return Math.sin(1 / (len * scale + 0.05) * 70) * len * scale * 10;",
    "let scale = 0.01; return Math.abs(Math.sin(pos.x * scale * 6 * Math.PI)) + Math.abs(Math.sin(pos.y * scale * 6 * Math.PI));",
    "let scale = 0.01; let dSq = pos.x * pos.x + pos.y * pos.y; return Math.exp(-dSq * scale * scale * 500) * (Math.sin(pos.x * scale * 20) + Math.cos(pos.y * scale * 20));",
    "let scale = 0.01; let lenSq = pos.x*pos.x + pos.y*pos.y; return (lenSq * scale * scale * 80) - 1.5;",
    "let scale = 0.01; return Math.sin(pos.x * scale * 9 + 1.5) * Math.sin(pos.y * scale * 11 + 2.5);",
    "let scale = 0.01; let len = Math.sqrt(pos.x * pos.x + pos.y * pos.y); return Math.cos(Math.atan2(pos.y, pos.x) * 7) * len * scale * 12;",
    "let scale = 0.01; return (pos.x * scale) * (pos.y * scale) * 15 + Math.sin(pos.x * scale * 25);",
    "let scale = 0.01; return Math.abs(Math.sin(pos.x * scale * 8.5)) + Math.abs(Math.sin(pos.y * scale * 12.5));",
    "let scale = 0.01; return Math.abs(pos.x * scale * 0.8 - pos.y * scale * 1.2) * 20 + Math.sin(pos.y * scale * 30);",
    "let scale = 0.01; let len = Math.sqrt(pos.x * pos.x + pos.y * pos.y); return Math.exp(-len * scale * 10) * Math.sin(Math.atan2(pos.y, pos.x) * 20);",
    "let scale = 0.01; return Math.sin(Math.pow(pos.x * scale, 2) * 15) + Math.cos(Math.pow(pos.y * scale, 2) * 15);",
    "let scale = 0.01; return Math.min(Math.sin(pos.x * scale * 18), Math.cos(pos.y * scale * 18));",
    "let scale = 0.01; return Math.max(Math.sin(pos.x * scale * 16), Math.sin(pos.y * scale * 16) * 0.9);"
  ];
  
  let currentPallete = []
  
  async function getRandomColors(i) {
    let colors = await get_color_pallet(seeds[i]);
    currentPallete = colors.slice();
    if (!colors || colors.length < 3) {
      console.warn("Not enough colors returned:", colors);
      return;
    }
    
    let brightness = getPalleteBrightness(colors);
    if (brightness < 127) {
      console.log("dark pallete");
      // If its a dark pallete, dark bg
      bgColor = color(getDarkestColor(colors));
      removeColor(colors, getDarkestColor(colors));
      startColor = color(getBrightestColor(colors));
      removeColor(colors, getBrightestColor(colors));
      destColor = color(colors[0]);
      removeIndex(colors, 0);
    } else {
      // console.log("light pallete");
      // If its a light pallete, light bg
      bgColor = color(getBrightestColor(colors));
      removeColor(colors, getBrightestColor(colors));
      startColor = color(getDarkestColor(colors));
      removeColor(colors, getDarkestColor(colors));
      destColor = color(colors[0]);
      removeIndex(colors, 0);
    }
    // console.log("bgColor", bgColor.toString());
    // console.log("startColor", startColor.toString());
    // console.log("destColor", destColor.toString());
  }
  
  function removeIndex(arr, index) {
    if (index > -1 && index < arr.length) {
      arr.splice(index, 1);
    }
  }
  
  function removeColor(pallete, color) {
    let index = pallete.indexOf(color);
    if (index !== -1) {
      pallete.splice(index, 1);
    }
    return pallete;
  }
  
  function getDarkestColor(pallete) {
    let darkestColor = pallete[0];
    let minBrightness = getBrightness(darkestColor);
    for (let i = 1; i < pallete.length; i++) {
      let c = color(pallete[i]);
      let brightness = getBrightness(c);
      if (brightness < minBrightness) {
        minBrightness = brightness;
        darkestColor = c;
      }
    }
    return darkestColor;
  }
  
  function getBrightestColor(pallete) {
    let brightestColor = pallete[0];
    let maxBrightness = getBrightness(brightestColor);
    for (let i = 1; i < pallete.length; i++) {
      let c = color(pallete[i]);
      let brightness = getBrightness(c);
      if (brightness > maxBrightness) {
        maxBrightness = brightness;
        brightestColor = c;
      }
    }
    return brightestColor;
  }
  
  function getBrightness(c) {
    let r = red(c);
    let g = green(c);
    let b = blue(c);
    return (r + g + b) / 3;
  }
  
  function getPalleteBrightness(pallete) {
    let brightness = 0;
    for (let i = 0; i < pallete.length; i++) {
      let c = color(pallete[i]);
      brightness += red(c) + green(c) + blue(c);
    }
    return brightness / pallete.length;
  }
  
  let firstLoad = true
  function draw() {
    if (firstLoad) {
      return;
    }
    noStroke();
  
    for (let i = walkers.length - 1; i >= 0; i--) {
      let walker = walkers[i];
      walker.walk();
  
      if (walkers[i] === walker) {
        let w_life = min(walker.life * 3, 255);
        fill(map(w_life, 0, 255, startColor.levels[0], destColor.levels[0]), map(w_life, 0, 255, startColor.levels[1], destColor.levels[1]), map(w_life, 0, 255, startColor.levels[2], destColor.levels[2]), map(w_life, 0, 255, startColor.levels[3], destColor.levels[3]));
        circle(walker.pos.x, walker.pos.y, 1);
      }
    }
    if (walkers.length > 1000) return;
    for (let i = 0; i < 50; i++) {
      walkers.push(new Walker(createVector(random(width), random(height)), 0, 0.4));
    }
    // for (let i = 0; i < currentPallete.length; i++) {
    //   let color = currentPallete[i];
    //   color.setAlpha(100);
    //   fill(color);
    //   rect(width - (i * 16) - 16, height - 16, 16, 16);
    // }
  }
  
  async function change_colors() {
    console.log("changing colors");
    const randomIndex = Math.floor(Math.random() * seeds.length);
    await getRandomColors(randomIndex).then(
      () => {
        fade_bg(0);
      }
    );
    if (Math.random() < 1.0) {
      let randI = Math.floor(Math.random() * functions.length);
      console.log(functions[randI]);
      f = new Function("pos", functions[randI]);
    }
    setTimeout(change_colors, 10000);
  }
  
  const step = 3.0;// Keep your original step size for how much *potential* alpha to add per frame
  const totalSteps = 255.0 / step; // Calculate the total number of steps for a full fade
  
  
  function fade_bg(i) {
    colorMode(RGB, 255);
    if (i > totalSteps) {
      firstLoad = false;
      return;
    }
    console.log(bgColor.toString());
    background(bgColor.levels[0], bgColor.levels[1], bgColor.levels[2], step);
    requestAnimationFrame(fade_bg.bind(null, i + 1));

  }
