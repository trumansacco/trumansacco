import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: "Hello from your Node backend on Vercel!",
    method: req.method,
    timestamp: new Date().toISOString(),
  });
}