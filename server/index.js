import { createApp } from "./http.js";

const port = Number(process.env.PORT || 4740);
createApp().listen(port, () => {
  console.log(`RevenueGuard Agent Platform API listening on http://127.0.0.1:${port}`);
});
