const express = require('express');
const { query } = require('@anthropic-ai/claude-agent-sdk');
const app = express();
app.use(express.json());
const fs = require('fs');
const path = require('path');
require('dotenv').config( { path: path.join(__dirname, '.env') } );

const PORT = process.env.CLAUDE_PORT || 4000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const WORKING_DIR = '/vercel/sandbox';
const LOG_FILE = WORKING_DIR + '/claude-agent.log';
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

app.get('/health', (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });
  }
  if (!WORKING_DIR) {
    return res.status(500).json({ error: 'WORKING_DIR is not set' });
  }
  if (!LOG_FILE) {
    return res.status(500).json({ error: 'LOG_FILE is not set' });
  }
  logStream.write(`Health check: ${new Date().toISOString()}\n`);
  res.json({ status: 'ok' });
});

app.get('/logs', (req, res) => {
  // Set response headers for Server-Sent Events
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  let fileSize = 0;

  // Initial send: existing logs
  try {
    if (fs.existsSync(LOG_FILE)) {
      const initialLogs = fs.readFileSync(LOG_FILE, 'utf8');
      if (initialLogs) {
        res.write(`data: ${JSON.stringify(initialLogs)}\n\n`);
        fileSize = Buffer.byteLength(initialLogs, 'utf8');
      }
    }
  } catch (err) {
    res.write(`data: "Error reading log file: ${err.message}"\n\n`);
  }

  // Watch for new logs as they appear
  const watcher = fs.watch(LOG_FILE, { encoding: 'utf8' }, (eventType) => {
    if (eventType === 'change') {
      try {
        const stats = fs.statSync(LOG_FILE);
        const newSize = stats.size;
        if (newSize > fileSize) {
          const stream = fs.createReadStream(LOG_FILE, { start: fileSize, end: newSize - 1, encoding: 'utf8' });
          stream.on('data', chunk => {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          });
          stream.on('end', () => {
            fileSize = newSize;
          });
        }
      } catch (err) {
        res.write(`data: "Error reading log file: ${err.message}"\n\n`);
      }
    }
  });

  // Clean up when client disconnects
  req.on('close', () => {
    watcher.close();
    res.end();
  });
});

app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Invalid messages format' });
    return;
  }

  // Get the last user message
  const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
  const prompt = lastUserMessage?.content || '';

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  if (!ANTHROPIC_API_KEY) {
    res.status(400).json({ error: 'ANTHROPIC_API_KEY is not set' });
    return;
  }

  try {
    const response = query({
      prompt: prompt,
      options: {
        cwd: WORKING_DIR,
        permissionMode: 'bypassPermissions'
      }
    });

    for await (const chunk of response) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      logStream.write(`${JSON.stringify(chunk)}\n`);
    }
    res.end();
  } catch (error) {
    res.write(`data: "Error: ${error.message}"\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
