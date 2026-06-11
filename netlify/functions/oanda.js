const OANDA_TOKEN = "3bd390b7df5a74cc7b41355f3680de4d-3d82122d27f629fe73efcc27f99d542a";
const OANDA_ACCT = "101-001-38845298-002";
const OANDA_BASE = "https://api-fxpractice.oanda.com/v3";

async function oget(path) {
  const res = await fetch(OANDA_BASE + path, {
    headers: {
      Authorization: `Bearer ${OANDA_TOKEN}`,
      "Accept-Datetime-Format": "RFC3339",
    },
  });
  return await res.json();
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const path = event.path.replace("/.netlify/functions/oanda", "") || "/";
  const params = event.queryStringParameters || {};
  let data;

  if (path === "/" || path === "/health") {
    data = { status: "ok", account: OANDA_ACCT, time: new Date().toISOString() };
  } else if (path === "/account") {
    data = await oget(`/accounts/${OANDA_ACCT}/summary`);
  } else if (path === "/prices") {
    const inst = params.instruments || "XAU_USD,EUR_USD,GBP_USD,USD_JPY,AUD_USD";
    data = await oget(`/accounts/${OANDA_ACCT}/pricing?instruments=${encodeURIComponent(inst)}`);
  } else if (path === "/candles") {
    const inst = params.instrument || "EUR_USD";
    const gran = params.granularity || "D";
    const count = params.count || "2";
    data = await oget(`/instruments/${inst}/candles?granularity=${gran}&count=${count}&price=M`);
  } else {
    data = { error: "not found" };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data),
  };
};
