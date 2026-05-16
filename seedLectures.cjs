const { MongoClient } = require('mongodb');
require('dotenv').config();
const allLectures = require('./data.json');

async function main() {
    const uri = process.env.MONGO_URL;

    if (!uri) {
        console.error("Помилка: MONGO_URL не знайдено у файлі .env!");
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db('pdr');
        const lecturesCollection = database.collection('lectures');

        console.log("Очищення старої колекції лекцій у хмарі MongoDB Atlas...");
        await lecturesCollection.deleteMany({});

        console.log(`Знайдено лекцій у файлі data.json: ${allLectures.length}`);
        console.log("Починаємо завантаження в хмарну базу даних...");

        const result = await lecturesCollection.insertMany(allLectures);

        console.log(`Успішно! Додано лекцій до хмарної бази 'pdr': ${result.insertedCount}`);

    } catch (error) {
        console.error("Помилка під час завантаження даних:", error);
    } finally {
        await client.close();
    }
}

main().catch(console.error);