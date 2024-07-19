const { invoke } = window.__TAURI__.tauri;
const { open } = window.__TAURI__.dialog;
let current_editing = null;

window.addEventListener('DOMContentLoaded', async () => {
});
async function addButtonClicked(event) {
    let filesetEditor = event.target.parentElement.parentElement.parentElement;
    let validation = validateFilesetEditor(filesetEditor);
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
    let fileset = makeFileset(name, path, tags, "");
    filesets.appendChild(fileset);
    setupFileset(fileset);
    filesetEditor.querySelector(".fileset-name input").value = "";
    filesetEditor.querySelector(".fileset-path input").value = "";
    for (let tag of filesetEditor.querySelectorAll(".tag.selected")) {
        tag.classList.remove("selected");
    }
}
function makeFilesetEditor(fileset) {
    let name = fileset.querySelector(".fileset-name").textContent;
    let path = fileset.querySelector(".fileset-path").textContent;
    let tags = [];
    for (let tag of fileset.querySelectorAll(".tag")) {
        tags.push(tag.textContent);
    }
    let e = document.createElement("div");
    e.classList.add("fileset-editor");
    e.innerHTML = `
                <div class="fileset-header">
                    <div class="fileset-name">
                        <input type="text" placeholder="名前" name="fileset-name" title="fileset-name"
                            value="${name}">
                    </div>
                    <div class="fileset-path">
                        <div class="flex-wrapper">
                            <input type="text" placeholder="パス" name="fileset-path" title="file" value="${path}">
                            <button class="non-selectable" type="button">
                                Browse
                            </button>
                        </div>
                    </div>
                </div>
                <div class="non-selectable bottom-area">
                    <div class="bottom-button add-button" aria-label="button to add fileset">
                        <img src="assets/svg/rectangle.svg" alt="click here to add new fileset">
                        <img class="hidden" src="assets/svg/checkbox.svg" alt="click here to add new file">
                    </div>
                </div>
                <div class="tags non-selectable">
                    <p class="tag">Programming</p>
                    <p class="tag">Libraries</p>
                    <p class="tag">Stylesheets</p>
                    <p class="tag">Game</p>
                    <p class="tag">AndSome</p>
                </div>
    `
    let allTags = e.querySelectorAll(".tag");
    allTags.forEach((tag) => {
        if (tag.textContent in tags) {
            tag.classList.add("selected");
        }
    })
    return e;
}

let number = 0;
export function makeFileset(name, path, tags, opener) {
    let e = document.createElement("li");
    e.name = name;
    e.path = path;
    e.tags = tags;
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
    return e;
}

export function setupFileset(fileset) {
    let element = fileset.querySelector(".fileset-menu-checkbox");
    let name = fileset.name;
    let path = fileset.path;
    let tags = fileset.tags;
    let opener = fileset.opener;

    element.addEventListener("change", async () => {
        async function clicked(event) {
            let target = event.target;
            console.log(target);
            if (target.classList.contains("fileset-menu-item")) {
                let command = "default";
                let args = { name: name, path: path, opener: opener };
                switch (target.textContent) {
                    case "編集する":
                        let fs = target.parentElement.parentElement.parentElement.parentElement;
                        let editor = makeFilesetEditor(fs);
                        fs.innerHTML = editor.outerHTML;
                        setupFilesetEditor(fs);
                        fs.querySelector(".add-button").removeEventListener("click", addButtonClicked);
                        fs.querySelector(".add-button").addEventListener("click", () => {
                            let name = fs.querySelector(".fileset-name input").value;
                            let path = fs.querySelector(".fileset-path input").value;
                            let tags = [];
                            for (let tag of fs.querySelectorAll(".tag.selected")) {
                                tags.push(tag.textContent);
                            }
                            fs.innerHTML = makeFileset(name, path, tags, "").innerHTML; 
                            setupFileset(fs);
                        }
                        );
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
                        fileset.remove();
                        break;
                    default:
                        break;
                }
                invoke("menu_action", { command: command, args: args }).catch((error) => { // BUG: after editing, actions which require menu_action doesn't work.
                    console.error(error);
                });
            }
            element.checked = false;
            document.removeEventListener("click", clicked);
        }
        document.addEventListener("click", clicked);
    });
}

function validateFilesetEditor(filesetEditor) {
    let nameField = filesetEditor.querySelector(".fileset-name input");
    let pathField = filesetEditor.querySelector(".fileset-path input");
    if (nameField.value === "") {
        return "name";
    }
    if (pathField.value === "") {
        return "path";
    }
    return "ok";
}

export function setupFilesetEditor(filesetEditor) {
    let addButton = filesetEditor.querySelector(".add-button");
    addButton.addEventListener("mouseenter", () => {
        console.log(validateFilesetEditor(filesetEditor)); // TODO: consoleではなく, ユーザーにわかる方式でエラーを表示する
        if (validateFilesetEditor(filesetEditor) !== "ok") {
            addButton.style.cursor = "not-allowed";
        }
        addButton.addEventListener("mouseleave", () => {
            addButton.style.cursor = null;
            addButton.removeEventListener("mouseleave", () => { });
        });
    })

    let browseButton = filesetEditor.querySelector(".fileset-path button");
    browseButton.addEventListener("click", async () => {
        let path = await open({ directory: false, multiple: false });
        filesetEditor.querySelector(".fileset-path input").value = path;
    });

    let filesets = document.querySelector("#filesets");
    addButton.addEventListener("click", addButtonClicked);
    filesetEditor.querySelectorAll(".add-button").forEach((t) => {
        t.addEventListener("mouseover", () => {
            t.querySelectorAll(".add-button img").forEach((element) => {
                element.classList.toggle("hidden");
            });
        });
    })
    filesetEditor.querySelectorAll(".add-button").forEach((t) => {
        t.addEventListener("mouseout", () => {
            t.querySelectorAll(".add-button img").forEach((element) => {
                element.classList.toggle("hidden");
            });
        });
    })
    filesetEditor.querySelectorAll(".tag-button").forEach((t) => {
        t.addEventListener("click", () => {
            t.parentElement.parentElement.querySelector(".tags").classList.toggle("hidden");
        });
    })
    // ホイールで横スクロール
    filesetEditor.querySelectorAll(".tags").forEach((t) => {
        t.addEventListener("mousewheel", e => {
            if (e.deltaX === 0) {
                e.stopPropagation()
                e.preventDefault()
                t.scrollBy(e.deltaY, 0)
            }
        })
    })
    filesetEditor.querySelectorAll(".tags .tag").forEach((tag) => {
        tag.addEventListener("click", () => {
            tag.classList.toggle("selected");
        })
    })
} 