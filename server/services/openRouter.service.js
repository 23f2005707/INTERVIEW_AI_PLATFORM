import axios from 'axios'


export const askAI = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.")
        }

        // response fetch by axios
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",

            {
                model: "openai/gpt-4o-mini",
                messages: messages
            },

            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',

                },
            }
        );

        // give the content of the messages 
        const content = response?.data?.choices?.[0]?.message?.content;

        // content not present in message
        if(!content || !content.trim()) {
            throw new Error("AI returned empty response.");
        }

        return content;
    }

    catch (err) {
        console.error("OpenRouter Error:", err.response?.data || err.message);
        throw new Error("OpenRouter API Error");

    }
}