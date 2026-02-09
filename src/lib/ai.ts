const geminiKey = process.env.FINANCE_IA || process.env.FINANCE_GROK || "";
const groqKey = process.env.FINANCE_AI || "";
const openRouterKey = process.env.AIFINANCE || "";

async function callGemini(prompt: string) {
    if (!geminiKey) return null;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        if (data.error) {
            console.error("Gemini Error:", data.error.message || data.error);
            return null;
        }
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
        console.error("Gemini Fetch Error:", error);
        return null;
    }
}

async function callGroq(prompt: string) {
    if (!groqKey) return null;
    const url = "https://api.groq.com/openai/v1/chat/completions";
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });
        const data = await response.json();
        if (data.error) {
            console.error("Groq Error:", data.error.message || data.error);
            return null;
        }
        return data.choices?.[0]?.message?.content || null;
    } catch (error) {
        console.error("Groq Fetch Error:", error);
        return null;
    }
}

async function callOpenRouter(prompt: string) {
    if (!openRouterKey) return null;
    const url = "https://openrouter.ai/api/v1/chat/completions";
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openRouterKey}`,
                'HTTP-Referer': 'https://github.com/google/advanced-agentic-coding', // Requerido por OpenRouter
                'X-Title': 'OGFINANCE Assistant'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });
        const data = await response.json();
        if (data.error) {
            console.error("OpenRouter Error:", data.error.message || data.error);
            return null;
        }
        return data.choices?.[0]?.message?.content || null;
    } catch (error) {
        console.error("OpenRouter Fetch Error:", error);
        return null;
    }
}

export async function callAI(prompt: string) {
    // Intentar Gemini primero
    console.log("Intentando con Gemini...");
    let result = await callGemini(prompt);

    // Si falla, intentar Groq
    if (!result && groqKey) {
        console.log("Falla en Gemini, intentando con Groq...");
        result = await callGroq(prompt);
    }

    // Si falla Groq, intentar OpenRouter
    if (!result && openRouterKey) {
        console.log("Falla en Groq, intentando con OpenRouter...");
        result = await callOpenRouter(prompt);
    }

    return result;
}

export async function analyzeBudget(transactions: any[], budgets: any[]) {
    const prompt = `
    Eres un asistente financiero personal experto llamado OGFINANCE. 
    Analiza los siguientes datos de transacciones y presupuestos de los últimos meses y proporciona un informe conciso en español.
    
    Datos de Transacciones:
    ${JSON.stringify(transactions.slice(0, 50))} 
    
    Presupuestos Actuales:
    ${JSON.stringify(budgets)}
    
    Por favor, responde con:
    1. Un resumen breve de la salud financiera actual.
    2. Identifica las categorías donde el usuario gasta más.
    3. Proporciona 2-3 consejos específicos para ahorrar.
    4. Menciona presupuestos excedidos.
    
    Usa formato Markdown y asegúrate de responder en español.
    `;

    const result = await callAI(prompt);
    return result || "OGFINANCE no pudo analizar tus finanzas en este momento.";
}


export async function suggestBudgetLimit(categoryName: string, history: any[]) {
    const prompt = `
    Basado en el historial de gastos para la categoría "${categoryName}":
    ${JSON.stringify(history.slice(0, 20))}
    
    Sugiere un límite de presupuesto mensual realista en Lempiras (L). 
    Responde ÚNICAMENTE con el número (monto sugerido). Ej: 500.00
    `;

    const result = await callAI(prompt);
    if (!result) return null;

    const amount = parseFloat(result.trim().replace(/[^0-9.]/g, ''));
    return isNaN(amount) ? null : amount;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function chatWithAI(
    userMessage: string,
    transactions: any[],
    budgets: any[],
    conversationHistory: ChatMessage[] = []
) {
    // Build conversation context
    const historyContext = conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'Usuario' : 'OGFINANCE'}: ${msg.content}`)
        .join('\n\n');

    const prompt = `
Eres OGFINANCE, un asistente financiero personal experto, amigable y conversacional.
Tu objetivo es ayudar al usuario con sus finanzas personales de manera clara y útil.

=== DATOS FINANCIEROS DEL USUARIO ===
Transacciones recientes (últimos 3 meses):
${JSON.stringify(transactions.slice(0, 30), null, 2)}

Presupuestos actuales:
${JSON.stringify(budgets, null, 2)}

=== HISTORIAL DE CONVERSACIÓN ===
${historyContext || '(Esta es la primera interacción)'}

=== MENSAJE ACTUAL DEL USUARIO ===
${userMessage}

=== INSTRUCCIONES ===
1. Responde de forma conversacional y amigable, como un asesor financiero personal.
2. Usa los datos financieros reales del usuario para dar respuestas precisas.
3. Si el usuario pregunta por montos o estadísticas, calcula usando los datos proporcionados.
4. Mantén tus respuestas concisas pero informativas (máximo 200 palabras).
5. Usa formato Markdown para estructurar mejor tu respuesta cuando sea apropiado.
6. Si no tienes suficientes datos para responder algo específico, dilo honestamente.
7. Puedes hacer preguntas de seguimiento para entender mejor las necesidades del usuario.
8. Responde SIEMPRE en español.

Tu respuesta:`;

    const result = await callAI(prompt);
    return result || "Lo siento, no pude procesar tu mensaje en este momento. ¿Podrías intentar de nuevo?";
}

