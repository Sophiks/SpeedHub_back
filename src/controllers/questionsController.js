import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';
import Question from '../models/question.js';

const formatQuestionsWithImages = (req, questions) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/images/`;

  return questions.map((q) => {
    const doc = q.toObject ? q.toObject() : q;

    if (doc.image && Array.isArray(doc.image)) {
      doc.image = doc.image.map((img) => {

        if (img.startsWith('http')) return img;

        return `${baseUrl}${img}`;
      });
    }
    return doc;
  });
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    const formatted = formatQuestionsWithImages(req, questions);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера: ' + err.message });
  }
};

export const getRandomTest = async (req, res) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 20 } }]);
    const formatted = formatQuestionsWithImages(req, questions);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера: ' + err.message });
  }
};

export const getQuestionsByUnit = async (req, res) => {
  let { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Вкажіть номер розділу' });
  }

  try {
    const unitNumber = id.toLowerCase().startsWith('r') ? id.substring(1) : id;

    const questions = await Question.find({
      id: { $regex: `^r${unitNumber}q`, $options: 'i' },
    });

    if (questions.length === 0) {
      return res.status(404).json({ message: `Питання не знайдені` });
    }

    const formatted = formatQuestionsWithImages(req, questions);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера: ' + err.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Це Mongo _id (ObjectId)
    const { question, correct_option_id, options, existingImages, customId } = req.body;

    const parsedOptions = JSON.parse(options); // Очікуємо ['Варіант 1', 'Варіант 2'...]
    const parsedExisting = JSON.parse(existingImages || '[]');

    const formattedOptions = parsedOptions.map((text, index) => ({
      id: index + 1,
      text: text
    }));

    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.buffer, 'speedhub_questions')
      );
      newImageUrls = await Promise.all(uploadPromises);
    }

    const finalImages = [...parsedExisting, ...newImageUrls];

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        id: customId,
        question: question,
        correct_option_id: Number(correct_option_id),
        options: formattedOptions,
        image: finalImages,
      },
      { new: true }
    );

    if (!updatedQuestion) return res.status(404).json({ error: 'Питання не знайдено' });


    const formatted = formatQuestionsWithImages(req, [updatedQuestion]);
    res.json(formatted[0]);

  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Помилка оновлення: ' + err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Це Mongo _id

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Питання не знайдено' });
    }

    res.json({ message: 'Питання успішно видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка при видаленні: ' + err.message });
  }
};

export const getQuestionsByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Надайте масив ID питань' });
    }

    const questions = await Question.find({ id: { $in: ids } });

    const formatted = formatQuestionsWithImages(req, questions);

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера: ' + err.message });
  }
};
