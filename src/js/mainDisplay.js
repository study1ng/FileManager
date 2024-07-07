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