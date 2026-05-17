const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Успішно підключено до MongoDB Atlas для завантаження відгуків!");

        const database = client.db('pdr');
        const collection = database.collection('reviews'); // назва колекції у БД

        const rawData = fs.readFileSync('reviews.json', 'utf8');
        const reviews = JSON.parse(rawData);

        const result = await collection.insertMany(reviews);
        console.log(`Успішно! Додано нових відгуків до бази: ${result.insertedCount}`);

    } catch (error) {
        console.error("Помилка під час імпорту відгуків:", error);
    } finally {
        await client.close();
    }
}

run();