module.exports = (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Content-Type', 'application/json');

  const { username, password } = req.body || {};

  // Read credentials from environment variables (never exposed to browser)
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    // Env vars not set — reject for security
    return res.status(500).json({ success: false, error: 'Server misconfigured' });
  }

  if (username === validUsername && password === validPassword) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
};
