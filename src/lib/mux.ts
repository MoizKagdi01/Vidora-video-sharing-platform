import mux from "@mux/mux-node";

export const muxClient = new mux.Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
  webhookSecret: process.env.MUX_SIGNING_PRIVATE_KEY
});

