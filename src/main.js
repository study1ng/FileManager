const { invoke } = window.__TAURI__.tauri;
const { emit, listen } = window.__TAURI__.event;
import { setupTabHookHovering, setupTabDragging } from "./js/tabControl.js";
import { makeFileset, setupFilesetEditor, setupFileset } from "./js/mainDisplay.js";
let filesetData;
let selectedFileSet = null;
let passwordCheckBox;
let passwordGroup;
let loginData = null;



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
    newtd.classList.add("non-selectable")
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("name", prop + "chk");
    newtd.appendChild(checkbox);
    newtr.appendChild(newtd);

    newtd = document.createElement("td");
    newtd.textContent = prop;
    newtr.appendChild(newtd);

    newtd = document.createElement("td");
    newtd.classList.add("non-selectable");
    newtd.textContent = filesetData[prop]["need_password"] ? "🔏" : "";
    newtr.appendChild(newtd);

    newtd = document.createElement("td");
    newtd.classList.add("non-selectable");
    let datetime = new Date(filesetData[prop]["last_accessed"]);
    newtd.textContent = getDateDiffString(datetime);
    newtr.appendChild(newtd);

    return newtr;
}

function initFilesets(name, password) {
    let filesets = document.querySelector("#filesets");
    filesets.innerHTML = "";
    invoke("read_filesets", { filesetManager: filesetData, name: name, password: password }).then((result) => {
        for (let fs of result) {
            let fileset = makeFileset(fs.name, fs.path, fs.tags, fs.opener);
            filesets.appendChild(fileset);
            setupFileset(fileset);
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
    let enteredPassword = document.querySelector("#login-password").value;
    // if no errors occur, result is null
    let result = await invoke("login", { "fileSets": filesetData, "password": enteredPassword, "fileSetName": selectedFileSet.querySelector("td:nth-child(2)").textContent });
    if (result == null) {
        document.querySelector("#tab-container").classList.add("inactive");
        document.querySelector("#main").classList.remove("inactive");
        loginData = {
            "filesetName": selectedFileSet.querySelector("td:nth-child(2)").textContent,
            "password": enteredPassword
        };
        setupMainDisplay();
    }
    else {
        document.querySelector("#login-password").value = "";
        alert(result);
    }
}

async function register(event) {
    event.preventDefault();
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
        loginData = {
            "filesetName": document.querySelector("#fileset-name").value,
            "password": needPassword ? passwordGroup.querySelector("#registration-password").value : ""
        };
        return true;
    }
    else {
        document.querySelector("#login-password").value = "";
        alert(result);
        return false;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    let loginButton = document.querySelector("#login-button");
    passwordCheckBox = document.querySelector("#need-password");
    passwordGroup = document.querySelector("#password-group");
    filesetData = await invoke("load_file_set_manager");
    setFileSetManager();
    loginButton.addEventListener("click", async (event) => {
        let result = await login(event);
        if (result) {
            setupMainDisplay();
        }
    });

    setupTabHookHovering();
    setupTabDragging();
    let registerButton = document.querySelector("#registration-button");
    registerButton.addEventListener("click", async (event) => {
        let result = await register(event);
        if (result) {
            setupMainDisplay();
        }
    });
    passwordCheckBox.addEventListener("change", (event) => {
        if (event.target.checked) {
            passwordGroup.setAttribute("style", "display: block;");
        }
        else {
            passwordGroup.setAttribute("style", "display: none;");
        }
    });
});

async function saveFilesets() {
    invoke("console_log", { message: "save_filesets" });
    let filesets = document.querySelector("#filesets");
    let filesetList = [];
    for (let fileset of filesets.children) {
        let tagList = [];
        for (let tag of fileset.querySelectorAll(".tag")) {
            tagList.push(tag.textContent);
        }
        filesetList.push({
            name: fileset.querySelector(".fileset-name").textContent,
            path: fileset.querySelector(".fileset-path").textContent,
            tags: tagList,
            opener: fileset.opener
        });
    }
    let result = invoke("save_filesets", { filesetManager: filesetData, name: loginData.filesetName, password: loginData.password, filesets: filesetList }).then(
        (result) => {
        }, (error) => {
            invoke("console_log", { message: error });
        }
    ).finally(() => {
        invoke("console_log", { message: "save_filesets ended" });
    });
    await result;
}

function setupMainDisplay() {
    invoke("console_log", { message: "setupMainDisplay" });
    initFilesets(loginData.filesetName, loginData.password);
    setupFilesetEditor(document.querySelector(".fileset-editor"));
    listen("close_window", () => {
        saveFilesets();
        emit("close_window");
    });
}

