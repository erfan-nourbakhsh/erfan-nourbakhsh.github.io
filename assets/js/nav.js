(function () {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    var backdrop = document.querySelector(".nav-backdrop");
    var closeBtn = document.querySelector(".nav-close");
    var links = document.querySelectorAll(".nav-list a");

    if (!toggle || !menu) return;

    function openMenu() {
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("nav-open");
    }

    function closeMenu() {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
    }

    function isMobile() {
        return window.matchMedia("(max-width: 1046px)").matches;
    }

    toggle.addEventListener("click", function () {
        if (menu.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    if (backdrop) {
        backdrop.addEventListener("click", closeMenu);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeMenu);
    }

    links.forEach(function (link) {
        link.addEventListener("click", function () {
            if (isMobile()) closeMenu();
        });
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
            closeMenu();
        }
    });

    window.addEventListener("resize", function () {
        if (!isMobile()) closeMenu();
    });
})();
