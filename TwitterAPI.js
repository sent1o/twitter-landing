const axios = require('axios'); // Оцей рядок ти випадково видалив )
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const formatNumber = (num) => {
    if (!num) return "0";
    // Перетворить 239527529 на 239.53M, а 1320 на 1.32K
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 2 }).format(num);
};

console.log("TEST ENV:", process.env.RAPIDAPI_KEY ? "Ключ на місці!" : "UNDEFINED ❌");

async function getTwitterProfile(handle) {
    const options = {
        method: 'GET',
        url: 'https://twitter-api-v1-1-enterprise.p.rapidapi.com/base/apitools/userByScreenNameV2',
        params: {
            screenName: handle,
            // Цей внутрішній ключ АПІшки залишаємо як є
            apiKey: '2WLXZk9kacMXhHxj2cRg19bsuJ98XiQL0ndQ94kMdciuz|1574242047661207552-3jI04wPRb0tVkUfFjR4VzJW19ZnQz3',
            resFormat: 'json'
        },
        headers: {
            'x-rapidapi-key': (process.env.RAPIDAPI_KEY || "").trim(),
            'x-rapidapi-host': 'twitter-api-v1-1-enterprise.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);

        const userResult = response.data?.data?.data?.user?.result;
        const legacy = userResult?.legacy;

        if (!legacy) {
            console.log("❌ Юзера не знайдено в JSON");
            return null;
        }

        return {
            name: legacy.name,
            handle: legacy.screen_name,
            bio: legacy.description,
            followers: formatNumber(legacy.followers_count),
            following: formatNumber(legacy.friends_count),
            joined: legacy.created_at,
            avatar: legacy.profile_image_url_https ? legacy.profile_image_url_https.replace('_normal', '_400x400') : null
        };
    } catch (error) {
        if (error.response) {
            console.log("❌ Відповідь сервера:", error.response.data);
        } else {
            console.error("❌ Помилка запиту:", error.message);
        }
        return null;
    }
}

module.exports = { getTwitterProfile };