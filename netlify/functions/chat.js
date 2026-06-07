exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.GROQ_API_KEY;

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { messages } = body;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Você é um tutor inteligente especializado no ENEM. Seu papel é:
- Explicar conteúdos de todas as matérias do ENEM (Matemática, Português, História, Geografia, Física, Química, Biologia, Inglês/Espanhol, Filosofia, Sociologia, Artes, Educação Física)
- Usar linguagem simples, clara e acessível para estudantes do ensino médio
- Dar exemplos práticos e do cotidiano para facilitar o entendimento
- Resolver exercícios passo a passo, explicando cada etapa
- Relacionar os conteúdos com as competências e habilidades do ENEM
- Ser encorajador e motivador
- Usar emojis com moderação para tornar a conversa mais amigável
- Quando resolver exercícios, mostrar o raciocínio completo
- Sugerir dicas de memorização quando relevante
Responda sempre em português brasileiro.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.error) {
      return { statusCode: 500, body: JSON.stringify({ error: data.error.message }) };
    }

    const reply = data.choices[0].message.content;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
