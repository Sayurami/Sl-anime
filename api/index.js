const AnimeClub2 = require("../scraper/animeclub2")

export default async function handler(req, res) {
    const anime = new AnimeClub2()
    const { action, q, url } = req.query

    try {
        // 🔍 SEARCH
        if (action === "search") {
            if (!q) {
                return res.status(400).json({ status: false, message: "Missing query" })
            }

            const result = await anime.search(q)
            return res.status(200).json(result)
        }

        // 🎬 MOVIE DOWNLOAD
        if (action === "movie") {
            if (!url) {
                return res.status(400).json({ status: false, message: "Missing movie url" })
            }

            const result = await anime.movieDl(url)
            return res.status(200).json(result)
        }

        // ❌ INVALID
        return res.status(404).json({
            status: false,
            message: "Invalid action"
        })

    } catch (e) {
        return res.status(500).json({
            status: false,
            error: e.message
        })
    }
}
