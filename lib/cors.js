// lib/cors.js
import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
  origin: '*', // allow all — adjust for production
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function applyCors(req, res) {
  await runMiddleware(req, res, cors);
}
