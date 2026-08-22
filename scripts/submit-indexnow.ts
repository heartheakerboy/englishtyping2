/**
 * IndexNow Instant Search Engine Indexing Script
 * Submits all public URLs directly to Bing, Yandex, Naver, and Seznam via IndexNow API.
 */

const INDEXNOW_KEY = "c839f40e791b48b9b5f403986a42ec71";
const HOST = "www.englishtypingtest.org";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const URL_LIST = [
  `https://${HOST}/`,
  `https://${HOST}/gcc-tbc-typing-test`,
  `https://${HOST}/live-chat-typing-test`,
  `https://${HOST}/typing-test`,
  `https://${HOST}/test`,
  `https://${HOST}/games`,
  `https://${HOST}/games/balloon-burst`,
  `https://${HOST}/games/zombie-typing`,
  `https://${HOST}/games/falling-words`,
  `https://${HOST}/games/race-bots`,
  `https://${HOST}/games/trainer`,
  `https://${HOST}/games/cps`,
  `https://${HOST}/games/reaction`,
  `https://${HOST}/games/spacebar`,
  `https://${HOST}/games/memory`,
  `https://${HOST}/race`,
  `https://${HOST}/lessons`,
  `https://${HOST}/leaderboard`,
  `https://${HOST}/templates`,
  `https://${HOST}/blog`,
  `https://${HOST}/sitemap`,
];

async function submitIndexNow() {
  console.log(`[IndexNow] Submitting ${URL_LIST.length} URLs for ${HOST}...`);

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: URL_LIST,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`[IndexNow] Sending request to ${endpoint}...`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      console.log(`[IndexNow] ${endpoint} -> Status: ${res.status} ${res.statusText}`);
      if (res.status === 200 || res.status === 202) {
        console.log(`✅ Successfully submitted URLs to ${endpoint}`);
      } else {
        const text = await res.text();
        console.log(`Response: ${text}`);
      }
    } catch (err: any) {
      console.error(`❌ Error submitting to ${endpoint}:`, err.message);
    }
  }
}

submitIndexNow();
