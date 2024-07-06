let currentTab;
let registerTabHook;
let loginTabHook;
let registerTab;
let loginTab;
let elseTab;


window.addEventListener("DOMContentLoaded", () => {
    registerTabHook = document.querySelector("#register-tab .hook");
    loginTabHook = document.querySelector("#login-tab .hook");
    registerTab = document.querySelector("#register-tab");
    loginTab = document.querySelector("#login-tab");
    currentTab = loginTab;
    elseTab = registerTab;
});

export function setupTabHookHovering() {
    registerTabHook.addEventListener("mouseenter", hookHovering);
    registerTab.addEventListener("animationend", () => {
        registerTab.classList.remove("updown");
    });
    loginTabHook.addEventListener("mouseenter", hookHovering);
    loginTab.addEventListener("animationend", () => {
        loginTab.classList.remove("updown");
    });
}

function hookHovering() {
    if ((currentTab === loginTab && this === loginTabHook) ||
        (currentTab === registerTab && this === registerTabHook) ||
        this.classList.contains("updown")) {
        return;
    }
    if (this === loginTabHook) {
        loginTab.classList.add("updown");
    }
    if (this === registerTabHook) {
        registerTab.classList.add("updown");
    }
}

export function setupTabDragging() {
    registerTab.addEventListener("mousedown", tabOnMouseDown);
    loginTab.addEventListener("mousedown", tabOnMouseDown);
}


let tabPositionAtFirst;
let clickedPositionAtFirst;
function tabOnMouseDown(event) {
    if (this === currentTab) {
        return;
    }
    document.querySelector("body").style.userSelect = "none";
    this.style.cursor = "grabbing";
    tabPositionAtFirst = this.getBoundingClientRect();
    clickedPositionAtFirst = { x: event.clientX, y: event.clientY };
    let body = document.querySelector("body");
    body.addEventListener("mousemove", tabOnMouseMove);
    body.addEventListener("mouseup", tabOnMouseUp);
    // body.addEventListener("mouseleave", tabOnMouseUp);
}

function tabOnMouseMove(event) {
    elseTab.style.left = event.clientX - clickedPositionAtFirst.x + tabPositionAtFirst.left + "px";
    elseTab.style.top = event.clientY - clickedPositionAtFirst.y + tabPositionAtFirst.top + "px";
}
 
function tabOnMouseUp(event) {
    this.style.cursor = null;
    let duration = 0.5;
    document.querySelector("#forjs").textContent = `
    @keyframes move-this {
        from {
            top: ${elseTab.getBoundingClientRect().top}px;
            left: ${elseTab.getBoundingClientRect().left}px;
        }
        to {
            top: 3vh;
            left: 4vw;
        }
    }
    @keyframes move-current {
        from {
            top: ${currentTab.getBoundingClientRect().top}px;
            left: ${currentTab.getBoundingClientRect().left}px;
        }
        to {
            top: 90vh;
            left: 4vw;
        }
    }`

    elseTab.style.animation = "move-this " + duration + "s forwards ease-in-out";
    currentTab.style.animation = "move-current " + duration + "s forwards ease-in-out";

    function reset() {
        this.style.left = null;
        this.style.top = null;
        this.style.animation = null;
        this.removeEventListener("animationend", reset);
    }

    elseTab.addEventListener("animationend", reset);

    currentTab.addEventListener("animationend", reset);

    // なんでかわからないけど, これだと動かないので, keyframesを使うことにしました.
    // this.animate(
    //     [
    //         { top: this.getBoundingClientRect().top + "px", left: this.getBoundingClientRect().left + "px"},
    //         { top: "3vh", left: "4vw"}
    //     ],
    //     {
    //         duration: duration * 1000,
    //         fill: "forwards",
    //         easing: "ease-in-out",
    //     }
    // );
    // currentTab.animate(
    //     [
    //         { top: currentTab.getBoundingClientRect().top + "px", left: currentTab.getBoundingClientRect().left + "px" },
    //         { top: "90vh", left: "4vw"}
    //     ],
    //     {
    //         duration: duration * 1000,
    //         fill: "forwards",
    //         easing: "ease-in-out"
    //     }
    // );
    // this.style.left = null;
    // this.style.top = null;

    this.removeEventListener("mousemove", tabOnMouseMove);
    this.removeEventListener("mouseup", tabOnMouseUp);
    // this.removeEventListener("mouseleave", tabOnMouseUp);
    let t = currentTab;
    currentTab = elseTab;
    elseTab = t;
    currentTab.classList.add("visible-tab");
    elseTab.classList.remove("visible-tab");
    currentTab.classList.remove("hidden-tab");
    elseTab.classList.add("hidden-tab");
    currentTab.style.cursor = null;
    document.querySelector("body").style.userSelect = null;
}


