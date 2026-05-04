import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validations/userValidation.js';

export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, name, surname } = req.body;
    const candidate = await User.findOne({ email });
    if (candidate)
      return res
        .status(400)
        .json({ error: 'Користувач з таким email вже існує' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      name,
      surname,
      role: 'user',
    });

    res.status(201).json({ message: 'Користувача успішно зареєстровано' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера: ' + err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.json({
      accessToken: token,
      token,
      userId: user._id,
      name: user.name,
      surname: user.surname,
      role: user.role,
      subscriptionType: user.subscriptionType,
      statistics: user.statistics,
    });
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера: ' + err.message });
  }
};

export const updateStats = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!data || typeof data.correctAnswers === 'undefined') {
      return res.status(400).json({ error: 'Відсутні дані результатів тесту' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });

    const { resolvedMistakes } = data;
    if (resolvedMistakes && Array.isArray(resolvedMistakes)) {
      user.statistics.unitsPassed.forEach((unit) => {
        unit.mistakes = unit.mistakes.filter(id => !resolvedMistakes.includes(id));
      });
      user.statistics.randomTests.forEach((test) => {
        test.mistakes = test.mistakes.filter(id => !resolvedMistakes.includes(id));
      });
    }

    let isPassed = false;

    if (type === 'unit') {
      const total = data.totalQuestions || 20;
      isPassed = (data.correctAnswers / total) * 100 >= 80;
      user.statistics.unitsPassed.push({
        unitId: data.unitId || 'unknown',
        correctAnswers: data.correctAnswers,
        incorrectAnswers: data.incorrectAnswers,
        totalQuestions: total,
        timeSpent: data.timeSpent || 0,
        mistakes: data.mistakes || [],
        isPassed,
        date: new Date(),
      });
    } else if (type === 'random' || type === 'exam' || type === 'review') {
      isPassed = data.incorrectAnswers <= 2;
      user.statistics.randomTests.push({
        score: data.correctAnswers,
        total: data.totalQuestions || 20,
        incorrectAnswers: data.incorrectAnswers,
        timeSpent: data.timeSpent || 0,
        mistakes: data.mistakes || [],
        date: new Date(),
      });
    } else {
      return res.status(400).json({ error: 'Невірний тип статистики' });
    }

    await user.save();
    res.json({ message: 'Статистику оновлено', isPassed });
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера: ' + err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера: ' + err.message });
  }
};
