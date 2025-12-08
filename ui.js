const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

let originalBytes = null;
let bitmap = null;

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
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
}

document.getElementById("reset").onclick = () => {
  window.penpot.postMessage({ type: "reset" });
  draw();
};

document.getElementById("apply").onclick = async () => {
  const off = new OffscreenCanvas(bitmap.width, bitmap.height);
  const octx = off.getContext("2d");

  octx.drawImage(bitmap, 0, 0);

  const blob = await off.convertToBlob({ type: "image/png" });
  const buffer = new Uint8Array(await blob.arrayBuffer());

  window.penpot.postMessage({ type: "apply", bytes: Array.from(buffer) });
};
