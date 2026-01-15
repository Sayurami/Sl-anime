const axios = require("axios")
const cheerio = require("cheerio")
const nexara = require("@dark-yasiya/nexara")

const CREATOR = "VAJIRA"

module.exports = class AnimeClub2 {
    constructor() {}

    // =========================================================
    // 🔍 SEARCH
    // =========================================================
    async search(query) {
        try {
            const $ = await nexara(`https://animeclub2.com/?s=${encodeURIComponent(query)}`)
            const results = []

            $("article").each((i, el) => {
                const title = $(el).find("h2.entry-title a").text().trim()
                const link = $(el).find("h2.entry-title a").attr("href")
                const image = $(el).find("img").attr("src")
                const type = link?.includes("/movies/") ? "Movie" : "Series"

                if (title && link) {
                    results.push({
                        title,
                        link,
                        image,
                        type
                    })
                }
            })

            return {
                status: true,
                creator: CREATOR,
                data: results
            }

        } catch (e) {
            return {
                status: false,
                creator: CREATOR,
                error: e.message
            }
        }
    }

    // =========================================================
    // 🎬 MOVIE DETAILS + DOWNLOAD
    // =========================================================
    async movieDl(url) {
        try {
            if (!url.startsWith("https://animeclub2.com")) {
                throw new Error("Invalid AnimeClub2 URL")
            }

            const html = await axios.get(url)
            const $ = cheerio.load(html.data)

            const title = $("h1.entry-title").text().trim()
            const image = $(".poster img").attr("src")
            const description = $(".entry-content p").first().text().trim()

            // Ratings
            const imdb = $("strong:contains('IMDb')").parent().text().replace("IMDb", "").trim()
            const tmdb = $("strong:contains('TMDb')").parent().text().replace("TMDb", "").trim()

            // =================================================
            // 📥 DOWNLOAD LINKS
            // =================================================
            const downloads = []

            $(".entry-content a").each((i, el) => {
                const link = $(el).attr("href")
                const text = $(el).text().toLowerCase()

                let quality = "Unknown"
                if (text.includes("480")) quality = "480p"
                if (text.includes("720")) quality = "720p"
                if (text.includes("1080")) quality = "1080p"

                let source = null
                if (link?.includes("drive.google")) source = "GDrive"
                else if (link?.includes("mega.nz")) source = "Mega"
                else if (link?.includes("t.me")) source = "Telegram"

                if (source) {
                    downloads.push({
                        quality,
                        source,
                        link
                    })
                }
            })

            return {
                status: true,
                creator: CREATOR,
                data: {
                    title,
                    image,
                    description,
                    imdb,
                    tmdb,
                    downloads
                }
            }

        } catch (e) {
            return {
                status: false,
                creator: CREATOR,
                error: e.message
            }
        }
    }
}
