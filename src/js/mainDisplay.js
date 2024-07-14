const { invoke } = window.__TAURI__.tauri;
const { open } = window.__TAURI__.dialog;
const { resolve, basename } = window.__TAURI__.path;
const { Command } = window.__TAURI__.shell;
let current_editing = null;



window.addEventListener('DOMContentLoaded', async () => {
});

let number = 0;
export function makeFileset(name, path, tags, opener) {
    let e = document.createElement("li");
    e.opener = opener;
    e.classList.add("fileset");
    e.innerHTML = `
    
    <div class="fileset-header">
    <div class="fileset-identifiers">
        <p class="fileset-name">${name}</p>
        <p class="fileset-path">${path}</p>
    </div>
    <div class="fileset-menu-wrapper non-selectable">
        <label for="chkbox${number}">...</label>
        <input type="radio" name="menu" id="chkbox${number}" class="fileset-menu-checkbox">
        <ul class="menu">
            <li class="fileset-menu-item">編集する</li>
            <li class="fileset-menu-item">削除</li>
            <li class="fileset-menu-item">開き方を指定する</li>
            <li class="fileset-menu-item">パスをコピーする</li>
            <li class="fileset-menu-item">ファイルを開く</li>
            <li class="fileset-menu-item">親フォルダを開く</li>
        </ul>
    </div>
</div>
<div class="tags non-selectable">
</div>
`;
    ++number;
    if (tags !== undefined) {
        for (let tag of tags) {
            let newTag = document.createElement("p");
            newTag.classList.add("tag");
            newTag.innerHTML = `${tag}`;
            e.querySelector(".tags").appendChild(newTag);
        }
    }
    let element = e.querySelector(".fileset-menu-checkbox");
    element.addEventListener("change", async () => {
        async function clicked(event) {
            let target = event.target;
            if (target.classList.contains("fileset-menu-item")) {
                let command = "";
                let args = { name: name, path: path, opener: opener };
                switch (target.textContent) {
                    case "編集する":
                        command = "edit";
                        break;
                    case "パスをコピーする":
                        command = "copy";
                        break;
                    case "ファイルを開く":
                        command = "open";
                        break;
                    case "親フォルダを開く":
                        command = "openParent";
                        break;
                    case "開き方を指定する":
                        command = "opener";
                        break;
                    case "削除":
                        e.remove();
                        break;
                    default:
                        break;
                }
                invoke("menu_action", { command: command, args: args }).then((result) => {}).catch((error) => {
                    console.error(error);
                });
            }
            element.checked = false;
            document.removeEventListener("click", clicked);
        }
        document.addEventListener("click", clicked);
    });
    return e;
}

function validateFilesetEditor() {
    let fileSetEditor = document.querySelector("#fileset-editor");
    let nameField = fileSetEditor.querySelector(".fileset-name input");
    let pathField = fileSetEditor.querySelector(".fileset-path input");
    if (nameField.value === "") {
        return "name";
    }
    if (pathField.value === "") {
        return "path";
    }
    return "ok";
}

export function setupFilesetEditor() {
    let filesetEditor = document.querySelector("#fileset-editor");
    let addButton = filesetEditor.querySelector("#add-button");
    console.log("setupFilesetEditor is called");
    addButton.addEventListener("mouseenter", () => {
        console.log(validateFilesetEditor());
        if (validateFilesetEditor() !== "ok") {
            addButton.style.cursor = "not-allowed";
        }
        addButton.addEventListener("mouseleave", () => {
            addButton.style.cursor = null;
            addButton.removeEventListener("mouseleave", () => { });
        });
    })

    let browseButton = document.querySelector(".fileset-path button");
    browseButton.addEventListener("click", async () => {
        let path = await open({ directory: false, multiple: false });
        document.querySelector(".fileset-path input").value = path;
    });

    let filesets = document.querySelector("#filesets");
    addButton.addEventListener("click", async () => {
        let validation = validateFilesetEditor();
        if (validation !== "ok") {
            alert(`${validation} is empty`);
            return;
        }
        let name = filesetEditor.querySelector(".fileset-name input").value;
        let path = filesetEditor.querySelector(".fileset-path input").value;
        let tags = [];
        for (let tag of filesetEditor.querySelectorAll(".tag.selected")) {
            tags.push(tag.textContent);
        }
        filesets.appendChild(makeFileset(name, path, tags, ""));
        filesetEditor.querySelector(".fileset-name input").value = "";
        filesetEditor.querySelector(".fileset-path input").value = "";
        for (let tag of filesetEditor.querySelectorAll(".tag.selected")) {
            tag.classList.remove("selected");
        }
    });
} 