const express = require('express');
const Readme = require('../models/Readme');

const router = express.Router();

function slugify(value) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug || 'project';
}

router.post('/', async (req, res) => {
  const { projectName, description, features } = req.body || {};
  const cleanName = typeof projectName === 'string' ? projectName.trim() : '';
  const cleanDescription = typeof description === 'string' ? description.trim() : '';
  const cleanFeatures = Array.isArray(features)
    ? features.filter((feature) => typeof feature === 'string').map((feature) => feature.trim()).filter(Boolean)
    : [];

  if (
    !cleanName ||
    cleanName.length > 100 ||
    !cleanDescription ||
    cleanDescription.length > 2000 ||
    cleanFeatures.length > 20 ||
    cleanFeatures.some((feature) => feature.length > 200)
  ) {
    return res.status(400).json({
      message: 'Enter a project name, description, and up to 20 features (each up to 200 characters).'
    });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: 'README generation is not configured: GEMINI_API_KEY is missing.' });
  }

  const featureList = cleanFeatures.length
    ? cleanFeatures.map((feature) => `- ${feature}`).join('\n')
    : '- No features provided';
  const prompt = [
    'Write a clear, useful draft README.md in Markdown for the software project below.',
    'Include a title, overview, features, setup/installation, usage, and a suitable license placeholder.',
    'Do not invent commands, dependencies, or project details that were not provided; mark unknown setup details as TODO.',
    'Return only the README Markdown, without surrounding code fences.',
    `Project name: ${cleanName}`,
    `Description: ${cleanDescription}`,
    `Key features:\n${featureList}`
  ].join('\n\n');

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL || 'gemini-2.5-flash')}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
        })
      }
    );
  } catch (err) {
    console.error('Gemini API request failed:', err);
    return res.status(502).json({ message: 'Could not reach the Gemini API. Please try again.' });
  }

  if (!response.ok) {
    console.error(`Gemini API returned HTTP ${response.status}.`);
    return res.status(502).json({ message: 'Gemini could not generate the README. Check the API key and model.' });
  }

  const result = await response.json();
  const content = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();
  if (!content) {
    console.error('Gemini API response did not contain generated text.');
    return res.status(502).json({ message: 'Gemini returned an empty README. Please try again.' });
  }

  const savedReadme = await Readme.create({
    projectName: cleanName,
    description: cleanDescription,
    features: cleanFeatures,
    content
  });

  return res.status(201).json({
    id: savedReadme.id,
    fileName: `${slugify(cleanName)}-README.md`,
    readme: content
  });
});

module.exports = router;
