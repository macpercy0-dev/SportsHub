require("dotenv").config();

const express = require("express");

const app = express();

const PORT = 3000;
const TIMEZONE = "Africa/Dar_es_Salaam";

// ========================================
// CACHE
// ========================================

const cache = {};

const CACHE_TIME_TODAY = 2 * 60 * 1000;
const CACHE_TIME_OTHER = 30 * 60 * 1000;

// ========================================
// STATIC FILES
// ========================================

app.use(express.static(__dirname));

// ========================================
// STATUS
// ========================================

app.get("/api/status", function (req, res) {

    res.json({
        success: true,
        message: "Sports Hub backend is running!"
    });

});

// ========================================
// TANZANIA DATE
// ========================================

function getTanzaniaDate(offset = 0) {

    const now = new Date();

    const tanzaniaDate =
        new Date(
            now.toLocaleString(
                "en-US",
                {
                    timeZone: TIMEZONE
                }
            )
        );

    tanzaniaDate.setDate(
        tanzaniaDate.getDate() + offset
    );

    const year =
        tanzaniaDate.getFullYear();

    const month =
        String(
            tanzaniaDate.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            tanzaniaDate.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// ========================================
// MATCHES API
// ========================================

app.get("/api/matches", async function (req, res) {

    try {

        let requestedDate =
            req.query.date;

        if (!requestedDate) {

            requestedDate =
                getTanzaniaDate(0);

        }

        const datePattern =
            /^\d{4}-\d{2}-\d{2}$/;

        if (
            !datePattern.test(
                requestedDate
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Tarehe si sahihi."

            });

        }

        // ========================================
        // CHECK CACHE
        // ========================================

        const cached =
            cache[requestedDate];

        const today =
            getTanzaniaDate(0);

        const cacheTime =
            requestedDate === today
                ? CACHE_TIME_TODAY
                : CACHE_TIME_OTHER;

        if (
            cached &&
            Date.now() - cached.timestamp <
            cacheTime
        ) {

            console.log(
                "CACHE HIT:",
                requestedDate
            );

            return res.json({

                success: true,

                date:
                    requestedDate,

                timezone:
                    TIMEZONE,

                cached: true,

                cachedAt:
                    cached.timestamp,

                results:
                    cached.data.results || 0,

                response:
                    cached.data.response || []

            });

        }

        // ========================================
        // API REQUEST
        // ========================================

        console.log(
            "API REQUEST:",
            requestedDate
        );

        const apiURL =
            "https://v3.football.api-sports.io/fixtures" +
            "?date=" +
            encodeURIComponent(
                requestedDate
            ) +
            "&timezone=" +
            encodeURIComponent(
                TIMEZONE
            );

        const response =
            await fetch(
                apiURL,
                {
                    headers: {

                        "x-apisports-key":
                            process.env.API_FOOTBALL_KEY

                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                "API HTTP Error: " +
                response.status
            );

        }

        const data =
            await response.json();

        // ========================================
        // API ERROR
        // ========================================

        if (
            data.errors &&
            Object.keys(
                data.errors
            ).length > 0
        ) {

            console.error(
                "API Error:",
                data.errors
            );

            return res.status(500).json({

                success: false,

                errors:
                    data.errors

            });

        }

        // ========================================
        // SAVE CACHE
        // ========================================

        const updatedAt =
            Date.now();

        cache[requestedDate] = {

            timestamp:
                updatedAt,

            data: {

                results:
                    data.results || 0,

                response:
                    data.response || []

            }

        };

        // ========================================
        // RESPONSE
        // ========================================

        res.json({

            success: true,

            date:
                requestedDate,

            timezone:
                TIMEZONE,

            cached: false,

            cachedAt:
                updatedAt,

            results:
                data.results || 0,

            response:
                data.response || []

        });

    }

    catch (error) {

        console.error(
            "Matches error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Imeshindikana kupata mechi."

        });

    }

});

// ========================================
// START SERVER
// ========================================

app.listen(
    PORT,
    function () {

        console.log(
            "Sports Hub server running at http://localhost:" +
            PORT
        );

    }
);