require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function parseTwitterCount(str) {
    if (!str || str === "0") return 0;
    // Видаляємо коми та пробіли, лишаємо цифри і суфікси
    const clean = str.toString().toLowerCase().replace(/,/g, '').trim();
    let num = parseFloat(clean);
    if (clean.includes('k')) num *= 1000;
    if (clean.includes('m')) num *= 1000000;
    return num;
}

async function generateTokenStats(twitterData) {
    const followersCount = parseTwitterCount(twitterData.followers);
    const followingCount = parseTwitterCount(twitterData.following);

    // 1. Розрахунок Market Cap ($15 за фоловера, мінімум $10 для щиткоїнів)
    const mcapValue = followersCount > 0 ? followersCount * 15 : 10;
    const mktCapFormatted = `$${mcapValue.toLocaleString('en-US')}`;

    // 2. Логіка холдерів (робимо вигляд, що 5-12% підписників купили токен)
    // Якщо 0 фоловерів — ставимо 1-2 "розробника"
    const holdersCount = followersCount > 0
        ? Math.floor(followersCount * (0.05 + Math.random() * 0.07))
        : Math.floor(Math.random() * 2) + 1;

    // 3. Базова ціна для графіка (Supply = 1 млрд)
    const basePriceCalc = mcapValue / 1000000;

    // 4. Ризик скаму
    let rugRisk = "Low";
    let ratioRoast = "";

    if (followersCount === 0) {
        rugRisk = "DEAD PROJECT";
        ratioRoast = "Screaming into the void. 0 liquidity.";
    } else if (followingCount > followersCount * 5) {
        rugRisk = "HIGH (DESPERATE)";
        ratioRoast = "Follow-back beggar. Pure exit liquidity.";
    } else if (followersCount > followingCount * 50) {
        rugRisk = "LOW (CULT LEADER)";
        ratioRoast = "Doesn't follow back. God complex.";
    } else if (followingCount > followersCount) {
        rugRisk = "MEDIUM (SIMP)";
        ratioRoast = "Following more people than followers. Sad.";
    } else {
        rugRisk = "SAFE";
        ratioRoast = "Average normie ratio.";
    }

    const prompt = `
    Act as a toxic crypto degenerate and tokenomics expert. 
    Analyze this X profile:
    Name: ${twitterData.name}
    Bio: ${twitterData.bio}
    Followers: ${twitterData.followers}
    Joined X: ${twitterData.joined}

    TASK:
    1. Write a 2-sentence brutal roast. 
    Sentence 1: Roast their account age/entry point.
    Sentence 2: A toxic verdict on their meme coin potential.
    Constraint: Use crypto slang (rug, moon, bags, jeet), max 30 words total. 

    2. Determine a 'Listing Price' based on followers:
    - > 1M: $100.0 - $10000.0
    - 1K - 100K: $1.0 - $10.0
    - < 100: $0.0001

    IMPORTANT: Return ONLY a valid JSON object:
    {
    "roast": "your_text_here",
    "ai_price": numeric_value
    }
    `;

    try {
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200,
            response_format: { type: "json_object" }
        });

        const rawContent = aiResponse.choices[0].message.content.trim();
        let aiData;
        try {
            aiData = JSON.parse(rawContent);
        } catch (e) {
            aiData = { roast: rawContent, ai_price: basePriceCalc };
        }

        return {
            ticker: `$${twitterData.name.replace(/\s+/g, '').substring(0, 4).toUpperCase()}`,
            marketCap: mktCapFormatted,
            // Якщо ШІ видав адекватну ціну — беремо її, інакше нашу розрахункову
            basePrice: aiData.ai_price || basePriceCalc,
            holders: holdersCount,
            rugRisk: rugRisk,
            ratioRoast: ratioRoast,
            verdict: aiData.roast
        };

    } catch (error) {
        console.error("OpenAI Error:", error);
        return {
            error: "Failed to generate stats",
            verdict: "AI is down. Market is crashing. Pure chaos.",
            marketCap: mktCapFormatted,
            basePrice: basePriceCalc
        };
    }
}

module.exports = { generateTokenStats };