const logEl = document.getElementById("log");
function log(msg) {
  logEl.textContent += msg + "\n";
  console.log(msg);
}

let lastImageB64 = null;

document.getElementById("exportBtn").addEventListener("click", () => {
  log("Requesting image export...");
  window.parent.postMessage('app.activeDocument.saveToOE("png");', "*");
});

window.addEventListener("message", (e) => {
  if (e.data instanceof ArrayBuffer) {
    log("✅ Got ArrayBuffer (" + e.data.byteLength + " bytes)");
    const b64 = arrayBufferToBase64(e.data);
    lastImageB64 = b64;
    document.getElementById("aiEditBtn").disabled = false;
  } else if (typeof e.data === "string") {
    log("📩 " + e.data);
  }
});

document.getElementById("aiEditBtn").addEventListener("click", async () => {
  if (!lastImageB64) return alert("No image yet!");
  log("🔄 Sending image to Nano Banana API...");

  const res = await fetch("/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: lastImageB64 })
  });

  const data = await res.json();
  if (data.image) {
    log("✅ Got edited image from API!");
    const ab = base64ToArrayBuffer(data.image);
    window.parent.postMessage(ab, "*");
  } else {
    log("❌ API error: " + (data.error || "unknown"));
  }
});

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk)
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return btoa(binary);
}

function base64ToArrayBuffer(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
