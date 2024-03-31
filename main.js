let currentTab;
let elseTab;
let registerTab;
let loginTab;


window.addEventListener("DOMContentLoaded", () => {
    registerTab = document.querySelector("#register-tab");
    loginTab = document.querySelector("#login-tab");
    currentTab = loginTab;
    elseTab = registerTab;
    loginTab.addEventListener("mousedown", tabOnMouseDown);
  registerTab.addEventListener("mousedown", tabOnMouseDown);
});


let tabPositionAtFirst;
function tabOnMouseDown(event) {
    if (this === currentTab) {
        return;
    }
    document.querySelector("body").style.userSelect = "none";
    this.style.cursor = "grabbing";
    tabPositionAtFirst = this.getBoundingClientRect();
    let body = document.querySelector("body");
    body.addEventListener("mousemove", tabOnMouseMove);
    body.addEventListener("mouseup", tabOnMouseUp);
    // body.addEventListener("mouseleave", tabOnMouseUp);
}

function tabOnMouseMove(event) {
    elseTab.style.left = event.clientX - tabPositionAtFirst.width / 2 + "px";
    elseTab.style.top = event.clientY - 10 + "px";
}
 
function tabOnMouseUp(event) {
    this.style.cursor = null;
    let duration = 0.5;
    document.querySelector("head style").textContent = `
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
    document.querySelector("body").style.userSelect = null;
}
