const axios = require('axios');
require('dotenv').config();

async function getTwitterProfile(handle) {
    const options = {
        method: 'GET',
        url: 'https://twitter-api-v1-1-enterprise.p.rapidapi.com/base/apitools/UserByScreenName',
        params: { screenName: handle },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'twitter-api-v1-1-enterprise.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);

        // Дістаємо дані з глибини JSON, яку ми бачили на твоїх скрінах
        const userResult = response.data?.data?.data?.user?.result;
        const legacy = userResult?.legacy;

        if (!legacy) return null;

        // Чистимо посилання на аватарку, щоб вона була великою і красивою
        const bigAvatar = legacy.profile_image_url_https
            ? legacy.profile_image_url_https.replace('_normal', '_400x400')
            : null;

        return {
            name: legacy.name,
            handle: legacy.screen_name,
            bio: legacy.description,
            followers: legacy.followers_count,
            following: legacy.friends_count,
            joined: legacy.created_at,
            avatar: bigAvatar
        };
    } catch (error) {
        console.error("Помилка при запиті до X API:", error.message);
        return null;
    }
}

module.exports = { getTwitterProfile };