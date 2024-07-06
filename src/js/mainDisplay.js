const { invoke } = window.__TAURI__.tauri;
const { open } = window.__TAURI__.dialog;
let addingFilesetButton;
let current_editing = null;



window.addEventListener('DOMContentLoaded', async () => {
});


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
    <div class="fileset-menu-wrapper">
        <label for="chkbox1">...</label>
        <input type="radio" name="menu" id="chkbox1" class="fileset-menu-checkbox">
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
<div class="tags">
</div>
`;
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

function makeFilesetEditor(origin = null) {
    let e = document.createElement("li");
    e.id = "fileset-editor";
    e.classList.add("fileset");
    e.innerHTML = `
    <div id="editing-fileset-identifiers" class="fileset-header">
        <div id="fileset-name-group" class="fileset-name">
            <input type="text" ${origin === null ? "placeholder=\"名前\"" : `value="${origin.querySelector(".fileset-name").value}"`} name="fileset-name" title="fileset-name">
        </div>
        <div id="fileset-path-group" class="fileset-path">
            <div class="flex-wrapper">
                <input type="text" ${origin === null ? "placeholder=\"パス\"" : `value=\"${origin.querySelector(".fileset-path").value}"`} name="fileset-path" title="file">
                <button type="button">
                    参照する
                </button>
            </div>
        </div>
    </div>
    <div class="tags" id="editing-tags">
    </div>
    `

    e.querySelector("#fileset-path-group button").addEventListener("click", () => {
        open({}).then((result) => {
            e.querySelector("[name=fileset-path]").value = result;
        });
    });

    if (origin !== null) {
        for (let tag of origin.querySelector(".tags").children) {
            let newTag = document.createElement("p");
            newTag.classList.add("tag");
            newTag.innerHTML = `
            <input class="dynamically-sizing" type="text" pattern=".{1,20}" value="${tag.value}">
        `
            e.querySelector(".tags").appendChild();
        }
    }
    let addTagButton = document.createElement("p");
    addTagButton.classList.add("tag");
    addTagButton.id = "add-new-tag";
    addTagButton.innerText = "+";
    e.querySelector(".tags").appendChild(addTagButton);
    return e;
}

function validateFilesetEditor(editor) {
    let name = editor.querySelector("[name=fileset-name]").value;
    let path = editor.querySelector("[name=fileset-path]").value;
    if (name === "") {
        return "name";
    }
    if (path === "") {
        return "path";
    }
    invoke("path_exists", path).then((result) => {
        if (!result) {
            return "nonexistent";
        }
    });
    for (let tag of editor.querySelector(".tags").children) {
        if (tag.value === "") {
            return "tag";
        }
    }
    return true;
}

function confirm_edit() {
    if (validateFilesetEditor(current_editing) !== true) {
        return false;
    }
    let newFileset = makeFileset(current_editing.querySelector("[name=fileset-name]").value, current_editing.querySelector("[name=fileset-path]").value);
    current_editing.id = null;
    current_editing.innerHTML = newFileset.innerHTML;
    return true;
}

export function setUpAddingFilesetButton() {
    addingFilesetButton = document.querySelector("#add-new-file");
    addingFilesetButton.addEventListener("click", () => {
        if (current_editing !== null) {
            if (confirm_edit() === false) {
                return;
            }
        }
        current_editing = makeFilesetEditor();
        document.querySelector("#filesets").insertBefore(current_editing, addingFilesetButton.parentElement);
        window.setTimeout(document.addEventListener("click", (event) => {
            if (!event.target.closest("#fileset-editor")) {
                switch (validateFilesetEditor(current_editing)) {
                    case "name":
                        alert("名前を入力してください");
                        break;
                    case "path":
                        alert("パスを入力してください");
                        break;
                    case "nonexistent":
                        alert("パスが存在しません");
                        break;
                    case "tag":
                        alert("空のタグを入力しないでください");
                        break;
                    default:
                        break;
                }
            }
            current_editing.id = null;
            current_editing.innerHTML = makeFileset(current_editing.querySelector("[name=fileset-name]").value,
                current_editing.querySelector("[name=fileset-path]").value).innerHTML;
        }), 10);
    });
}

