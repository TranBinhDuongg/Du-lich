const journey = document.getElementById("journey");
const dialog = document.getElementById("chat-dialog");
const menu = document.getElementById("journey-menu");
const menuButton = document.querySelector(".menu-button");
const progress = document.querySelector(".progress");
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const scrollBehavior = () =>
  prefersReducedMotion.matches ? "instant" : "smooth";
let previousFocus;
function openChat() {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  dialog.showModal();
  document.getElementById("chat-input").focus();
}
function closeChat() {
  dialog.close();
}
document
  .querySelectorAll("[data-open-chat], [data-prompt]")
  .forEach((button) => button.addEventListener("click", openChat));
document.querySelector(".close-chat").addEventListener("click", closeChat);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      closeChat();
  }
});
dialog.addEventListener("close", () =>
  previousFocus?.focus({ preventScroll: true }),
);
menuButton.addEventListener("click", () => {
  menu.hidden = !menu.hidden;
  menuButton.setAttribute("aria-expanded", String(!menu.hidden));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) {
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }
});
document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener("click", (event) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;
    event.preventDefault();
    journey.scrollTo({ left: section.offsetLeft, behavior: scrollBehavior() });
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  }),
);
const move = (direction) =>
  journey.scrollBy({
    left: direction * journey.clientWidth * 0.75,
    behavior: scrollBehavior(),
  });
document.getElementById("previous").addEventListener("click", () => move(-1));
document.getElementById("next").addEventListener("click", () => move(1));
journey.addEventListener("keydown", (event) => {
  if (event.target !== journey) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
  }
});
journey.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
      return;
    event.preventDefault();
    journey.scrollLeft +=
      event.deltaY *
      (event.deltaMode === 1
        ? 20
        : event.deltaMode === 2
          ? journey.clientWidth
          : 1);
  },
  { passive: false },
);
let drag;
journey.addEventListener("pointerdown", (event) => {
  if (
    event.pointerType !== "mouse" ||
    event.button !== 0 ||
    event.target.closest("button,a,input")
  )
    return;
  drag = { x: event.clientX, scroll: journey.scrollLeft, id: event.pointerId };
  journey.setPointerCapture(event.pointerId);
  journey.classList.add("dragging");
});
journey.addEventListener("pointermove", (event) => {
  if (drag) journey.scrollLeft = drag.scroll - (event.clientX - drag.x);
});
function stopDrag() {
  drag = null;
  journey.classList.remove("dragging");
}
journey.addEventListener("pointerup", stopDrag);
journey.addEventListener("pointercancel", stopDrag);
journey.addEventListener("lostpointercapture", stopDrag);
function updateProgress() {
  const max = journey.scrollWidth - journey.clientWidth;
  const amount = max > 0 ? journey.scrollLeft / max : 0;
  progress.firstElementChild.style.width = `${amount * 100}%`;
  progress.setAttribute("aria-valuenow", String(Math.round(amount * 100)));
  document.getElementById("previous").disabled = journey.scrollLeft < 2;
  document.getElementById("next").disabled = journey.scrollLeft >= max - 2;
}
journey.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
document.querySelectorAll("[data-hotel]").forEach((button) =>
  button.addEventListener("click", () => {
    const image = document.getElementById(button.dataset.hotel);
    image.src = button.dataset.image;
    image.alt = `${button.textContent} — lưu trú tham khảo`;
    button.parentElement.querySelectorAll("button").forEach((option) => {
      option.classList.toggle("selected", option === button);
      option.setAttribute("aria-pressed", String(option === button));
    });
  }),
);

