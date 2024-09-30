// AIzaSyDiI9G_doVBCLGJX2xsiychPYKT3uKxtzE
const express = require('express')
const cors = require('cors')
const { getSubtitles } = require('youtube-captions-scraper') // Імпорт бібліотеки
const OpenAI = require('openai');

const app = express()
app.use(express.json())
app.use(cors())

  const openai = new OpenAI({
    apiKey: 'sk-svcacct-6Bx1Og6HHatOmiKzEDm9M3YlAr6IyJ4fjGJIREepH4Z_iqitETG1xwTi5uNYvWl1AT3BlbkFJsbOUoWwySvVctJ-gR7zKxXEmJWtilkRPK6ks3cW2oCVr1MLdCHlY-ebLYIAB8FtAA', // Замініть на свій реальний ключ OpenAI
  });

// Функція для перетворення секунд у формат часу MM:SS
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Функція для визначення рекламних таймкодів з використанням OpenAI
const detectAdvertisementsWithAI = async (transcript) => {
    try {
        const transcriptText = transcript.map((entry) => entry.text).join(' ')

        // Запит до OpenAI з текстом транскрипції
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            prompt: `Detect advertisement segments in the following YouTube transcript:\n${transcriptText}\n\nReturn the segments with start and end time in this format:\n[{"start_time": "MM:SS", "end_time": "MM:SS"}]`,
            max_tokens: 500,
            temperature: 0.2,
        })

        // Парсинг відповіді моделі
        const adTimings = JSON.parse(response.data.choices[0].text.trim())
        return adTimings
    } catch (error) {
        console.error('Error detecting ads with AI:', error)
        return []
    }
}

// Ендпоінт для визначення реклами у відео
app.post('/detect_ads', async (req, res) => {
    const { youtube_url } = req.body

    if (!youtube_url) {
        return res.status(400).json({ error: 'YouTube URL not provided' })
    }

    // Витягання ID відео з URL
    const videoId = youtube_url.split('v=')[1]?.split('&')[0] || youtube_url.split('/').pop()

    try {
        // Отримання субтитрів відео за допомогою youtube-captions-scraper
        let subtitles
        try {
            subtitles = await getSubtitles({
                videoID: videoId,
                lang: 'uk', // Заміна на потрібну мову, наприклад, 'ru' для російської або 'uk' для української
            })
        } catch (e) {
            try {
                subtitles = await getSubtitles({
                    videoID: videoId,
                    lang: 'ru', // Заміна на потрібну мову, наприклад, 'ru' для російської або 'uk' для української
                })
            } catch (e) {
                subtitles = await getSubtitles({
                    videoID: videoId,
                    lang: 'en', // Заміна на потрібну мову, наприклад, 'ru' для російської або 'uk' для української
                })
            }
        }

        console.log('subtitles', subtitles)

        if (!subtitles || subtitles.length === 0) {
            return res.status(400).json({ error: 'No subtitles available for this video.' })
        }

        // Додання тривалості для кожного сегменту субтитрів (approximation)
        const transcript = subtitles.map((entry, index) => ({
            start: entry.start,
            duration: (subtitles[index + 1]?.start || entry.start + 5) - entry.start, // Приблизна тривалість
            text: entry.text,
        }))

        // Визначення рекламних вставок у транскрипції
        const adTimings = detectAdvertisementsWithAI(transcript)
        console.log('adTimings', adTimings)

        return res.status(200).json({ ad_timings: adTimings, transcript })
    } catch (error) {
        console.error('Error fetching subtitles:', error)
        return res.status(500).json({ error: 'Could not retrieve subtitles.' })
    }
})

// Запуск сервера
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
