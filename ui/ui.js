/* UI (in iframe): preview + real pixel processing (Canvas) */
(() => {
  const $ = (id) => document.getElementById(id);

  const canvas = $("previewCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  // Working state (original image bytes + decoded ImageBitmap)
  let originalBytes = null;
  let originalBitmap = null;

  // Controls
  const ids = ["exposure","contrast","saturation","temperature","tint","highlights","shadows"];
  const sliders = Object.fromEntries(ids.map((id) => [id, $(id)]));

  // Defaults (for reset)
  const defaults = {
    exposure: 0,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
  };

  // --- Message bridge (Penpot plugin UI contract) ---
  const bridge = window.penpot || (window.parent && window.parent.penpot) || null;

  function setStatus(msg) { $("status").textContent = msg || ""; }

  // Receive from host (plugin.js)
  if (bridge && typeof bridge.onMessage === "function") {
    bridge.onMessage((msg) => {
      if (msg.type === "image") {
        originalBytes = new Uint8Array(msg.bytes);
        loadOriginalFromBytes(originalBytes).then(() => {
          applyAndRender();
          setStatus("Готово: изменяй ползунки и жми Apply.");
        }).catch((e) => setStatus("Ошибка загрузки: " + e.message));
      } else if (msg.type === "no-image") {
        clearPreview();
        setStatus("Выдели изображение в Canvas (image node).");
      } else if (msg.type === "error") {
        setStatus(msg.message || "Ошибка плагина");
      }
    });
  }

  // Send to host
  function send(msg) {
    if (bridge && typeof bridge.postMessage === "function") bridge.postMessage(msg);
  }

  // --- Image decoding (bytes -> ImageBitmap) ---
  async function loadOriginalFromBytes(bytes) {
    const blob = new Blob([bytes], { type: "image/png" }); // Penpot images are typically png/svg; png is safe for rasterizing
    const url = URL.createObjectURL(blob);
    try {
      originalBitmap = await createImageBitmap(blob);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // --- Core processing: apply adjustments to a source bitmap and render to preview ---
  async function applyAndRender() {
    if (!originalBitmap) return;

    // Render original to an offscreen canvas at its natural size (for best quality on apply)
    const off = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    offCtx.drawImage(originalBitmap, 0, 0);

    const img = offCtx.getImageData(0, 0, off.width, off.height);
    adjustImageData(img.data, off.width, off.height, readParams());

    // Preview (downscale to 208x208 with cover fit)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tmp = new OffscreenCanvas(off.width, off.height);
    tmp.getContext("2d").putImageData(img, 0, 0);

    // Fit/crop: cover (like an image preview)
    const scale = Math.max(canvas.width / off.width, canvas.height / off.height);
    const drawW = off.width * scale;
    const drawH = off.height * scale;
    const dx = (canvas.width - drawW) / 2;
    const dy = (canvas.height - drawH) / 2;

    ctx.drawImage(tmp, dx, dy, drawW, drawH);
  }

  // --- Read params from sliders ---
  function readParams() {
    return {
      exposure: Number(sliders.exposure.value),      // -100..100
      contrast: Number(sliders.contrast.value),      // 0..200 (100 = neutral)
      saturation: Number(sliders.saturation.value),  // 0..200 (100 = neutral)
      temperature: Number(sliders.temperature.value),// -100..100
      tint: Number(sliders.tint.value),              // -100..100
      highlights: Number(sliders.highlights.value),  // -100..100
      shadows: Number(sliders.shadows.value),        // -100..100
    };
  }

  // --- Pixel math (real processing) ---
  function adjustImageData(data, width, height, p) {
    const exp = p.exposure / 100; // -1..1
    const expFactor = 1 + exp;    // simple exposure multiplier

    // Contrast: map (0..200) to factor using classic formula (100 => 1)
    const c = Math.max(0, Math.min(200, p.contrast));
    const cNorm = c - 100; // -100..100
    const contrastFactor = (259 * (cNorm + 255)) / (255 * (259 - cNorm));

    // Saturation: (0..200) -> (0..2) with 1 neutral
    const sat = Math.max(0, Math.min(2, p.saturation / 100));

    // Temperature/Tint influences (normalized)
    const temp = Math.max(-1, Math.min(1, p.temperature / 100));
    const tint = Math.max(-1, Math.min(1, p.tint / 100));

    // Highlights/Shadows (strength -1..1)
    const hi = Math.max(-1, Math.min(1, p.highlights / 100));
    const sh = Math.max(-1, Math.min(1, p.shadows / 100));

    // Helpers
    const lum = (r,g,b) => 0.2126*r + 0.7152*g + 0.0722*b;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a === 0) continue;

      // 1) Exposure + Contrast
      r = (r * expFactor - 128) * contrastFactor + 128;
      g = (g * expFactor - 128) * contrastFactor + 128;
      b = (b * expFactor - 128) * contrastFactor + 128;

      // 2) Saturation (desaturate toward luminance)
      const L = lum(r, g, b);
      r = L + (r - L) * sat;
      g = L + (g - L) * sat;
      b = L + (b - L) * sat;

      // 3) Temperature (warm/cool): shift toward red/yellow vs blue
      //    +temp => warmer (more R, less B); -temp => cooler (more B, less R)
      const tAmount = temp * 28; // perceptual-ish
      r += tAmount;
      b -= tAmount;

      // 4) Tint (green/magenta): +tint => greener (more G), -tint => magenta (less G, slightly more R+B)
      const ti = tint * 24;
      g += ti;
      r -= ti * 0.5;
      b -= ti * 0.5;

      // 5) Highlights/Shadows (simple lift/compress based on luminance)
      const Lnorm = lum(r, g, b) / 255;
      if (Lnorm > 0.6) { // highlights region
        const k = (Lnorm - 0.6) / 0.4; // 0..1
        const h = 1 + hi * (0.55 * k); // reduce or boost highlights
        r *= h; g *= h; b *= h;
      } else if (Lnorm < 0.4) { // shadows region
        const k = (0.4 - Lnorm) / 0.4; // 0..1
        const s = 1 + sh * (0.55 * k); // lift or deepen shadows
        r *= s; g *= s; b *= s;
      }

      // clamp
      data[i]   = clamp8(r);
      data[i+1] = clamp8(g);
      data[i+2] = clamp8(b);
      data[i+3] = a;
    }
  }

  function clamp8(x){ return Math.min(255, Math.max(0, Math.round(x))); }

  // --- UI bindings ---
  ids.forEach((id) => {
    sliders[id].addEventListener("input", () => {
      applyAndRender();
    });
  });

  $("apply").addEventListener("click", async () => {
    if (!originalBitmap) return;
    setStatus("Применяю…");

    // Render full-res adjusted image (same pipeline as preview but at original size)
    const off = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    offCtx.drawImage(originalBitmap, 0, 0);
    const img = offCtx.getImageData(0, 0, off.width, off.height);
    adjustImageData(img.data, off.width, off.height, readParams());
    offCtx.putImageData(img, 0, 0);

    // Export to PNG bytes and send to host (Penpot replaces selected image bytes)
    const blob = await off.convertToBlob({ type: "image/png" });
    const buf = new Uint8Array(await blob.arrayBuffer());
    send({ type: "apply", bytes: Array.from(buf) });
    setStatus("Готово — изображение обновлено в Penpot.");
  });

  $("reset").addEventListener("click", () => {
    // Reset sliders (and preview) back to defaults
    for (const k of Object.keys(defaults)) sliders[k].value = String(defaults[k]);
    applyAndRender();
    send({ type: "reset" });
    setStatus("Сброшено к исходному состоянию.");
  });

  function clearPreview() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
})();
