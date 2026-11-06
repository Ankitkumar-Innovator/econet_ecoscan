/**
 * EcoScan Onboarding: "Report waste, earn XP"  (ONE file, nothing else to change)
 * Add this line in index.html right after <script src="app.js"></script>:
 *     <script src="onboarding.js"></script>
 *
 * Idea: users report where they see waste and earn XP for keeping the country clean.
 *
 * No storage, no network calls, no paid services, no database: everything stays on the page.
 */
(function () {
    "use strict";

    /* ====== Easy settings ====== */
    var XP_PER_REPORT = 20;      // XP given for each report
    var MAX_REWARDED_PER_VISIT = 5; // reports per page visit that earn XP (stops spamming)
    var SHOW_WELCOME_ON_LOAD = false; // true = show the welcome pop-up on every page load
    var TYPES = ["Dry Waste", "Wet Waste", "Hazardous", "E-Waste", "Other"];

    // Lines shown in the big banner (rotate every 6 seconds). Edit freely.
    var QUOTES = [
        "Our country is our home. Be the one who notices. 💚",
        "One report today can mean a cleaner street tomorrow. 🌱",
        "You don't need to clean it all. Just show us where it is. 📍",
        "Small action. Real change. A cleaner country starts with you. 🌍",
        "Someone cares enough to look. That someone is you. ✨"
    ];
    var THANKS = [
        "You just made your country a little cleaner. Thank you 💚",
        "Because you noticed, someone can now clean it up. Thank you 🌱",
        "That is how a nation changes: one caring person at a time 🌍"
    ];

    /* ====== Helpers ====== */
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function today() { return new Date().toISOString().slice(0, 10); }
    function who() { return typeof userName === "string" ? userName : "Student"; }
    function xp() { return typeof userXp === "number" ? userXp : 0; }

    var reports = [];   // reports of this visit only (kept in memory, never saved)
    var view = "welcome", message = "", box, btn, quoteIdx = 0;

    /* ====== Look ====== */
    var css = document.createElement("style");
    css.textContent =
        ".ob-card{padding:0;max-width:480px}" +
        ".ob-head{background:linear-gradient(135deg,#1b4332,#2d6a4f);color:#fff;padding:22px 56px 16px 24px;border-radius:20px 20px 0 0}" +
        ".ob-head h2{font-size:1.4rem;margin-bottom:2px}.ob-head p{font-size:.9rem;opacity:.92}" +
        ".ob-body{padding:16px 24px 6px;font-size:.93rem;color:#334155;line-height:1.5}" +
        ".ob-step{display:flex;gap:12px;align-items:center;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 12px;margin-bottom:8px}" +
        ".ob-step span{font-size:1.5rem}.ob-step b{display:block;color:#166534}" +
        ".ob-body label{display:block;font-weight:600;margin:10px 0 4px}" +
        ".ob-body input,.ob-body select,.ob-body textarea{width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:1rem;font-family:inherit}" +
        ".ob-msg{margin-top:12px;padding:10px 12px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;color:#92400e;font-weight:600}" +
        ".ob-list{margin-top:14px}.ob-list h4{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:6px}" +
        ".ob-item{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:7px 10px;margin-bottom:6px;font-size:.88rem}" +
        ".ob-item small{color:#64748b}" +
        ".ob-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 24px 20px}" +
        ".ob-btn{border:0;border-radius:10px;padding:11px 18px;font-weight:700;cursor:pointer;background:#2e7d32;color:#fff;font-size:.95rem}" +
        ".ob-btn.grey{background:#f1f5f9;color:#475569}" +
        ".ob-hero{background:linear-gradient(135deg,#14532d,#2e7d32 55%,#65a30d);color:#fff;border-radius:18px;padding:26px 22px;margin-bottom:20px;text-align:center;box-shadow:0 10px 26px rgba(46,125,50,.35)}" +
        ".ob-hero small{display:block;letter-spacing:.12em;text-transform:uppercase;font-weight:700;opacity:.85;font-size:.75rem;margin-bottom:8px}" +
        ".ob-quote{font-size:1.35rem;font-weight:800;line-height:1.35;min-height:2.8em;display:flex;align-items:center;justify-content:center;transition:opacity .4s}" +
        ".ob-hero-btn{margin-top:14px;border:0;background:#fde047;color:#422006;font-weight:800;font-size:1.1rem;padding:14px 28px;border-radius:40px;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.25);transition:transform .15s}" +
        ".ob-hero-btn:hover{transform:translateY(-2px) scale(1.03)}" +
        ".ob-hero p{margin-top:10px;font-size:.88rem;opacity:.92}" +
        ".ob-main-btn{background:linear-gradient(135deg,#fde047,#f59e0b)!important;color:#422006!important;border:0!important;font-weight:800!important}" +
        ".ob-love{background:#fff7ed;border-left:4px solid #f59e0b;border-radius:8px;padding:10px 12px;margin:0 0 6px;color:#9a3412;font-weight:600;font-style:italic}" +
        ".ob-pulse{animation:obp 1.8s infinite}@keyframes obp{0%{box-shadow:0 0 0 0 rgba(254,240,138,.8)}50%{box-shadow:0 0 0 9px rgba(254,240,138,0)}}";
    document.head.appendChild(css);

    /* ====== Pop-up content ====== */
    function render() {
        if (!box || box.classList.contains("hidden")) return;
        var h = "", foot = "", title, sub;

        if (view === "welcome") {
            title = "Welcome to EcoScan! 🌱";
            sub = "Be the reason your city, town or village is cleaner.";
            h = '<p class="ob-love">“Our country is our home. When you report waste, you take care of everyone who lives here.”</p>' +
                '<p style="margin:10px 0">It takes 3 easy steps:</p>' +
                '<div class="ob-step"><span>👀</span><div><b>1. Spot waste</b>Litter, an overflowing bin, or waste in the wrong place, anywhere in the country.</div></div>' +
                '<div class="ob-step"><span>📍</span><div><b>2. Report where it is</b>Tell us the location and the type of waste.</div></div>' +
                '<div class="ob-step"><span>⭐</span><div><b>3. Earn +' + XP_PER_REPORT + ' XP</b>Every report adds to your score and rank.</div></div>' +
                '<label for="obName">Your name</label><input id="obName" maxlength="40" placeholder="Type your name" value="' + esc(who() === "Student" ? "" : who()) + '">';
            foot = '<button class="ob-btn grey" data-act="close">Later</button><button class="ob-btn" data-act="start">Start reporting 📍</button>';
        } else {
            title = "Hi, " + who() + "! 👋";
            sub = "Your reports help. " + xp() + " XP · " + reports.length + " report" + (reports.length === 1 ? "" : "s") + " this visit";
            h = '<p class="ob-love">' + QUOTES[quoteIdx % QUOTES.length] + '</p>' +
                '<label for="obLoc">Where is the waste?</label>' +
                '<input id="obLoc" maxlength="120" placeholder="e.g. Near the bus stand, Main Road, your city">' +
                '<label for="obType">What kind of waste?</label><select id="obType">' +
                TYPES.map(function (t) { return "<option>" + t + "</option>"; }).join("") + '</select>' +
                '<label for="obNote">Note (optional)</label><textarea id="obNote" rows="2" maxlength="200" placeholder="Anything helpful, e.g. bin is full"></textarea>';
            if (message) h += '<div class="ob-msg">' + esc(message) + '</div>';
            if (reports.length) {
                h += '<div class="ob-list"><h4>Your recent reports</h4>' +
                    reports.slice(-3).reverse().map(function (r) {
                        return '<div class="ob-item">📍 <b>' + esc(r.loc) + '</b> <small>· ' + esc(r.type) + ' · ' + esc(r.date) + '</small></div>';
                    }).join("") + '</div>';
            }
            foot = '<button class="ob-btn grey" data-act="close">Close</button><button class="ob-btn" data-act="send">Send report (+' + XP_PER_REPORT + ' XP)</button>';
        }
        box.querySelector("h2").textContent = title;
        box.querySelector(".ob-head p").textContent = sub;
        box.querySelector(".ob-body").innerHTML = h;
        box.querySelector(".ob-foot").innerHTML = foot;
    }

    /* ====== Actions ====== */
    function saveName() {
        var n = $("obName");
        if (!n || !n.value.trim()) return;
        userName = n.value.trim();                       // same variable your site uses
        if ($("userDisplayName")) $("userDisplayName").textContent = userName;
    }

    function sendReport() {
        var loc = $("obLoc").value.trim();
        if (loc.length < 3) { message = "Please tell us where the waste is (at least 3 letters)."; render(); return; }
        var type = $("obType").value, note = $("obNote").value.trim();
        var visitCount = reports.filter(function (r) { return r.rewarded; }).length;
        var duplicate = reports.some(function (r) { return r.loc.toLowerCase() === loc.toLowerCase() && r.type === type; });

        var rewarded = !duplicate && visitCount < MAX_REWARDED_PER_VISIT;
        reports.push({ loc: loc, type: type, note: note, date: today(), rewarded: rewarded });

        if (duplicate) message = "Thanks! That spot was already reported in this visit, so no extra XP this time.";
        else if (!rewarded) message = "Thanks! You've reached the XP limit for this visit (" + MAX_REWARDED_PER_VISIT + " reports).";
        else {
            if (typeof addXp === "function") addXp(XP_PER_REPORT);   // your site's own XP function
            message = "✅ Report sent! +" + XP_PER_REPORT + " XP. " + THANKS[reports.length % THANKS.length];
        }
        render();
    }

    function open(v) {
        view = v; message = "";
        box.classList.remove("hidden");
        if (btn) btn.classList.remove("ob-pulse");
        render();
    }
    function close() { if (view === "welcome") saveName(); box.classList.add("hidden"); }

    /* ====== Wire-up ====== */
    document.addEventListener("DOMContentLoaded", function () {
        box = document.createElement("div");
        box.className = "modal-overlay hidden";
        box.style.zIndex = 1200;
        box.innerHTML = '<div class="modal-content ob-card"><button class="modal-close" data-act="close">&times;</button>' +
            '<div class="ob-head"><h2></h2><p></p></div><div class="ob-body"></div><div class="ob-foot"></div></div>';
        document.body.appendChild(box);

        box.addEventListener("click", function (e) {
            var act = e.target.getAttribute && e.target.getAttribute("data-act");
            if (e.target === box || act === "close") close();
            else if (act === "start") { saveName(); view = "report"; message = ""; render(); }
            else if (act === "send") sendReport();
        });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.classList.contains("hidden")) close(); });

        btn = document.createElement("button");
        btn.className = "nav-utility-btn ob-main-btn";
        btn.textContent = "📍 Report Waste";
        btn.addEventListener("click", function () { open("report"); });
        var bar = document.querySelector(".nav-actions-group") || document.body;
        bar.insertBefore(btn, bar.firstChild);

        // Big banner at the top of the page: Report Waste is the main feature
        var main = document.querySelector(".main-container");
        if (main) {
            var hero = document.createElement("section");
            hero.className = "ob-hero";
            hero.innerHTML = '<small>🌱 Our mission: a cleaner country</small><div class="ob-quote"></div>' +
                '<button class="ob-hero-btn" type="button">📍 Report Waste Near You</button>' +
                '<p>Report where you see waste and earn <b>+' + XP_PER_REPORT + ' XP</b> every time.</p>';
            main.insertBefore(hero, main.firstChild);
            var q = hero.querySelector(".ob-quote");
            q.textContent = QUOTES[0];
            hero.querySelector(".ob-hero-btn").addEventListener("click", function () { open("report"); });
            setInterval(function () {
                q.style.opacity = 0;
                setTimeout(function () { quoteIdx++; q.textContent = QUOTES[quoteIdx % QUOTES.length]; q.style.opacity = 1; }, 400);
            }, 6000);
        }

        if (SHOW_WELCOME_ON_LOAD && !/[?&]node=/.test(location.search)) setTimeout(function () { open("welcome"); }, 500);
        else btn.classList.add("ob-pulse");
    });

    window.EcoScanOnboarding = { open: open };   // open("welcome") replays the intro
})();