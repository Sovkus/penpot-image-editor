penpot.plugin.init(async function() {
  const ui = await penpot.ui.open("Image Editor", "index.html");

  const originals = new Map();

  penpot.selection.onChange(async (sel)=>{
    if(sel.length!==1||sel[0].type!=="image"){
      ui.postMessage({type:"no-image"});
      return;
    }
    const img=sel[0];
    const bytes=await img.getBytes();
    if(!originals.has(img.id)) originals.set(img.id, bytes);
    ui.postMessage({type:"image", bytes:Array.from(bytes)});
  });

  ui.onMessage(async(msg)=>{
    const sel=penpot.selection.get();
    if(sel.length!==1||sel[0].type!=="image") return;
    const img=sel[0];

    if(msg.type==="apply"){
      await img.replaceBytes(Uint8Array.from(msg.bytes));
    }
    if(msg.type==="reset"){
      const orig=originals.get(img.id);
      if(orig) await img.replaceBytes(orig);
    }
  });
});