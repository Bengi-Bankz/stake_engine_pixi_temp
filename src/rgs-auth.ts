// rgs-auth.ts

const API_MULTIPLIER = 1000000;

interface Balance {
  amount: number;
}

interface AuthenticateResponse {
  balance: Balance;
}

interface EndRoundResponse {
  balance: Balance;
}

interface PlayRound {
  payoutMultiplier: number;
  state?: string;
}

interface PlayResponse {
  balance: Balance;
  round: PlayRound;
}

let gamestate: string = "rest";
let response: PlayResponse | null = null;
let endRoundResponse: EndRoundResponse | null = null;
let balance: number = 1000;
let lastWin: number = 0;

function getParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

async function getRGSResponse<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const rgsUrl = getParam("rgs_url");
  if (!rgsUrl) throw new Error("Missing rgs_url parameter");
  const res = await fetch(`https://${rgsUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function authenticate() {
  const res = await getRGSResponse<AuthenticateResponse>(
    "/wallet/authenticate",
    {
      sessionID: getParam("sessionID"),
      language: getParam("language") || "en",
    },
  );
  balance = res.balance.amount / API_MULTIPLIER;
  console.log("Authenticated. Balance:", balance);
}

async function endRound() {
  const confirmation = await getRGSResponse<EndRoundResponse>(
    "/wallet/end-round",
    {
      sessionID: getParam("sessionID"),
    },
  );
  balance = confirmation.balance.amount / API_MULTIPLIER;
  endRoundResponse = confirmation;
  if (confirmation.balance.amount != null) {
    gamestate = "rest";
  }
}

async function getBookResponse(): Promise<PlayResponse> {
  if (gamestate === "rest") {
    balance -= 1;
  }
  const resp = await getRGSResponse<PlayResponse>("/wallet/play", {
    mode: getParam("mode") ?? "BASE",
    currency: getParam("currency"),
    sessionID: getParam("sessionID"),
    amount: 1 * API_MULTIPLIER,
  });
  response = resp;
  endRoundResponse = null;
  gamestate = "playing";
  if (
    response &&
    response.round &&
    typeof response.round.payoutMultiplier === "number"
  ) {
    lastWin = response.round.payoutMultiplier;
  }
  if (lastWin === undefined) {
    gamestate = "rest";
    lastWin = 0;
  }
  if (resp && resp.round && typeof resp.round.state === "string") {
    console.log("Round State:", resp.round.state);
  }
  console.log("Last Win:", lastWin);
  return resp;
}

// Run authentication on load
window.addEventListener("DOMContentLoaded", () => {
  authenticate().catch(console.error);
});

// Export functions, state, and types for UI
export { authenticate, endRound, getBookResponse, endRoundResponse };
export type { PlayResponse, EndRoundResponse };
