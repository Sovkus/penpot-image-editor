let originalBytes = null;
let bitmap = null;

const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

const sliders = [
  "exposure","contrast","saturation",
  "temperature","tint","highlights","shadows"
];

sliders.forEach(id => {
  document.getElementById(id).oninput = draw;
});

// получаем изображение от плагина
window.penpot.onMessage(async (msg) => {
  if (msg.type === "image") {
    originalBytes = new Uint8Array(msg.bytes);
    const blob = new Blob([originalBytes], { type: "image/png" });

    bitmap = await createImageBitmap(blob);

    draw();
  }

  if (msg.type === "no-image") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});


function draw() {
  if (!bitmap) return;

  ctx.filter = buildFilter();
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
}


function buildFilter() {
  const exp = parseInt(exposure.value);
  const con = parseInt(contrast.value);
  const sat = parseInt(saturation.value);

  return `
    brightness(${100 + exp}%)
    contrast(${100 + con}%)
    saturate(${100 + sat}%)
  `;
}


document.getElementById("reset").onclick = () => {
  window.penpot.postMessage({ type: "reset" });
  sliders.forEach(id => document.getElementById(id).value = 0);
  draw();
};

document.getElementById("apply").onclick = async () => {
  const off = new OffscreenCanvas(bitmap.width, bitmap.height);
  const octx = off.getContext("2d");

  octx.filter = buildFilter();
  octx.drawImage(bitmap, 0, 0);

  const blob = await off.convertToBlob({ type: "image/png" });
  const buffer = new Uint8Array(await blob.arrayBuffer());

  window.penpot.postMessage({
    type: "apply",
    bytes: Array.from(buffer)
  });
};
