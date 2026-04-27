require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { getTwitterProfile } = require('./TwitterAPI');
const { generateTokenStats } = require('./analyzer');

const app = express();
app.use(cors()); // Дозволяє фронтенду звертатися до нашого АПІ
app.use(express.json());
app.use(express.static(__dirname));
const cache = {};

// Наш головний роут
app.get('/api/analyze/:handle', async (req, res) => {
    const { handle } = req.params;

    try {
        // 1. Отримуємо дані профілю через RapidAPI
        const twitterData = await getTwitterProfile(handle);
        if (!twitterData) {
            return res.status(404).json({ error: "Юзер відсутній у базі X" });
        }

        // 2. Геруємо токсичну статистику (твій analyzer.js)
        const stats = await generateTokenStats(twitterData);

        // 3. Склеюємо все докупи і віддаємо фронту
        res.json({
            ...twitterData, // Тут name, bio, followers, avatarUrl
            ...stats        // Тут ticker, basePrice, marketCap, holders, verdict
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Помилка терміналу" });
    }
});

const PORT = process.env.PORT || 3000;
// Додали '0.0.0.0', щоб сервер світився назовні
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер крутиться на порту ${PORT}`);
});