import * as rgs from "./rgs-auth";
import type { PlayResponse, EndRoundResponse } from "./rgs-auth";
import { Application, Assets, Sprite } from "pixi.js";
import * as PIXI_SOUND from "pixi-sound";

// Run authentication on load
rgs.authenticate().catch(console.error);

import { Container, Text, TextStyle } from "pixi.js";

(async () => {
  // --- Session-based sound enablement ---
  let soundEnabled = sessionStorage.getItem("soundEnabled");
  if (soundEnabled === null) {
    // Show overlay for sound choice
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";
    overlay.innerHTML = `
      <div style="color:#fff;font-size:2rem;margin-bottom:2rem;">Enable sound effects?</div>
      <div>
        <button id="sound-yes" style="font-size:1.2rem;padding:1rem 2rem;margin:0 1rem;">Play with Sound</button>
        <button id="sound-no" style="font-size:1.2rem;padding:1rem 2rem;margin:0 1rem;">Play without Sound</button>
      </div>
    `;
    document.body.appendChild(overlay);
    await new Promise<void>((resolve) => {
      overlay.querySelector("#sound-yes")!.addEventListener("click", () => {
        sessionStorage.setItem("soundEnabled", "1");
        overlay.remove();
        resolve();
      });
      overlay.querySelector("#sound-no")!.addEventListener("click", () => {
        sessionStorage.setItem("soundEnabled", "0");
        overlay.remove();
        resolve();
      });
    });
    soundEnabled = sessionStorage.getItem("soundEnabled");
  }
  // --- Sound Effects with PixiJS Sound ---
  const hoverSoundUrl = new URL("./assets/sfx-hover.mp3", import.meta.url).href;
  const pressSoundUrl = new URL("./assets/sfx-press.mp3", import.meta.url).href;
  // Register sounds
  PIXI_SOUND.default.add("hover", hoverSoundUrl);
  PIXI_SOUND.default.add("press", pressSoundUrl);
  // Create a new application
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Load the engine texture using strict CDN-compatible pattern
  const engineUrl = new URL("./assets/engine.png", import.meta.url).href;
  const texture = await Assets.load(engineUrl);
  const engine = new Sprite(texture);
  engine.anchor.set(0.5);
  engine.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(engine);

  // --- Loader Bar Animation ---
  const loaderFrames: Sprite[] = [];
  for (let i = 1; i <= 6; i++) {
    const url = new URL(`./assets/${i}.png`, import.meta.url).href;
    const tex = await Assets.load(url);
    const frame = new Sprite(tex);
    frame.anchor.set(0.5);
    frame.position.set(app.screen.width / 2, app.screen.height / 2 - 120);
    frame.visible = false;
    app.stage.addChild(frame);
    loaderFrames.push(frame);
  }
  // Show loader animation at start
  let loaderIndex = 0;
  loaderFrames[loaderIndex].visible = true;
  let loaderElapsed = 0;
  let loaderActive = true;
  // Hide loader after 2 seconds
  setTimeout(() => {
    loaderActive = false;
    loaderFrames.forEach((f) => (f.visible = false));
  }, 2000);

  // --- Replace Button Graphics with button.png ---
  const buttonImageUrl = new URL("./assets/button.png", import.meta.url).href;
  const buttonTexture = await Assets.load(buttonImageUrl);

  // --- UI State ---
  let balance = 1000;
  let lastWin = 0;
  let response: PlayResponse | null = null;

  const style = new TextStyle({ fontSize: 24, fill: "#fff" });
  const balanceText = new Text({ text: `Balance: $${balance}`, style });
  balanceText.position.set(20, 20);
  app.stage.addChild(balanceText);

  const winText = new Text({ text: `Round Win: $${lastWin}`, style });
  winText.position.set(20, 60);
  app.stage.addChild(winText);

  const endRoundStyle = new TextStyle({ fontSize: 18, fill: "#ffb" });
  const endRoundDialog = new Text({ text: "", style: endRoundStyle });
  endRoundDialog.position.set(20, 180);
  app.stage.addChild(endRoundDialog);

  function createButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void,
  ) {
    const btn = new Container();
    const bg = new Sprite(buttonTexture);
    bg.width = 160;
    bg.height = 48;
    btn.addChild(bg);
    const txt = new Text({
      text: label,
      style: new TextStyle({ fontSize: 20, fill: "#fff" }),
    });
    txt.anchor.set(0.5);
    txt.position.set(80, 24);
    btn.addChild(txt);
    btn.position.set(x, y);
    btn.eventMode = "static";
    btn.cursor = "pointer";

    // Button scaling effect
    btn.on("pointerover", () => {
      console.log("[DEBUG] pointerover fired for button:", label);
      if (sessionStorage.getItem("soundEnabled") === "1") {
        console.log("[DEBUG] Playing hover sound");
        PIXI_SOUND.default.play("hover");
      } else {
        console.log("[DEBUG] Sound not enabled, not playing hover sound");
      }
      btn.scale.set(1.08);
      console.log("[DEBUG] Set scale to 1.08");
    });
    btn.on("pointerout", () => {
      console.log("[DEBUG] pointerout fired for button:", label);
      btn.scale.set(1);
      console.log("[DEBUG] Set scale to 1");
    });
    btn.on("pointerdown", () => {
      console.log("[DEBUG] pointerdown fired for button:", label);
      btn.scale.set(0.95);
      console.log("[DEBUG] Set scale to 0.95");
    });
    btn.on("pointerup", () => {
      console.log("[DEBUG] pointerup fired for button:", label);
      btn.scale.set(1.08);
      console.log("[DEBUG] Set scale to 1.08");
    });
    btn.on("pointerupoutside", () => {
      console.log("[DEBUG] pointerupoutside fired for button:", label);
      btn.scale.set(1);
      console.log("[DEBUG] Set scale to 1");
    });
    btn.on("pointertap", () => {
      console.log("[DEBUG] pointertap fired for button:", label);
      if (sessionStorage.getItem("soundEnabled") === "1") {
        console.log("[DEBUG] Playing press sound");
        PIXI_SOUND.default.play("press");
      } else {
        console.log("[DEBUG] Sound not enabled, not playing press sound");
      }
      onClick();
    });

    app.stage.addChild(btn);
    return btn;
  }

  async function handlePlaceBet() {
    response = await rgs.getBookResponse();
    if (
      response &&
      response.balance &&
      typeof response.balance.amount === "number"
    ) {
      balance = response.balance.amount / 1000000;
    }
    if (
      response &&
      response.round &&
      typeof response.round.payoutMultiplier === "number"
    ) {
      lastWin = response.round.payoutMultiplier;
    }
    balanceText.text = `Balance: $${balance}`;
    winText.text = `Round Win: $${lastWin}`;
  }

  async function handleEndRound() {
    await rgs.endRound();
    const endResp = rgs.endRoundResponse as EndRoundResponse | null;
    if (
      endResp &&
      endResp.balance &&
      typeof endResp.balance.amount === "number"
    ) {
      balance = endResp.balance.amount / 1000000;
    }
    balanceText.text = `Balance: $${balance}`;
  }

  // --- Add Buttons ---
  // Center buttons under the engine

  const buttonWidth = 160;
  const buttonSpacing = 24;
  const numButtons = 2;
  const totalWidth =
    numButtons * buttonWidth + (numButtons - 1) * buttonSpacing;
  const startX = (app.screen.width - totalWidth) / 2;
  const buttonY = app.screen.height / 2 + engine.height / 2 + 40;

  createButton("Place Bet", startX, buttonY, handlePlaceBet);
  createButton(
    "End Round",
    startX + buttonWidth + buttonSpacing,
    buttonY,
    handleEndRound,
  );
  // Show End Round Response button is not needed visually, but you can add it back if you want

  // Animate engine and loader
  app.ticker.add((time) => {
    engine.rotation += 0.1 * time.deltaTime;
    // Loader animation
    if (loaderActive) {
      loaderElapsed += time.deltaMS;
      if (loaderElapsed > 120) {
        loaderFrames[loaderIndex].visible = false;
        loaderIndex = (loaderIndex + 1) % loaderFrames.length;
        loaderFrames[loaderIndex].visible = true;
        loaderElapsed = 0;
      }
    }
  });
})();
