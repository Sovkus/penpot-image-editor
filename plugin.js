/* Penpot Plugin: Image Color Editor (host) */
penpot.plugin.init(async function() {
  const ui = await penpot.ui.open(
    "Image Color Editor",
    "ui/index.html"
  );

  // Keep original bytes per selected image (so Reset restores the true starting point).
  const originals = new Map(); // key: shape.id -> Uint8Array

  async function sendImageToUi(shape) {
    try {
      const bytes = await shape.getBytes();
      if (!originals.has(shape.id)) originals.set(shape.id, bytes);
      ui.postMessage({ type: "image", bytes: Array.from(bytes) });
    } catch (e) {
      ui.postMessage({ type: "error", message: String(e) });
    }
  }

  penpot.selection.onChange(async (sel) => {
    if (sel.length !== 1 || sel[0].type !== "image") {
      ui.postMessage({ type: "no-image" });
      return;
    }
    await sendImageToUi(sel[0]);
  });

  ui.onMessage(async (msg) => {
    const sel = penpot.selection.get();
    if (sel.length !== 1 || sel[0].type !== "image") return;
    const shape = sel[0];

    if (msg.type === "apply") {
      const bytes = Uint8Array.from(msg.bytes);
      await shape.replaceBytes(bytes);
      // After apply, treat this as the new baseline (so Reset goes back to the pre-apply original).
      // We keep originals[shape.id] unchanged so Reset still returns to the first loaded state.
    }

    if (msg.type === "reset") {
      const orig = originals.get(shape.id);
      if (orig) await shape.replaceBytes(orig);
    }
  });
});
