import mongoose from 'mongoose';

/**
 * GET ALL LECTURES
 */
export const getAllLectures = async (req, res) => {
    try {
        const lectures = await mongoose.connection.db
            .collection('lectures')
            .find({})
            .toArray();

        res.status(200).json(lectures);
    } catch (err) {
        console.error("Помилка при завантаженні лекцій:", err);
        res.status(500).json({ error: "Помилка сервера при отриманні лекцій." });
    }
};

/**
 * CREATE NEW LECTURE
 */
export const createLecture = async (req, res) => {
    try {
        const { topic_id, topic_prefix, title, content_html } = req.body;

        if (!topic_id || !title) {
            return res.status(400).json({ error: "Поля topic_id та title є обов'язковими." });
        }

        const newLecture = {
            topic_id,
            topic_prefix: topic_prefix || `${topic_id}_`,
            title,
            content_html: content_html || ""
        };

        const result = await mongoose.connection.db
            .collection('lectures')
            .insertOne(newLecture);

        res.status(201).json({ _id: result.insertedId, ...newLecture });
    } catch (err) {
        console.error("Помилка при створенні лекції:", err);
        res.status(500).json({ error: "Не вдалося створити лекцію." });
    }
};

/**
 * UPDATE LECTURE (PUT)
 */
export const updateLecture = async (req, res) => {
    try {
        const { id } = req.params;
        const { topic_id, topic_prefix, title, content_html } = req.body;

        const result = await mongoose.connection.db
            .collection('lectures')
            .updateOne(
                { _id: new mongoose.Types.ObjectId(id) },
                {
                    $set: {
                        topic_id,
                        topic_prefix,
                        title,
                        content_html
                    }
                }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Лекцію не знайдено." });
        }

        res.status(200).json({ message: "Лекцію успішно оновлено." });
    } catch (err) {
        console.error("Помилка при оновленні лекції:", err);
        res.status(500).json({ error: "Не вдалося оновити лекцію." });
    }
};

/**
 * DELETE LECTURE
 */
export const deleteLecture = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await mongoose.connection.db
            .collection('lectures')
            .deleteOne({ _id: new mongoose.Types.ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Лекцію не знайдено." });
        }

        res.status(200).json({ message: "Лекцію успішно видалено." });
    } catch (err) {
        console.error("Помилка при видаленні лекції:", err);
        res.status(500).json({ error: "Не вдалося видалити лекцію." });
    }
};