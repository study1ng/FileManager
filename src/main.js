const { invoke } = window.__TAURI__.tauri;
import { setupTabHookHovering, setupTabDragging } from "./js/tabControl.js";
import { makeFileset } from "./js/mainDisplay.js";
let filesetData;
let selectedFileSet = null;
let passwordCheckBox;
let passwordGroup;



function getDateDiffString(date) {
    let current = new Date();
    let diff = current - date;
    const hour = 1000 * 60 * 60;
    const day = hour * 24;
    const month = day * 30;
    // < hourのときはn分前で表示
    // < dayのときはn時間前で表示
    // < monthのときはn日前で表示
    // それ以外はdata.toLocaleDateString()で表示
    if (diff < hour) {
        return Math.floor(diff / (1000 * 60)) + "分前";
    } else if (diff < day) {
        return Math.floor(diff / hour) + "時間前";
    } else if (diff < month) {
        return Math.floor(diff / day) + "日前";
    } else {
        return date.toLocaleDateString();
    }
}

function makeFileSetManagerTr(prop) {
    function beSelected() {
        if (selectedFileSet) {
            selectedFileSet.classList.remove("selected");
        }
        if (selectedFileSet != null) {
            selectedFileSet.querySelector("input").checked = false;
            if (selectedFileSet.querySelector("td:nth-child(3)").textContent === "🔏") {
                document.querySelector("#login-password-group").setAttribute("style", "display: none;");
            }
        }
        selectedFileSet = this;
        selectedFileSet.classList.add("selected");
        selectedFileSet.querySelector("input").checked = true;
        if (selectedFileSet.querySelector("td:nth-child(3)").textContent === "🔏") {
            document.querySelector("#login-password-group").setAttribute("style", "display: block;");
        } else {
            document.querySelector("#login-password-group").setAttribute("style", "display: none;");
        }
    }

    let newtr = document.createElement("tr");
    newtr.salt = prop["salt"];
    newtr.password_hash = prop["password_hash"];
    newtr.classList.add("select");
    newtr.addEventListener("click", beSelected);

    let newtd = document.createElement("td");
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("name", prop + "chk");
    newtd.appendChild(checkbox);
    newtr.appendChild(newtd);

    newtd = document.createElement("td");
    newtd.textContent = prop;
    newtr.appendChild(newtd);

    newtd = document.createElement("td");
    newtd.textContent = filesetData[prop]["need_password"] ? "🔏" : "";
    newtr.appendChild(newtd);

    newtd = document.createElement("td");
    let datetime = new Date(filesetData[prop]["last_accessed"]);
    newtd.textContent = getDateDiffString(datetime);
    newtr.appendChild(newtd);

    return newtr;
}

function initFilesets(name, password) {
    let filesets = document.querySelector("#filesets");
    filesets.innerHTML = "";
    invoke("read_filesets", { filesetManager: filesetData, name: name, password: password }).then((result) => {
        for (let fileset of result) {
            filesets.appendChild(makeFileset(fileset.name, fileset.path));
        }
    });
}

function setFileSetManager() {
    let table = document.querySelector("#fileset-manager tbody");
    let count = 0;
    for (let prop in filesetData) {
        if (count < 5) {
            table.querySelector("tr:nth-child(" + (count + 1) + ")").replaceWith(makeFileSetManagerTr(prop));
        }
        else {
            table.appendChild(makeFileSetManagerTr(prop));
        }
        count++;
    }
}

async function login(event) {
    event.preventDefault();
    console.log("login is called");
    let enteredPassword = document.querySelector("#login-password").value;
    // if no errors occur, result is null
    let result = await invoke("login", { "fileSets": filesetData, "password": enteredPassword, "fileSetName": selectedFileSet.querySelector("td:nth-child(2)").textContent });
    console.log(result);
    if (result == null) {
        document.querySelector("#tab-container").classList.add("inactive");
        document.querySelector("#main").classList.remove("inactive");
        initFilesets(selectedFileSet.querySelector("td:nth-child(2)").textContent, enteredPassword);
    }
    else {
        document.querySelector("#login-password").value = "";
        alert(result);
    }
}


async function register(event) {
    event.preventDefault();
    console.log("register is called");
    let needPassword = passwordCheckBox.checked;
    let result = await invoke("register", {
        "fileSets": filesetData,
        "fileSetName": document.querySelector("#fileset-name").value,
        "password": needPassword ? passwordGroup.querySelector("#registration-password").value : "",
        "needPassword": needPassword,
    });
    if (result == null) {
        document.querySelector("#tab-container").classList.add("inactive");
        document.querySelector("#main").classList.remove("inactive");
        initFilesets(document.querySelector("#fileset-name").value, needPassword ? passwordGroup.querySelector("#registration-password").value : "");
    }
    else {
        document.querySelector("#login-password").value = "";
        alert(result);
    }
}


window.addEventListener('DOMContentLoaded', async () => {
    let loginButton = document.querySelector("#login-button");
    passwordCheckBox = document.querySelector("#need-password");
    passwordGroup = document.querySelector("#password-group");
    filesetData = await invoke("load_file_set_manager");
    setFileSetManager();
    loginButton.addEventListener("click", login);

    setupTabHookHovering();
    setupTabDragging();

    let registerButton = document.querySelector("#registration-button");
    registerButton.addEventListener("click", register);
    passwordCheckBox.addEventListener("change", (event) => {
        if (event.target.checked) {
            passwordGroup.setAttribute("style", "display: block;");
        }
        else {
            passwordGroup.setAttribute("style", "display: none;");
        }
    });
});
