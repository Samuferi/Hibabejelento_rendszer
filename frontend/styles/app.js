const toggleButton = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");

function toggleSidebar() {
    sidebar.classList.toggle("close");
    toggleButton.classList.toggle("rotate");

    closeAllSubMenus();
}

function toggleSubMenu(button) {

    if (!button.nextElementSibling.classList.contains("show")) {
        closeAllSubMenus();
    }

    button.nextElementSibling.classList.toggle("show");
    button.classList.toggle("rotate");

    if (sidebar.classList.contains("close")) {
        sidebar.classList.toggle("close");
        toggleButton.classList.toggle("rotate");
    }
}

function closeAllSubMenus() {
    Array.from(sidebar.getElementsByClassName("show")).forEach(ul => {
        ul.classList.remove("show");
        ul.previousElementSibling.classList.remove("rotate");
    })
}

document.addEventListener("click", function (event) {
    const profileMenu = document.querySelector(".profile-menu");
    if (!profileMenu) return;

    const profileButton = profileMenu.querySelector(".profile-btn");
    const profileSubMenu = profileMenu.querySelector(".sub-menu");

    const clickedInside = event.target.closest(".profile-menu");

    if (!clickedInside && profileSubMenu.classList.contains("show")) {
        profileSubMenu.classList.remove("show");
        if (profileButton) profileButton.classList.remove("rotate");
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const adminTabs = document.querySelectorAll(".admin-tab");

    const sectionMap = {
        employees: document.querySelector(".wrapper-employees"),
        problems: document.querySelector(".wrapper-2"),
        "new-employee": document.querySelector(".wrapper"),
        users: document.getElementById("users-wrapper")
    };

    adminTabs.forEach(tab => {
        tab.addEventListener("click", e => {
            e.preventDefault();

            const target = tab.dataset.target;
            const targetElement = sectionMap[target];

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }

        });
    });


    function setActiveTab(targetKey) {
        adminTabs.forEach(tab => {
            if (tab.dataset.target === targetKey) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });
    }

    window.addEventListener("scroll", () => {
        let currentSection = null;
        let scrollY = window.scrollY + 200; 

        for (const [key, section] of Object.entries(sectionMap)) {
            if (!section) continue;

            const rect = section.getBoundingClientRect();
            const top = rect.top + window.scrollY;

            if (scrollY >= top && scrollY < top + section.offsetHeight) {
                currentSection = key;
                break;
            }
        }

        if (currentSection) {
            setActiveTab(currentSection);
        }
    });

});
