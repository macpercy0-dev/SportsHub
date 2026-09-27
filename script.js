const SPORTS_TIMEZONE = "Africa/Dar_es_Salaam";

let selectedDateType = "today";
let selectedFilter = "all";

let currentMatches = [];

// ========================================
// AUTO REFRESH
// ========================================

let autoRefreshTimer = null;

const AUTO_REFRESH_TIME = 60 * 1000;

// ========================================
// SPORT BUTTON
// ========================================

function openSport(sport) {

    alert(
        sport +
        " section is coming soon!"
    );

}

// ========================================
// NEWS
// ========================================

function openNews() {

    window.location.href = "news.html";

}

// ========================================
// DATE
// ========================================

function getDateByOffset(offset) {

    const now = new Date();

    const date =
        new Date(
            now.toLocaleString(
                "en-US",
                {
                    timeZone:
                        SPORTS_TIMEZONE
                }
            )
        );

    date.setDate(
        date.getDate() + offset
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}

// ========================================
// SHORT DATE
// ========================================

function formatShortDate(dateString) {

    const date =
        new Date(
            dateString +
            "T12:00:00"
        );

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "2-digit"
        }
    );

}

// ========================================
// DATE LABELS
// ========================================

function updateDateLabels() {

    const yesterday =
        getDateByOffset(-1);

    const today =
        getDateByOffset(0);

    const tomorrow =
        getDateByOffset(1);

    const yesterdayElement =
        document.getElementById(
            "yesterdayDate"
        );

    const todayElement =
        document.getElementById(
            "todayDate"
        );

    const tomorrowElement =
        document.getElementById(
            "tomorrowDate"
        );

    if (yesterdayElement) {

        yesterdayElement.textContent =
            formatShortDate(
                yesterday
            );

    }

    if (todayElement) {

        todayElement.textContent =
            formatShortDate(
                today
            );

    }

    if (tomorrowElement) {

        tomorrowElement.textContent =
            formatShortDate(
                tomorrow
            );

    }

}

// ========================================
// SELECTED DATE
// ========================================

function getSelectedDate() {

    if (
        selectedDateType ===
        "yesterday"
    ) {

        return getDateByOffset(-1);

    }

    if (
        selectedDateType ===
        "tomorrow"
    ) {

        return getDateByOffset(1);

    }

    return getDateByOffset(0);

}

// ========================================
// MATCH STATUS
// ========================================

function getMatchStatus(match) {

    const code =
        match.fixture.status.short;

    const liveStatuses = [
        "1H",
        "2H",
        "HT",
        "ET",
        "BT",
        "P",
        "SUSP",
        "INT"
    ];

    if (
        liveStatuses.includes(code)
    ) {

        return "live";

    }

    const finishedStatuses = [
        "FT",
        "AET",
        "PEN"
    ];

    if (
        finishedStatuses.includes(code)
    ) {

        return "finished";

    }

    return "upcoming";

}

// ========================================
// MATCH TIME
// ========================================

