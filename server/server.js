require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/v1/generate-script', (req, res) => {
  return res.json({
    status: 'success',
    script: 'This is a fake AI-generated coffee ad script.'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
