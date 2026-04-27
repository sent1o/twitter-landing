require('dotenv').config();
const { getTwitterProfile } = require('./TwitterAPI'); // перевір назву файлу (TwitterAPI.js)

async function test() {
    console.log("🚀 Тестуємо RapidAPI для @elonmusk...");
    const data = await getTwitterProfile('elonmusk');
    if (data) {
        console.log("✅ Дані отримано успішно:");
        console.log(data);
    } else {
        console.log("❌ Щось пішло не так. Перевір ключі або URL в TwitterAPI.js");
    }
}

test();