function getMatchTime(
    match,
    statusType
) {

    const status =
        match.fixture.status;

    if (
        statusType ===
        "live"
    ) {

        if (
            status.elapsed !==
            null &&
            status.elapsed !==
            undefined
        ) {

            return (
                status.elapsed +
                "'"
            );

        }

        return "LIVE";

    }

    if (
        statusType ===
        "finished"
    ) {

        return "FT";

    }

    const date =
        new Date(
            match.fixture.date
        );

    return date.toLocaleTimeString(
        "en-GB",
        {
            timeZone:
                SPORTS_TIMEZONE,

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}

// ========================================
// FILTER
// ========================================

function filterMatches(matches) {

    if (
        selectedFilter ===
        "all"
    ) {

        return matches;

    }

    return matches.filter(
        function (match) {

            return (
                getMatchStatus(match) ===
                selectedFilter
            );

        }
    );

}

// ========================================
// SORT
// ========================================

function sortMatches(matches) {

    return matches.sort(
        function (a, b) {

            const statusA =
                getMatchStatus(a);

            const statusB =
                getMatchStatus(b);

            const priority = {

                live: 0,
                upcoming: 1,
                finished: 2

            };

            if (
                priority[statusA] !==
                priority[statusB]
            ) {

                return (
                    priority[statusA] -
                    priority[statusB]
                );

            }

            return (
                new Date(
                    a.fixture.date
                ) -
                new Date(
                    b.fixture.date
                )
            );

        }
    );

}

// ========================================
// LAST UPDATED
// ========================================

function updateLastUpdated(timestamp) {

    const element =
        document.getElementById(
            "lastUpdated"
        );

    if (!element) {

        return;

    }

    if (!timestamp) {

        element.textContent =
            "Last updated: --";

        return;

    }

    const date =
        new Date(timestamp);

    const time =
        date.toLocaleTimeString(
            "en-GB",
            {
                timeZone:
                    SPORTS_TIMEZONE,

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"
            }
        );

    element.textContent =
        "Last updated: " +
        time;

}

// ========================================
// RENDER MATCHES
// ========================================

function renderMatches() {

    const container =
        document.getElementById(
            "liveMatches"
        );

    if (!container) {

        return;

    }

    let matches =
        filterMatches(
            [...currentMatches]
        );

    if (
        matches.length === 0
    ) {

        container.innerHTML = `
            <div class="no-live">
                Hakuna mechi kwenye
                filter hii.
            </div>
        `;

        return;

    }

    matches =
        sortMatches(matches);

    const leagues = {};

    matches.forEach(
        function (match) {

            const leagueId =
                match.league.id;

            if (
                !leagues[leagueId]
            ) {

                leagues[leagueId] = {

                    name:
                        match.league.name,

                    country:
                        match.league.country,

                    logo:
                        match.league.logo,

                    matches: []

                };

            }

            leagues[
                leagueId
            ].matches.push(
                match
            );

        }
    );

    let html = "";

    Object.values(
        leagues
    ).forEach(
        function (league) {

            html += `
                <section class="score-league">

                    <div class="score-league-header">

                        <div class="league-name">

                            ${
                                league.logo
                                ?
                                `
                                <img
                                    src="${league.logo}"
                                    alt=""
                                >
                                `
                                :
                                ""
                            }

                            <span>
                                ${league.name}
                            </span>

                        </div>

                    </div>

                    <div class="league-line"></div>
            `;

            league.matches.forEach(
                function (match) {

                    const home =
                        match.teams.home;

                    const away =
                        match.teams.away;

                    const goals =
                        match.goals;

                    const statusType =
                        getMatchStatus(
                            match
                        );

                    const matchTime =
                        getMatchTime(
                            match,
                            statusType
                        );

                    let homeScore = "-";
                    let awayScore = "-";

                    if (
                        statusType !==
                        "upcoming"
                    ) {

                        homeScore =
                            goals.home ??
                            0;

                        awayScore =
                            goals.away ??
                            0;

                    }

                    let statusClass =
                        "status-upcoming";

                    if (
                        statusType ===
                        "live"
                    ) {

                        statusClass =
                            "status-live";

                    }

                    if (
                        statusType ===
                        "finished"
                    ) {

                        statusClass =
                            "status-finished";

                    }

                    html += `
                        <div class="score-match">

                            <div class="favorite">
                                ☆
                            </div>

                            <div class="score-teams">

                                <div class="score-team">

                                    <span>
                                        ${home.name}
                                    </span>

                                    ${
                                        home.logo
                                        ?
                                        `
                                        <img
                                            src="${home.logo}"
                                            alt=""
                                        >
                                        `
                                        :
                                        ""
                                    }

                                </div>

                                <div class="score-team">

                                    <span>
                                        ${away.name}
                                    </span>

                                    ${
                                        away.logo
                                        ?
                                        `
                                        <img
                                            src="${away.logo}"
                                            alt=""
                                        >
                                        `
                                        :
                                        ""
                                    }

                                </div>

                            </div>

                            <div class="score-result">

                                <div>
                                    ${homeScore}
                                </div>

                                <div>
                                    ${awayScore}
                                </div>

                            </div>

                            <div class="score-time">

                                <span
                                    class="${statusClass}"
                                >
                                    ${matchTime}
                                </span>

                            </div>

                        </div>

                        <div class="match-line"></div>
                    `;

                }
            );

            html += `
                </section>
            `;

        }
    );

    container.innerHTML =
        html;

}

// ========================================
// LOAD MATCHES
// ========================================

async function loadMatches(
    showLoading = true
) {

    const container =
        document.getElementById(
            "liveMatches"
        );

    if (!container) {

        return;

    }

    if (showLoading) {

        container.innerHTML = `
            <div class="loading-live">
                Inapakia mechi...
            </div>
        `;

    }

    try {

        const date =
            getSelectedDate();

        const response =
            await fetch(
                "/api/matches?date=" +
                encodeURIComponent(
                    date
                )
            );

        if (!response.ok) {

            throw new Error(
                "Server error: " +
                response.status
            );

        }

        const data =
            await response.json();

        if (!data.response) {

            throw new Error(
                "Hakuna data kutoka server."
            );

        }

        currentMatches =
            data.response;

        console.log(
            "Matches loaded:",
            currentMatches.length
        );

        console.log(
            "From cache:",
            data.cached
        );

        updateLastUpdated(
            data.cachedAt
        );

        renderMatches();

        updateSelectedDateLabel();

    }

    catch (error) {

        console.error(
            "Matches error:",
            error
        );

        container.innerHTML = `
            <div class="live-error">
                Server haipatikani.
            </div>
        `;

    }

}

// ========================================
// AUTO REFRESH
// ========================================

function startAutoRefresh() {

    stopAutoRefresh();

    autoRefreshTimer =
        setInterval(
            function () {

                if (
                    selectedDateType !==
                    "today"
                ) {

                    return;

                }

                console.log(
                    "Auto refresh..."
                );

                loadMatches(false);

            },
            AUTO_REFRESH_TIME
        );

}

// ========================================
// STOP AUTO REFRESH
// ========================================

function stopAutoRefresh() {

    if (
        autoRefreshTimer
    ) {

        clearInterval(
            autoRefreshTimer
        );

        autoRefreshTimer =
            null;

    }

}

// ========================================
// DATE TABS
// ========================================

function setupDateTabs() {

    const tabs =
        document.querySelectorAll(
            ".date-tab"
        );

    tabs.forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    tabs.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );

                    this.classList.add(
                        "active"
                    );

                    selectedDateType =
                        this.dataset.date;

                    selectedFilter =
                        "all";

                    document
                        .querySelectorAll(
                            ".status-tab"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    const allButton =
                        document.querySelector(
                            '.status-tab[data-filter="all"]'
                        );

                    if (allButton) {

                        allButton.classList.add(
                            "active"
                        );

                    }

                    loadMatches();

                }
            );

        }
    );

}

// ========================================
// STATUS TABS
// ========================================

function setupStatusTabs() {

    const tabs =
        document.querySelectorAll(
            ".status-tab"
        );

    tabs.forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    tabs.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );

                    this.classList.add(
                        "active"
                    );

                    selectedFilter =
                        this.dataset.filter;

                    renderMatches();

                }
            );

        }
    );

}

// ========================================
// DATE TITLE
// ========================================

function updateSelectedDateLabel() {

    const element =
        document.getElementById(
            "selectedDateLabel"
        );

    if (!element) {

        return;

    }

    if (
        selectedDateType ===
        "yesterday"
    ) {

        element.textContent =
            "Yesterday's Matches";

    }
    else if (
        selectedDateType ===
        "tomorrow"
    ) {

        element.textContent =
            "Tomorrow's Matches";

    }
    else {

        element.textContent =
            "Today's Matches";

    }

}

// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(
            ".navbar nav a"
        );

    navLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    navLinks.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );

                    this.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}

// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateDateLabels();

        setupDateTabs();

        setupStatusTabs();

        setupNavigation();

        loadMatches();

        startAutoRefresh();

    }
);