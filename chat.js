const messages = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      const message = {
        text,
        time: new Date().toISOString()
      };
      
      messages.push(message);
      
      // Ограничиваем количество сообщений
      if (messages.length > 50) {
        messages.shift();
      }
      
      res.status(200).json({ success: true, message });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process message' });
    }
  } else if (req.method === 'GET') {
    res.status(200).json({ messages });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 