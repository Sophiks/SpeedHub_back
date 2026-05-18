import Question from '../models/question.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

/**
 * helper
 */
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

/**
 * GET ALL
 */
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(formatQuestionsWithImages(req, questions));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * RANDOM TEST
 */
export const getRandomTest = async (req, res) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 20 } }]);
    res.json(formatQuestionsWithImages(req, questions));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * BY UNIT
 */
export const getQuestionsByUnit = async (req, res) => {
  try {
    let { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Вкажіть unit id' });
    }

    const unitNumber = id.toLowerCase().startsWith('r')
        ? id.substring(1)
        : id;

    const questions = await Question.find({
      id: { $regex: `^r${unitNumber}q`, $options: 'i' },
    });

    if (!questions.length) {
      return res.status(404).json({ message: 'Не знайдено' });
    }

    res.json(formatQuestionsWithImages(req, questions));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * CREATE QUESTION (🔥 FIXED + DUPLICATE CHECK)
 */
export const createQuestion = async (req, res) => {
  try {
    const {
      id, // 👈 твій custom question code (r1q5)
      question,
      correct_option_id,
      options,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id обовʼязковий (наприклад r1q5)' });
    }

    // 🔥 CHECK DUPLICATE
    const exists = await Question.findOne({ id });
    if (exists) {
      return res.status(409).json({
        error: 'Питання з таким id вже існує',
      });
    }

    const parsedOptions = JSON.parse(options || '[]');

    const formattedOptions = parsedOptions.map((text, index) => ({
      id: index + 1,
      text,
    }));

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.buffer, 'speedhub_questions')
      );

      imageUrls = await Promise.all(uploadPromises);
    }

    const newQuestion = await Question.create({
      id,
      question,
      correct_option_id: Number(correct_option_id),
      options: formattedOptions,
      image: imageUrls,
    });

    res.status(201).json(formatQuestionsWithImages(req, [newQuestion])[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE QUESTION (Mongo _id)
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      question,
      correct_option_id,
      options,
      existingImages,
      newId,
    } = req.body;

    const parsedOptions = JSON.parse(options || '[]');
    const parsedExisting = JSON.parse(existingImages || '[]');

    const formattedOptions = parsedOptions.map((text, index) => ({
      id: index + 1,
      text,
    }));

    let newImages = [];

    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((file) =>
          uploadToCloudinary(file.buffer, 'speedhub_questions')
      );

      newImages = await Promise.all(uploads);
    }

    const finalImages = [...parsedExisting, ...newImages];

    const updated = await Question.findByIdAndUpdate(
        id,
        {
          ...(newId && { id: newId }), // optional rename
          question,
          correct_option_id: Number(correct_option_id),
          options: formattedOptions,
          image: finalImages,
        },
        { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Не знайдено' });
    }

    res.json(formatQuestionsWithImages(req, [updated])[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Question.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Не знайдено' });
    }

    res.json({ message: 'Видалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET BY IDS (custom id field)
 */
export const getQuestionsByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids має бути масивом' });
    }

    const questions = await Question.find({ id: { $in: ids } });

    res.json(formatQuestionsWithImages(req, questions));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};