/* Homepage transitions inspired by Travelshift. No external animation libraries. */
(() => {
  "use strict";
  const home = document.getElementById("home-experience");
  if (!home) return;
  const art = home.querySelector(".home-art");
  const canvas = document.getElementById("home-canvas");
  const fallback = document.getElementById("home-fallback");
  const title = document.getElementById("home-title");
  const status = document.getElementById("home-status");
  const footer = document.querySelector(".journey-footer");
  const scenes = [
    {
      name: "Hạ Long",
      image: "assets/images/Vinh-ha-long.jpg",
      bg: "#0a3d4a",
      ink: "#b2ebf2",
      baseline: "Ngàn đảo, một kỳ quan.",
      description:
        "Vươn ra biển giữa những đảo đá.<br>Cảnh đẹp còn đó, hành trình đang chờ.",
    },
    {
      name: "Bản Giốc",
      image: "assets/images/ban-giuoc.jpg",
      bg: "#254b41",
      ink: "#e1efc8",
      baseline: "Thác nước giữa núi rừng.",
      description: "Thác nước giữa núi rừng.",
    },
    {
      name: "Mã Pí Lèng",
      image: "assets/images/ma-pi-leng.jpg",
      bg: "#354b42",
      ink: "#e7e7ce",
      baseline: "Qua miền cao nguyên đá.",
      description: "Qua miền cao nguyên đá.",
    },
    {
      name: "Hội An",
      image: "assets/images/hoi-an.png",
      bg: "#765126",
      ink: "#ffe0b2",
      baseline: "Một nhịp sống bên phố cổ.",
      description: "Một nhịp sống bên phố cổ.",
    },
    {
      name: "Cầu Vàng",
      image: "assets/images/Cau-vang.png",
      bg: "#355a55",
      ink: "#e2efce",
      baseline: "Dạo bước giữa mây trời.",
      description: "Dạo bước giữa mây trời.",
    },
    {
      name: "Lý Sơn",
      image: "assets/images/Ly-son.png",
      bg: "#174d63",
      ink: "#c7e9e9",
      baseline: "Biển xanh và dấu tích núi lửa.",
      description: "Biển xanh và dấu tích núi lửa.",
    },
  ];
  let current = 0,
    desired = 0,
    busy = false,
    sequence = 0,
    active = true;
  let transition = null,
    frame = 0,
    last = 0,
    wheelTotal = 0,
    wheelTime = 0,
    lastSwitch = 0;
  let drag = null,
    pointer = [0, 0],
    smoothPointer = [0, 0],
    gesture = 0;
  // Hold deformation is driven by the original Quart timeline.
  let disposed = false;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const dotBar = home.querySelector('.home-dots');
  dotBar.replaceChildren(...scenes.map((scene, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.slide = index;
    button.setAttribute('aria-label', scene.name);
    button.setAttribute('aria-pressed', String(index === 0));
    const label = document.createElement('span');
    label.textContent = String(index + 1).padStart(2, '0');
    button.append(label);
    return button;
  }));
  dotBar.style.setProperty('--dot-edge', (50 / scenes.length) + '%');
  const dots = Array.from(dotBar.querySelectorAll('[data-slide]'));
  const images = scenes.map((scene) => {
    const img = new Image();
    const ready = new Promise((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
    img.src =
      (location.protocol === "file:" && window.TRIPMATE_TEXTURES && window.TRIPMATE_TEXTURES[scene.image]) ||
      scene.image;
    return { img, ready, texture: null };
  });
  let gl = null,
    program,
    buffer,
    uniforms;
  function shader(type, source) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw Error("Shader compilation failed: " + info);
    }
    return sh;
  }
  // Original Travelshift shader; only framework declarations and center division guard added.
  const ORIGINAL_VERTEX =
    "attribute vec3 position;\nattribute vec2 uv;\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\n\n#ifdef GL_ES\nprecision highp float;\n#define GLSLIFY 1\n#endif\n\n#define M_PI 3.1415926535897932384626433832795\n\nuniform float deformation;\nuniform float percentVisible;\n\nvarying float vDeformation;\nvarying vec2 vUv;\n\n// varying float MASK_SHAPE_INDEX;\n// varying float MASK_SCALE;\n// varying float MASK_BLUR_DISABLED;\n\nfloat getDist(vec2 p1, vec2 p2)\n{\n\treturn sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));\n}\n\nvoid main()\n{\n\t//// default\n\t// MASK_SHAPE_INDEX = -1.;\n\t// MASK_SCALE = -1.;\n\t// MASK_BLUR_DISABLED = 0.;\n\n\t//// debug\n\t// MASK_SHAPE_INDEX = 3.;\n\t// MASK_SCALE = .5;\n\t// MASK_BLUR_DISABLED = 1.;\n\n\tvUv = uv;\n\tvDeformation = deformation;\n\t\n\t//// debug\n\t// if (MASK_SCALE != -1.) vDeformation = 1.;\n\n\tif (percentVisible <= 0. || percentVisible >= 2.) {\n\t\tvec3 p = position;\n\t\tp.z -= 1000.;\n\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);\n\t\treturn;\n\t}\n\n\tfloat coef = 400.;\n\tfloat dist = getDist(uv, vec2(.5, .5));\n\n\tfloat offsetZ = abs(dist * dist * coef / 1. * vDeformation);\n\toffsetZ -= abs((1. - dist * dist) * coef / 5. * vDeformation);\n\t\n\tvec3 p = position;\n\tp.z += offsetZ;\n\t\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);\n}";
  const ORIGINAL_FRAGMENT =
    "\n#ifdef GL_ES\nprecision highp float;\n#define GLSLIFY 1\n#endif\n\n#define M_PI 3.1415926535897932384626433832795\n\nuniform float deformation;\nuniform vec2 resolution;\nuniform float percentVisible;\nuniform float time;\nuniform float shapeIndex;\n\nuniform sampler2D texture;\nuniform vec2 texture_size;\nuniform vec2 texture_imageSize;\nuniform float texture_focusY;\nuniform float texture_alpha;\nuniform float texture_rotation;\n\nvarying vec2 vUv;\nvarying float vDeformation;\n\n// varying float MASK_SCALE;\n// varying float MASK_SHAPE_INDEX;\n// varying float MASK_BLUR_DISABLED;\n\nvec2 getTextureCoverUv(vec2 baseUv, vec2 resolution, vec2 textureSize, vec2 imageSize)\n{\n\tfloat ratio = resolution.x / resolution.y;\n\tfloat textureRatio = imageSize.x / imageSize.y;\n\tvec2 scale = vec2(1.0, 1.0);\n\tif (textureRatio >= ratio) scale.x = textureRatio / ratio;\n\tif (textureRatio < ratio) scale.y = ratio / textureRatio;\n\tscale.x *= textureSize.x / imageSize.x;\n\n\tvec2 offset = vec2((scale.x - 1.0) * 0.5, (scale.y - 1.0) * texture_focusY);\n\tvec2 uv = (offset + baseUv) * vec2(1.0 / scale.x, 1.0 / scale.y);\n\treturn uv;\n}\n\nfloat getDist(vec2 p1, vec2 p2)\n{\n\treturn sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));\n}\n\nvec4 applyBlur(sampler2D texture, vec2 uv, float coef)\n{\n\tvec2 velocity = vec2(0.6, 0.);\n\tvec4 finalColor = vec4(0.);\n\tvec2 offset = vec2(0.);\n\tfloat dist = getDist(uv, vec2(0.5, 0.5));\n\tconst int samples = 20;\n\tfor(int i = 0; i < samples; i++)\n\t{\n\t\toffset = coef * velocity * (float(i) / (float(samples) - 1.) - .5) * dist * dist * dist;\n\t\tvec4 c = texture2D(texture, uv + offset);\n\t\tfinalColor += c;\n\t}\n\tfinalColor /= float(samples);\n\treturn finalColor;\n}\n\nvec2 rotateUv(vec2 uv, vec2 pivot, float rotation) {\n\tfloat cosa = cos(rotation);\n\tfloat sina = sin(rotation);\n\tuv -= pivot;\n\treturn vec2(\n\t\tcosa * uv.x - sina * uv.y,\n\t\tcosa * uv.y + sina * uv.x \n\t) + pivot;\n}\n\nvec2 scaleUv(vec2 uv, vec2 scale) {\n\tvec2 signedUv = 2. * uv - 1.;\n\tvec2 scaleUv = signedUv / scale;\n\treturn (scaleUv + 1.) / 2.;\n}\n\nfloat random(vec2 st) {\n    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);\n}\n\nfloat quarticIn(float t) {\n\treturn pow(t, 4.0);\n}\nfloat quarticInOut(float t) {\n\treturn t < 0.5\n\t\t? +8.0 * pow(t, 4.0)\n\t\t: -8.0 * pow(t - 1.0, 4.0) + 1.0;\n}\nfloat quadraticIn(float t) {\n\treturn t * t;\n}\nfloat exponentialIn(float t) {\n\treturn t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));\n}\nfloat exponentialInOut(float t) {\n\treturn t == 0.0 || t == 1.0\n\t\t? t\n\t\t: t < 0.5\n\t\t\t? +0.5 * pow(2.0, (20.0 * t) - 10.0)\n\t\t\t: -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;\n}\n\nfloat getStepCoefCompute(float i, float offset, float gp, float steps)\n{\n\tfloat sp = 1. / steps;\n\treturn offset * (.5 + .5 * sin(-0.5 * M_PI + (2. * M_PI) * (max(0., min(sp * 2., gp - sp * (i - .5))) / (sp * 2.))));\n}\n\nfloat getStepCoef(float i, float offset, float gp, float steps)\n{\n\tfloat coef = 0.;\n\tfloat sp = 1. / steps;\n\tif (i == 0. && gp > gp - sp && gp <= 1.) {\n\t\tcoef += getStepCoefCompute(steps, offset, gp, steps);\n\t}\n\tif (i == steps - 1. && gp >= 0. && gp < sp * .5) {\n\t\tcoef += getStepCoefCompute(0., offset, gp + sp * 1., steps);\n\t}\n\tcoef += getStepCoefCompute(i, offset, gp, steps);\n\treturn coef;\n}\n\nfloat transitionToCenter(vec2 uv, float ratio, float pct, float deformation)\n{\n\tif (pct < 0.) return 0.;\n\telse if (pct > 1.) return 1.;\n\n\tfloat _pct = pow(pct, 1.5);\n\n\t// float _ratio_screen = 0.75;\n\t// vec2 scale_dist = ratio > 1. ? vec2(1., ratio * _ratio_screen) : vec2(1. / ratio * _ratio_screen, 1.);\n\tvec2 scale_dist = vec2(1., 1.);\n\n\tscale_dist *= 1.3;\n\n\tvec2 uv_dist = scaleUv(uv, scale_dist);\n\tvec2 uv_signed = 2. * uv_dist - 1.;\n\tfloat dist = getDist(uv_dist, vec2(.5, .5));\n\tfloat coef;\n\n\tfloat dist_2 = sqrt(pow(uv_signed.x, 2.) + pow(uv_signed.y, 2.));\n\n\tfloat radius = (1. - _pct) * (1. + (1. - deformation));\n\tfloat x = uv_signed.x;\n\tfloat y = - uv_signed.y;\n\n\tfloat angle = acos(clamp(x / max(dist_2, 0.00001), -1., 1.));\n\tif (y < 0.) angle = M_PI + M_PI - angle;\n\tfloat angle_pct = angle / (M_PI * 2.);\n\n\tfloat _coef = 1.;\n\t_coef *= deformation;\n\n\tfloat _steps = 8.;\n\tfloat _step_pct = 1. / _steps;\n\tfloat _step_rad = (M_PI * 2.) / _steps;\n\n\tfloat _offsets[ 8 ];\n\tfloat _shapeIndex = shapeIndex;\n\tfloat speed;\n\n\t// if (MASK_SHAPE_INDEX != -1.) _shapeIndex = MASK_SHAPE_INDEX;\n\n\t/** v2 **\n\t\n\tfloat blur = 0.2;\n\tif (MASK_BLUR_DISABLED == 1.) blur = 0.;\n\n\tspeed = - _pct * 3.;\n\n\tif (_shapeIndex == 0.) {\n\t\t_offsets[0] =  3.0 + speed * 2.;\n\t\t_offsets[1] =  1.0 + speed * 1.;\n\t\t_offsets[2] =  2.0 + speed * 2.;\n\t\t_offsets[3] = -1.0 + speed * 0.;\n\t\t_offsets[4] =  3.0 + speed * 2.;\n\t\t_offsets[5] =  1.0 + speed * 1.;\n\t\t_offsets[6] =  4.0 + speed * 2.;\n\t\t_offsets[7] =  1.0 + speed * 1.;\n\t}\n\telse if (_shapeIndex == 1.) {\n\t\t_offsets[0] =  2.0 + speed * 2.;\n\t\t_offsets[1] =  1.0 + speed * .5;\n\t\t_offsets[2] =  3.0 + speed * 2.;\n\t\t_offsets[3] =  1.0 + speed * 1.;\n\t\t_offsets[4] =  2.0 + speed * 1.;\n\t\t_offsets[5] = -1.0 + speed * .0;\n\t\t_offsets[6] =  1.0 + speed * 1.;\n\t\t_offsets[7] =  3.0 + speed * 2.;\n\t}\n\telse if (_shapeIndex == 2.) {\n\t\t_offsets[0] =  2.0 + speed * 2.;\n\t\t_offsets[1] =  1.0 + speed * .5;\n\t\t_offsets[2] =  1.5 + speed * .5;\n\t\t_offsets[3] =  2.0 + speed * 2.;\n\t\t_offsets[4] =  1.0 + speed * 1.;\n\t\t_offsets[5] =  0.0 + speed * 2.;\n\t\t_offsets[6] =  2.0 + speed * 1.;\n\t\t_offsets[7] =  0.0 + speed * .5;\n\t}\n\telse {\n\t\t_offsets[0] =  0.0 + speed * 1.;\n\t\t_offsets[1] = -0.5 + speed * 0.;\n\t\t_offsets[2] =  1.0 + speed * 1.;\n\t\t_offsets[3] =  2.0 + speed * 2.;\n\t\t_offsets[4] =  1.0 + speed * .5;\n\t\t_offsets[5] =  2.0 + speed * 1.;\n\t\t_offsets[6] =  3.0 + speed * 2.;\n\t\t_offsets[7] =  0.2 + speed * 1.;\n\t}\n\n\t_coef = 0.;\n\n\t_coef += getStepCoef(0., _offsets[0], angle_pct, _steps);\n\t_coef += getStepCoef(1., _offsets[1], angle_pct, _steps);\n\t_coef += getStepCoef(2., _offsets[2], angle_pct, _steps);\n\t_coef += getStepCoef(3., _offsets[3], angle_pct, _steps);\n\t_coef += getStepCoef(4., _offsets[4], angle_pct, _steps);\n\t_coef += getStepCoef(5., _offsets[5], angle_pct, _steps);\n\t_coef += getStepCoef(6., _offsets[6], angle_pct, _steps);\n\t_coef += getStepCoef(7., _offsets[7], angle_pct, _steps);\n\n\t_coef *= .15;\n\t// _coef += time * .01;\n\t// _coef = sin(M_PI * _coef) * .5 * radius;\n\t\n\tfloat pctMin = .0;\n\tif (_pct > pctMin) _coef *= max(0., 1. - ((_pct - pctMin) / (1. - pctMin) * 1.5));\n\n\tif (_pct < .5) _coef *= deformation;\n\n\tfloat minCoef = - radius * 0.6;\n\tif (_coef < minCoef) _coef = minCoef;\n\n\tradius += _coef;\n\n\t/** v1 **/\n\t\n\tfloat blur = 0.2;\n\t// if (MASK_BLUR_DISABLED == 1.) blur = 0.;\n\t\n\tspeed = _pct * 1.5;\n\n\tif (_shapeIndex == 0.) {\n\t\t_offsets[0] =  0.0 + speed * 3.;\n\t\t_offsets[1] = -1.0 + speed * 2.;\n\t\t_offsets[2] =  1.0 + speed * 1.;\n\t\t_offsets[3] = -0.0 + speed * 2.;\n\t\t_offsets[4] =  2.0 + speed * 2.;\n\t\t_offsets[5] =  0.0 + speed * 1.;\n\t\t_offsets[6] =  0.0 + speed * 3.;\n\t\t_offsets[7] =  2.0 + speed * 2.;\n\t}\n\telse if (_shapeIndex == 1.) {\n\t\t_offsets[0] = -2.0 + speed * 4.;\n\t\t_offsets[1] =  0.0 + speed * 2.;\n\t\t_offsets[2] =  1.0 + speed * 1.;\n\t\t_offsets[3] = -2.0 + speed * 3.;\n\t\t_offsets[4] =  2.0 + speed * 4.;\n\t\t_offsets[5] =  4.0 + speed * 4.;\n\t\t_offsets[6] = -1.0 + speed * 1.;\n\t\t_offsets[7] =  2.0 + speed * 1.;\n\t}\n\telse if (_shapeIndex == 2.) {\n\t\t_offsets[0] =  3.0 + speed * 4.;\n\t\t_offsets[1] = -1.0 + speed * 2.;\n\t\t_offsets[2] =  0.0 + speed * 1.;\n\t\t_offsets[3] = -2.0 + speed * 4.;\n\t\t_offsets[4] =  1.0 + speed * 1.;\n\t\t_offsets[5] =  2.0 + speed * 2.;\n\t\t_offsets[6] =  4.0 + speed * 4.;\n\t\t_offsets[7] =  1.0 + speed * 1.;\n\t}\n\telse {\n\t\t_offsets[0] =  0.0 + speed * 3.;\n\t\t_offsets[1] = -1.0 + speed * 2.;\n\t\t_offsets[2] =  0.0 + speed * 4.;\n\t\t_offsets[3] =  1.0 + speed * 2.;\n\t\t_offsets[4] =  2.0 + speed * 1.;\n\t\t_offsets[5] =  0.0 + speed * 3.;\n\t\t_offsets[6] =  3.0 + speed * 2.;\n\t\t_offsets[7] =  1.0 + speed * 4.;\n\t}\n\n\t_coef = 0.;\n\n\t\t if (floor(angle_pct / _step_pct) == 0.) { _coef = _offsets[0]; }\n\telse if (floor(angle_pct / _step_pct) == 1.) { _coef = _offsets[1]; }\n\telse if (floor(angle_pct / _step_pct) == 2.) { _coef = _offsets[2]; }\n\telse if (floor(angle_pct / _step_pct) == 3.) { _coef = _offsets[3]; }\n\telse if (floor(angle_pct / _step_pct) == 4.) { _coef = _offsets[4]; }\n\telse if (floor(angle_pct / _step_pct) == 5.) { _coef = _offsets[5]; }\n\telse if (floor(angle_pct / _step_pct) == 6.) { _coef = _offsets[6]; }\n\telse if (floor(angle_pct / _step_pct) == 7.) { _coef = _offsets[7]; }\n\n\t// _coef += time * 2.5;\n\t_coef = sin(_coef);\n\t_coef *= (1. - _pct);\n\t_coef *= .1;\n\tif (_pct < 0.5)\n\t\t_coef *= deformation;\n\n\tradius += (1. + sin((_step_rad * .75 + angle) * _steps)) * _coef;\n\n\t/**/\n\n\tfloat line = sqrt(x * x + y * y);\n\n\tif (radius > line - blur && radius < line + blur) {\n\t\tcoef = 1. - (radius - line) / blur;\n\t} else if (radius < line) {\n\t\tcoef = 1.;\n\t} else {\n\t\tcoef = 0.;\n\t}\n\n\treturn coef;\n}\n\nvoid main()\n{\n\tfloat _deformation = vDeformation;\n\tfloat _percentVisible = percentVisible;\n\n\t// if (MASK_SCALE != -1. && _percentVisible > 0. && _percentVisible < 1.) _percentVisible = MASK_SCALE;\n\n\tfloat dist, coefColor;\n\tvec4 color;\n\tvec2 uv, uv_mask;\n\tfloat scale = 1., rotation = 0.;\n\tvec4 blackColor = vec4(0., 0., 0., 1.);\n\tfloat ratio = resolution.x / resolution.y;\n\t\n\tuv = vUv;\n\n\tif (percentVisible <= 0. || percentVisible >= 2.) {\n\t\tcolor = blackColor;\n\t\tcolor.a = 0.;\n\t\tgl_FragColor = color;\n\t\treturn;\n\t}\n\n\tfloat scaleSpeed = 1.3 * .9;\n\tfloat scaleCoef = 1.5;\n\tscale = 1. + (1. - _percentVisible * scaleSpeed) * scaleCoef * _deformation;\n\tscale += .5 * _deformation;\n\tif (scaleCoef > 1.)\n\t\tscale += (scaleCoef * scaleSpeed - 1.) * _deformation;\n\n\trotation = - (_percentVisible - 1.) * .6;\n\n\tuv_mask = uv;\n\tuv_mask = rotateUv(uv_mask, vec2(.5, .5), M_PI * .15);\n\t// uv_mask = scaleUv(uv_mask, vec2(1. - .6 * _percentVisible * _deformation, 1.));\n\n\tuv = rotateUv(uv, vec2(.5, .5), rotation);\n\tuv = getTextureCoverUv(uv, resolution, texture_size, texture_imageSize);\n\tuv = scaleUv(uv, vec2(scale, scale));\n\n\tfloat margin = (texture_size.x - texture_imageSize.x) / texture_size.x * .5;\n\tif (uv.x < margin || uv.x > 1. - margin || uv.y < 0. || uv.y > 1.)\n\t{\n\t\tcolor = vec4(0., 0., 0., 0.);\n\t\tcolor.a = 0.;\n\t}\n\telse\n\t{\n\t\tcolor = applyBlur(texture, uv, _deformation);\n\t\t// color = texture2D(texture, uv);\n\t\tcolor = blackColor * (1. - texture_alpha) + color * texture_alpha;\n\t\tcolor.a *= transitionToCenter(uv_mask, ratio, _percentVisible, _deformation);\n\t}\n\n\tgl_FragColor = color;\n}";

  function initGL() {
    if (motion.matches) return;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: "low-power",
      });
      if (!gl) return;
      const vs = shader(gl.VERTEX_SHADER, ORIGINAL_VERTEX);
      const fs = shader(gl.FRAGMENT_SHADER, ORIGINAL_FRAGMENT);
      program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw Error("Original shader link failed");
      gl.useProgram(program);
      // Original Travelshift geometry: PlaneGeometry(1, 1, 40, 40).
      const vertices = [];
      for (let y = 0; y < 40; y++)
        for (let x = 0; x < 40; x++) {
          for (const [dx, dy] of [
            [0, 0],
            [1, 0],
            [0, 1],
            [0, 1],
            [1, 0],
            [1, 1],
          ]) {
            const u = (x + dx) / 40,
              v = (y + dy) / 40;
            vertices.push(u - 0.5, v - 0.5, 0, u, v);
          }
        }
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW,
      );
      const pos = gl.getAttribLocation(program, "position"),
        uv = gl.getAttribLocation(program, "uv");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(uv);
      gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 20, 12);
      uniforms = {};
      [
        "projectionMatrix",
        "modelViewMatrix",
        "deformation",
        "percentVisible",
        "resolution",
        "time",
        "shapeIndex",
        "texture",
        "texture_size",
        "texture_imageSize",
        "texture_focusY",
        "texture_alpha",
        "texture_rotation",
      ].forEach((k) => (uniforms[k] = gl.getUniformLocation(program, k)));
      gl.uniform1i(uniforms.texture, 0);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA,
      );
      images.forEach((asset) =>
        asset.ready.then((img) => {
          if (img && gl && !disposed) {
            try {
              upload(asset);
              wake();
            } catch (error) {
              console.error("TripMate texture:", error);
              canvas.dataset.error = error.message;
              useFallback();
            }
          }
        }),
      );
    } catch (error) {
      console.error("TripMate WebGL:", error);
      canvas.dataset.error = error.message;
      useFallback();
    }
  }

  function useFallback() {
    gl = null;
    art.classList.remove("webgl-ready");
  }
  function upload(asset) {
    if (!gl || !asset.img.naturalWidth || asset.texture) return;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      asset.img,
    );
    asset.texture = texture;
  }

  function draw(
    progress = 0,
    from = current,
    to = current,
    direction = 1,
    deformOverride = null,
  ) {
    if (!gl || motion.matches || !active) return;
    const a = images[from],
      b = images[to];
    if (!a.texture || !b.texture) {
      art.classList.remove("webgl-ready");
      return;
    }
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.round(art.clientWidth * dpr),
      h = Math.round(art.clientHeight * dpr);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.useProgram(program);
    // Same perspective as the original: camera z=100, plane scaled to viewport.
    const cw = art.clientWidth,
      ch = art.clientHeight,
      near = 0.1,
      far = 2000;
    gl.uniformMatrix4fv(
      uniforms.projectionMatrix,
      false,
      new Float32Array([
        200 / cw,
        0,
        0,
        0,
        0,
        200 / ch,
        0,
        0,
        0,
        0,
        -(far + near) / (far - near),
        -1,
        0,
        0,
        (-2 * far * near) / (far - near),
        0,
      ]),
    );
    gl.uniformMatrix4fv(
      uniforms.modelViewMatrix,
      false,
      new Float32Array([cw, 0, 0, 0, 0, ch, 0, 0, 0, 0, 1, 0, 0, 0, -100, 1]),
    );
    gl.uniform2f(uniforms.resolution, cw, ch);
    gl.uniform1f(
      uniforms.deformation,
      deformOverride === null ? Math.sin(progress * Math.PI) : deformOverride,
    );
    gl.uniform1f(uniforms.time, performance.now() / 1000);
    gl.uniform1f(uniforms.texture_rotation, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    function plane(asset, index, visible) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, asset.texture);
      gl.uniform2f(
        uniforms.texture_size,
        asset.img.naturalWidth,
        asset.img.naturalHeight,
      );
      gl.uniform2f(
        uniforms.texture_imageSize,
        asset.img.naturalWidth,
        asset.img.naturalHeight,
      );
      gl.uniform1f(uniforms.texture_focusY, scenes[index].image.includes("ma-pi-leng") ? 0.05 : 0.5);
      gl.uniform1f(uniforms.texture_alpha, 1);
      gl.uniform1f(uniforms.shapeIndex, index % 4);
      gl.uniform1f(uniforms.percentVisible, visible);
      gl.drawArrays(gl.TRIANGLES, 0, 40 * 40 * 6);
    }
    if (from === to) plane(a, from, 1.001);
    else {
      plane(a, from, 1 + Math.min(progress, 0.999));
      if (progress > 0) plane(b, to, Math.min(progress, 1.001));
    }
    art.classList.add("webgl-ready");
  }

  function wake() {
    if (!frame && active && !disposed && !document.hidden)
      frame = requestAnimationFrame(tick);
  }

  let originalHold = null,
    originalSettle = null,
    originalPosition = 0,
    originalDeformation = 0;
  const quartInOut = (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * Math.pow(t - 1, 4);
  const quartOut = (t) => 1 - Math.pow(1 - t, 4);
  const wrap = (n) => ((n % scenes.length) + scenes.length) % scenes.length;
  function startOriginalHold() {
    if (busy || motion.matches) return false;
    originalSettle = null;
    originalPosition = current;
    originalDeformation = 0;
    originalHold = { start: performance.now() };
    last = 0;
    wake();
    return true;
  }
  function releaseOriginalHold() {
    if (!originalHold) return;
    originalHold = null;
    const base = Math.floor(originalPosition),
      fraction = originalPosition - base;
    const end = base + (fraction > 0.3 ? 1 : 0);
    originalSettle = {
      start: performance.now(),
      from: originalPosition,
      to: end + 0.001,
      deformation: originalDeformation,
    };
    wake();
  }
  function drawOriginalPosition() {
    const base = Math.floor(originalPosition),
      fraction = originalPosition - base;
    const from = wrap(base),
      to = wrap(base + 1);
    draw(fraction, from, to, 1, originalDeformation);
    const nearest = wrap(Math.round(originalPosition));
    if (current !== nearest) {
      current = nearest;
      desired = current;
      updateCopy(current, 1);
      fallback.src = scenes[current].image;
    }
  }
  function tick(now) {
    frame = 0;
    if (!active || disposed || document.hidden) return;
    const dt = last ? Math.min(now - last, 48) : 16;
    last = now;
    if (originalHold) {
      const elapsed = (now - originalHold.start) / 1000;
      originalDeformation = quartInOut(clamp(elapsed / 0.8, 0, 1));
      const speed = Math.pow(clamp(elapsed / 0.4, 0, 1), 4);
      const base = Math.floor(originalPosition);
      if (
        (images[wrap(base)].texture && images[wrap(base + 1)].texture) ||
        !gl
      ) {
        originalPosition += (dt / 1000) * 1.08 * speed;
      }
      drawOriginalPosition();
    } else if (originalSettle) {
      const t = clamp((now - originalSettle.start) / 490, 0, 1);
      const relax = clamp((now - originalSettle.start) / 1050, 0, 1);
      originalPosition =
        originalSettle.from +
        (originalSettle.to - originalSettle.from) * quartOut(t);
      originalDeformation = originalSettle.deformation * (1 - quartOut(relax));
      drawOriginalPosition();
      if (relax >= 1) {
        originalSettle = null;
        originalDeformation = 0;
        draw();
      }
    } else if (transition) {
      const t = motion.matches
        ? 1
        : clamp((now - transition.start) / transition.duration, 0, 1);
      draw(quartInOut(t), transition.from, transition.to, transition.direction);
      if (t >= 1) {
        const done = transition.done;
        transition = null;
        done();
      }
    } else draw();
    if (originalHold || originalSettle || transition) wake();
  }

  function setTitle(name, direction = 1) {
    title
      .getAnimations({ subtree: true })
      .forEach((animation) => animation.cancel());
    title.textContent = "";
    title.setAttribute("aria-label", name + ".");
    Array.from(name + ".").forEach((letter, i) => {
      const span = document.createElement("span");
      span.className = "glyph";
      span.textContent = letter;
      span.setAttribute("aria-hidden", "true");
      title.append(span);
      if (!motion.matches && span.animate)
        span.animate(
          [
            {
              opacity: 0,
              transform:
                "translate3d(" + direction * 45 + "px,65%,0) rotate(5deg)",
            },
            { opacity: 1, transform: "translate3d(0,0,0) rotate(0deg)" },
          ],
          {
            duration: 1000,
            delay: i * 38,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "backwards",
          },
        );
    });
  }
  function updateCopy(index, direction) {
    const scene = scenes[index];
    document.body.style.setProperty("--scene-bg", scene.bg);
    document.body.style.setProperty("--scene-ink", scene.ink);
    setTitle(scene.name, direction);
    document.getElementById("home-baseline").textContent = scene.baseline;
    document.getElementById("home-description").innerHTML = scene.description;
    document.getElementById("home-region").textContent =
      "VIỆT NAM / " + scene.name.toLocaleUpperCase("vi-VN");
    document.getElementById("home-counter").textContent =
      String(index + 1).padStart(2, "0") +
      " / " +
      String(scenes.length).padStart(2, "0");
    document.getElementById("home-explore").firstChild.textContent =
      index === 0 ? "Khám phá hành trình " : "Hỏi về điểm đến ";
    dots.forEach((dot, i) =>
      dot.setAttribute("aria-pressed", String(i === index)),
    );
    status.textContent = "Điểm đến " + scene.name;
    const copy = home.querySelector(".home-description");
    if (!motion.matches && copy.animate)
      copy.animate(
        [
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 850, easing: "cubic-bezier(.16,1,.3,1)" },
      );
  }
  async function switchScene(index, direction = 1) {
    originalHold = null;
    originalSettle = null;
    desired = (index + scenes.length) % scenes.length;
    if (busy || desired === current) return;
    busy = true;
    const target = desired;
    const token = ++sequence;
    await images[target].ready;
    if (disposed || token !== sequence) {
      busy = false;
      return;
    }
    updateCopy(target, direction);
    fallback.src = scenes[target].image;
    if (!gl && !motion.matches && fallback.animate)
      fallback.animate(
        [
          {
            opacity: 0,
            transform: "scale(.8) rotate(" + -direction * 5 + "deg)",
          },
          { opacity: 1, transform: "scale(.88) rotate(0)" },
        ],
        { duration: 1000, easing: "cubic-bezier(.22,1,.36,1)" },
      );
    const finish = () => {
      current = target;
      busy = false;
      draw();
      if (desired !== current) switchScene(desired, direction);
    };
    if (motion.matches || !active) {
      finish();
      return;
    }
    transition = {
      from: current,
      to: target,
      direction,
      start: performance.now(),
      duration: 1150,
      done: finish,
    };
    wake();
  }
  function next(direction) {
    lastSwitch = performance.now();
    switchScene(desired + direction, direction);
  }
  function showHome() {
    active = true;
    home.hidden = false;
    journey.hidden = true;
    journey.inert = true;
    footer.hidden = true;
    document.body.classList.add("is-home");
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    wake();
  }
  function showJourney() {
    originalHold = null;
    originalSettle = null;
    active = false;
    home.hidden = true;
    journey.hidden = false;
    journey.inert = false;
    footer.hidden = false;
    document.body.classList.remove("is-home");
    if (transition) {
      const done = transition.done;
      transition = null;
      done();
    }
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    journey.focus({ preventScroll: true });
    window.dispatchEvent(new Event("resize"));
  }
  document.querySelector(".wordmark").addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showHome();
      home.focus({ preventScroll: true });
    },
    true,
  );
  menu
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", showJourney, true));
  document.getElementById("home-explore").addEventListener("click", () => {
    if (current === 0) {
      showJourney();
      return;
    }
    openChat();
    sendMessage("Mình muốn khám phá " + scenes[current].name + ".");
  });
  document
    .getElementById("home-prev")
    .addEventListener("click", () => next(-1));
  document.getElementById("home-next").addEventListener("click", () => next(1));
  document
    .getElementById("home-shuffle")
    .addEventListener("click", () =>
      switchScene(
        desired + 1 + Math.floor(Math.random() * (scenes.length - 1)),
      ),
    );
  dots.forEach((dot) =>
    dot.addEventListener("click", () =>
      switchScene(
        Number(dot.dataset.slide),
        Number(dot.dataset.slide) >= current ? 1 : -1,
      ),
    ),
  );

  // Hold the primary button for 600 ms. Releasing early cancels.
  const holdCancels = [];

  function holdScene(button, action) {
    let held = false,
      timer = null,
      suppressClick = false,
      startX = 0,
      startY = 0;
    const cancel = () => {
      clearTimeout(timer);
      timer = null;
      if (held) releaseOriginalHold();
      held = false;
      button.classList.remove("hover-armed");
    };
    holdCancels.push(cancel);
    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !event.isPrimary || !active || dialog.open)
        return;
      if (
        button === home &&
        event.target.closest("button,a,input,textarea,select")
      )
        return;
      cancel();
      suppressClick = true;
      startX = event.clientX;
      startY = event.clientY;
      button.setPointerCapture(event.pointerId);
      button.style.setProperty("--hold-x", startX + "px");
      button.style.setProperty("--hold-y", startY + "px");
      if (motion.matches || !gl) {
        held = true;
        timer = setTimeout(() => {
          cancel();
          if (active && !dialog.open) action();
        }, 600);
      } else held = startOriginalHold();
      if (held) button.classList.add("hover-armed");
    });
    button.addEventListener("pointermove", (event) => {
      if (
        held &&
        Math.hypot(event.clientX - startX, event.clientY - startY) > 14
      )
        cancel();
    });
    [
      "pointerup",
      "pointercancel",
      "lostpointercapture",
      "pointerleave",
      "blur",
    ].forEach((type) => button.addEventListener(type, cancel));
    button.addEventListener(
      "click",
      (event) => {
        if (suppressClick && event.detail !== 0) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
        suppressClick = false;
      },
      true,
    );
  }

  const screenRing = document.createElement("span");
  screenRing.className = "screen-hold-ring";
  screenRing.setAttribute("aria-hidden", "true");
  home.append(screenRing);
  home.querySelector(".home-instruction").textContent =
    "Nhấn giữ chuột trái để đổi điểm đến";
  holdScene(home, () => next(1));
  const shuffle = document.getElementById("home-shuffle");
  shuffle.setAttribute("aria-label", "Giữ chuột trái để đổi điểm đến");
  shuffle.querySelector("small").textContent = "GIỮ CHUỘT TRÁI";
  holdScene(shuffle, () =>
    switchScene(desired + 1 + Math.floor(Math.random() * (scenes.length - 1))),
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) holdCancels.forEach((cancel) => cancel());
  });
  window.addEventListener("pagehide", () =>
    holdCancels.forEach((cancel) => cancel()),
  );
  home.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || event.target.closest("button")) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastSwitch < 900) return;
      if (now - wheelTime > 160) wheelTotal = 0;
      wheelTime = now;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      wheelTotal += delta * (event.deltaMode === 1 ? 20 : 1);
      if (Math.abs(wheelTotal) > 45) {
        next(Math.sign(wheelTotal));
        wheelTotal = 0;
      }
    },
    { passive: false },
  );
  home.addEventListener("keydown", (event) => {
    if (event.target.closest("button")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      next(1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      next(-1);
    }
  });
  home.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button,a") || event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
    home.setPointerCapture(event.pointerId);
    home.classList.add("is-dragging");
  });
  home.addEventListener("pointermove", (event) => {
    if (motion.matches) return;
    if (finePointer.matches) {
      pointer = [
        clamp((event.clientX / innerWidth - 0.5) * 2, -1, 1),
        clamp((event.clientY / innerHeight - 0.5) * 2, -1, 1),
      ];
    }
    if (drag)
      gesture = clamp((event.clientX - drag.x) / innerWidth, -0.35, 0.35);
    wake();
  });
  function endDrag(event, cancel = false) {
    if (!drag) return;
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    drag = null;
    home.classList.remove("is-dragging");
    if (!cancel && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
      next(dx < 0 ? 1 : -1);
    wake();
  }
  home.addEventListener("pointerup", (event) => endDrag(event));
  home.addEventListener("pointercancel", (event) => endDrag(event, true));
  home.addEventListener("lostpointercapture", (event) => endDrag(event, true));
  home.addEventListener("pointerleave", () => {
    pointer = [0, 0];
    wake();
  });
  window.addEventListener("resize", wake);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    } else wake();
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    useFallback();
  });
  motion.addEventListener("change", () => {
    title
      .getAnimations({ subtree: true })
      .forEach((animation) => animation.finish());
    if (motion.matches) {
      holdCancels.forEach((cancel) => cancel());
      originalHold = null;
      originalSettle = null;
      art.classList.remove("webgl-ready");
      if (transition) {
        const done = transition.done;
        transition = null;
        done();
      }
    } else {
      if (!gl) initGL();
      wake();
    }
  });
  window.addEventListener(
    "pagehide",
    () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      if (gl) {
        images.forEach((asset) => {
          if (asset.texture) gl.deleteTexture(asset.texture);
        });
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    },
    { once: true },
  );
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      disposed = false;
      images.forEach((asset) => (asset.texture = null));
      gl = null;
      initGL();
      wake();
    }
  });
  showHome();
  updateCopy(0, 1);
  initGL();
  home.classList.add("entering");
  setTimeout(() => home.classList.remove("entering"), 1900);
})();


