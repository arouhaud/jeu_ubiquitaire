'use strict';

window.homeApp = {

    statesData : {
        "Speed" : {
            // "weak_value": "600000", // milliseconds
            // "medium_value": "300000", // milliseconds,
            // "high_value": "60000" // milliseconds
            "weak_value": "30000", // 30s
            "medium_value": "20000", // 20s,
            "high_value": "10000" // 10s
        },
        "Intelligence" : {
            "weak_value": "5",
            "medium_value": "2",
            "high_value": "0"
        },
    },

    weakTimer: null,
    mediumTimer: null,
    highTimer: null,

    currentQuestion: null,

    isFast: true,

    initTimers: function() {
        clearTimeout(window.homeApp.weakTimer);
        clearTimeout(window.homeApp.mediumTimer);
        clearTimeout(window.homeApp.highTimer);

        window.homeApp.weakTimer = setTimeout(function() {
            $("#skip-button").removeClass("hidden");
        }, window.homeApp.statesData["Speed"]["weak_value"]);

        window.homeApp.mediumTimer = setTimeout(function() {
            $("#hint-button").removeClass("hidden");
        }, window.homeApp.statesData["Speed"]["medium_value"]);

        window.homeApp.highTimer = setTimeout(function() {
            window.homeApp.isFast = false;
        }, window.homeApp.statesData["Speed"]["high_value"]);
    },

    adaptFromSpeed: function() {
        if (window.homeApp.isFast) {
            // Pick higher difficulty question
            let curDiff = window.homeApp.currentQuestion["difficulty"];
            if (curDiff !== "hard") {
                if (curDiff === "medium") {
                    window.homeApp.currentQuestion = data.shift();
                    while (window.homeApp.currentQuestion["difficulty"] !== "hard") {
                        data.push(window.homeApp.currentQuestion);
                        window.homeApp.currentQuestion = data.shift();
                    }
                }

                else if (curDiff === "easy") {
                    window.homeApp.currentQuestion = data.shift();
                    while (window.homeApp.currentQuestion["difficulty"] === "easy") {
                        data.push(window.homeApp.currentQuestion);
                        window.homeApp.currentQuestion = data.shift();
                    }
                }

                window.localStorage.setItem("questionsData", JSON.stringify(data));
            }
        } else {
            let data = JSON.parse(window.localStorage.getItem("questionsData"));
            window.homeApp.currentQuestion = data.shift();
            window.localStorage.setItem("questionsData", JSON.stringify(data));
        }
    },

    adaptFromBadAnswer: function() {
        let playerData = JSON.parse(window.localStorage.getItem("playerData"));
        playerData["Intelligence"] = playerData["Intelligence"] + 1;

        if (playerData["Intelligence"] >= window.homeApp.statesData["Intelligence"]["weak_value"]) {
            $("#skip-button").removeClass("hidden");
        } else if (playerData["Intelligence"] >= window.homeApp.statesData["Intelligence"]["medium_value"]) {
            $("#hint-button").removeClass("hidden");
        }

        window.localStorage.setItem("playerData", JSON.stringify(playerData));
    },

    styleMenuButtons: function() {
        $(".menu-buttons").css({
            "background-color": "rgba(0, 0, 255, 0.5)",
            "color": "white",
            "border": "black",
            "text-shadow": "0 0 4px #000"
        });
    },

    scan: function(callback) {
        cordova.plugins.barcodeScanner.scan(function(result) {
            callback(result.text);
        }, function(error) {
            console.error("Error while scanning : " + error);
        }, {
            preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : false, // iOS and Android
            showTorchButton : false, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: false, // Android, save scan history (default false)
            prompt : "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableSuccessBeep: true // iOS and Android
        });
    },

    pickNextQuestion: function() {
        let data = JSON.parse(window.localStorage.getItem("questionsData"));

        if (data.length > 0) {

            window.homeApp.adaptFromSpeed();

            // Reset intel data hints and stuff
            let playerData = JSON.parse(window.localStorage.getItem("playerData"));
            playerData["Intelligence"] = 0;
            window.localStorage.setItem("playerData", JSON.stringify(playerData));

            $("#skip-button").addClass("hidden");
            $("#hint-button").addClass("hidden");

            // Init timers for speed data
            window.homeApp.initTimers();
        } else {
            window.homeApp.currentQuestion = null;
            $('#question-p').text("Plus de questions ! Merci d'avoir joué, attendez la prochaine mise à jour !");
            $("#scan-answer").addClass("hidden");
            $("#scan-info").addClass("hidden");
        }
    },

    pickFirstQuestion: function() {
        let data = JSON.parse(window.localStorage.getItem("questionsData"));
        window.homeApp.currentQuestion = data.shift();
        window.localStorage.setItem("questionsData", JSON.stringify(data));

        window.homeApp.initTimers();
    },

    displayQuestion: function() {
        if (window.homeApp.currentQuestion != null) {
            $('#question-p').text(window.homeApp.currentQuestion["question"]);
        }
    },

    bindButtons: function() {

        $('#hint-button').click(function(e) {
            e.preventDefault();
            $('#hint-p').text(window.homeApp.currentQuestion["hint"]);
            $(':mobile-pagecontainer').pagecontainer('change', '#hint-page');
        });

        $('#skip-button').click(function(e) {
            e.preventDefault();

            window.homeApp.pickNextQuestion();
            window.homeApp.displayQuestion();

            $(':mobile-pagecontainer').pagecontainer('change', '#game-page');
        });

        $('#next-button').click(function(e) {
            e.preventDefault();

            window.homeApp.pickNextQuestion();
            window.homeApp.displayQuestion();

            $(':mobile-pagecontainer').pagecontainer('change', '#game-page');
        });

        $('#scan-info').click(function(e) {
            e.preventDefault();

            window.homeApp.scan(function(info) {
                $('#info-p').text(info);
                $(':mobile-pagecontainer').pagecontainer('change', '#info-page');
            });
        });

        $('#scan-answer').click(function(e) {
            e.preventDefault();

            window.homeApp.scan(function(answer) {
                let title;
                let text;

                if (window.homeApp.currentQuestion["answers"].includes(answer)) {
                    title = "Bonne réponse";
                    text = "Bien joué !";

                    $("#next-button").removeClass("hidden");
                    $("#retry-button").addClass("hidden");
                } else {
                    title = "Mauvaise réponse";

                    $("#next-button").addClass("hidden");
                    $("#retry-button").removeClass("hidden");

                    window.homeApp.adaptFromBadAnswer();
                }

                $('#answer-header').text(title);
                $('#answer-p').text(text);

                $(':mobile-pagecontainer').pagecontainer('change', '#answer-page');
            });
        });

        $('#reset-button').click(function(e) {
            window.localStorage.setItem("questionsData", null);
            window.localStorage.setItem("playerData", null);

            $("#scan-answer").removeClass("hidden");
            $("#scan-info").removeClass("hidden");

            window.homeApp.initData();
        });
    },

    initData : function() {
        if ("questionsData" in window.localStorage) {
            $.get("questions.txt", function(data){
                let array = JSON.parse(data);

                // Shuffle array
                for(let i = array.length - 1; i > 0; i--){
                    const j = Math.floor(Math.random() * i);
                    const temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }

                window.localStorage.setItem("questionsData", JSON.stringify(array));

                window.homeApp.pickFirstQuestion();
                window.homeApp.displayQuestion();
            });
        }

        if ("playerData" in window.localStorage) {
            let playerData = {
                "Speed": "00:00:00",
                "Intelligence": 0
            };

            window.localStorage.setItem("playerData", JSON.stringify(playerData));
        }
    }
};

$(document).ready(function(){
    window.homeApp.styleMenuButtons();
    window.homeApp.initData();
    window.homeApp.bindButtons();
});

$(document).bind("mobileinit", function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
});