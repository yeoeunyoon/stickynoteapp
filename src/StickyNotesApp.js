import Note from "./Note.js";
import NotesWall from "./NotesWall.js";

class StickyNotesApp {

    #noteWall;
    #insertNewNote;
    #containNote;
    #noteColors = ['#FEF3C7', '#DBEAFE', '#FCE7F3', '#D1FAE5', '#FEE2E2'];


    constructor(){
        this.#noteWall = new NotesWall();
        this.#insertNewNote = document.getElementById("new-note");
        this.#containNote = document.getElementById("notes-wall");
        this.#setupHeader();
        this.#setupHelperBar();
        this.#setupSearchBar();
    }

    #setupHeader() {
        // header 제거 (더 심플하게)
    }

    #setupHelperBar() {
        // 안내문구를 노트 입력창 바로 아래에 추가
        const helperBar = document.createElement('div');
        helperBar.className = 'flex flex-wrap items-center gap-4 my-2 text-base';
        helperBar.innerHTML = `
          <span class="flex items-center gap-1"><span style="font-size:1.2em">\u2195\uFE0F</span> Drag notes to rearrange</span>
          <span class="flex items-center gap-1"><span style="font-size:1.2em">\u270E\uFE0F</span> Double-click to edit</span>
          <span class="flex items-center gap-1"><span style="font-size:1.2em">\uD83C\uDFA8</span> Click colors to change note style</span>
          <span class="flex items-center gap-1"><span style="font-size:1.2em">\u2328\uFE0F</span> Shift + Enter for new line</span>
        `;
        this.#insertNewNote.parentNode.insertBefore(helperBar, this.#insertNewNote.nextSibling);
    }

    #setupSearchBar() {
        // 검색창을 입력창 위에 추가
        const searchBarWrapper = document.createElement('div');
        searchBarWrapper.className = 'mb-4';
        const searchBar = document.createElement('input');
        searchBar.type = 'text';
        searchBar.placeholder = 'Search notes...';
        searchBar.className = 'w-full p-2 rounded border border-gray-300 focus:border-indigo-500 bg-gray-50 text-base';
        searchBarWrapper.appendChild(searchBar);
        this.#insertNewNote.parentNode.insertBefore(searchBarWrapper, this.#insertNewNote);
        searchBar.addEventListener('input', (e) => this.#filterNotes(e.target.value));
        // 노트 입력창 스타일 강조
        this.#insertNewNote.classList.add('mt-4', 'mb-2', 'bg-white', 'border-2', 'border-pink-300', 'focus:border-indigo-500', 'shadow-md', 'text-lg');
        this.#insertNewNote.placeholder = 'Write your note here... (Press Enter to add)';
    }

    #filterNotes(query) {
        const notes = this.#containNote.querySelectorAll('.note');
        notes.forEach(note => {
            const text = note.querySelector('.note-text')?.textContent || '';
            const tags = note.getAttribute('data-tags') || '';
            if (text.toLowerCase().includes(query.toLowerCase()) || tags.toLowerCase().includes(query.toLowerCase())) {
                note.style.display = '';
            } else {
                note.style.display = 'none';
            }
        });
    }

    init(){
        this.#insertNewNote.addEventListener(
            "keydown",
            this.#newNoteCreateWhenEnter.bind(this)
        );
        document.addEventListener(
            "deleteNote", 
            this.#deleteNoteEvent.bind(this)
        );
        this.#setupDragAndDrop();
    }

    #setupDragAndDrop() {
        this.#containNote.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingNote = document.querySelector('.dragging');
            if (draggingNote) {
                const afterElement = this.#getDragAfterElement(e.clientY);
                if (afterElement) {
                    this.#containNote.insertBefore(draggingNote, afterElement);
                } else {
                    this.#containNote.appendChild(draggingNote);
                }
            }
        });
    }

    #getDragAfterElement(y) {
        const draggableElements = [...this.#containNote.querySelectorAll('.note:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    #createNote(text, tags = '', imageUrl = ''){
        const note = new Note(text);
        this.#noteWall.addNote(text);

        const newNote = document.createElement("div");
        newNote.classList.add(
            "relative", "w-full", "h-48", "p-0", "overflow-y-auto", "transition-all", 
            "transform", "shadow-lg", "note"
        );
        newNote.setAttribute("data-id", note.getId());
        newNote.setAttribute("draggable", "true");
        newNote.setAttribute("data-tags", tags);
        // 기본 배경색
        newNote.style.backgroundColor = this.#noteColors[0];
        // 랜덤 회전
        const rotation = Math.random() * 6 - 3;
        newNote.style.transform = `rotate(${rotation}deg)`;

        const removeBtn = this.#createTrashButton(note.getId());
        const noteText = this.#createNoteText(note.getText());
        const noteEdit = this.#createTextArea(note.getText());
        const colorPicker = this.#createColorPicker(newNote);
        const tagBar = this.#createTagBar(newNote, tags);
        let imageElem = null;
        if (imageUrl) {
            imageElem = document.createElement('img');
            imageElem.src = imageUrl;
            imageElem.className = 'object-cover w-full h-24 rounded-t-lg';
            newNote.appendChild(imageElem);
        }

        newNote.append(removeBtn, noteText, noteEdit, colorPicker, tagBar);
        this.#containNote.appendChild(newNote);

        // 드래그 이벤트
        newNote.addEventListener('dragstart', () => {
            newNote.classList.add('dragging');
            newNote.style.opacity = '0.5';
        });
        newNote.addEventListener('dragend', () => {
            newNote.classList.remove('dragging');
            newNote.style.opacity = '1';
        });

        noteText.addEventListener(
            "dblclick", 
            () => this.#textEdit(noteText, noteEdit)
        );
        noteEdit.addEventListener(
            "keydown", 
            (e) => this.#saveAfterAction(e, noteText, noteEdit)
        );
        noteEdit.addEventListener(
            "blur", 
            () => this.#saveInfo(noteEdit.value, noteText, noteEdit)
        );
    }

    #createTrashButton(noteId) {
        const removeBtn = document.createElement("button");
        removeBtn.classList.add(
            "absolute", "w-5", "h-5", "leading-5", "text-center", "transition-opacity", 
            "opacity-0", "cursor-pointer", "delete-btn", "top-1", "right-1", "hover:opacity-100"
        );
        removeBtn.textContent = "🗑";
        removeBtn.addEventListener(
            "click", 
            () => this.#removeNoteFromWall(noteId)
        );
        return removeBtn;
    }

    #createNoteText(text){
        const noteText = document.createElement("div");
        noteText.classList.add("p-4", "note-text");
        noteText.innerHTML = text.replace(/\n/g, "<br>");
        return noteText;
    }

    #createTextArea(text){
        const noteEdit = document.createElement("textarea");
        noteEdit.classList.add(
            "absolute", "top-0", "left-0", "hidden", "w-full", "h-full", "p-4", 
            "transition-transform", "transform", "bg-yellow-300", "shadow-xl", 
            "resize-none", "outline-rose-700", "outline-offset-0", "note-edit", "note", "hover:scale-105"
        );
        noteEdit.value = text;
        return noteEdit;
    }

    #createColorPicker(noteElement) {
        const colorPicker = document.createElement('div');
        colorPicker.classList.add('color-picker');
        this.#noteColors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.classList.add('color-option');
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', () => {
                noteElement.style.backgroundColor = color;
            });
            colorPicker.appendChild(colorOption);
        });
        return colorPicker;
    }

    #createTagBar(noteElement, tags) {
        const tagBar = document.createElement('div');
        tagBar.className = 'flex flex-wrap gap-1 px-2 pb-2';
        if (tags) {
            tags.split(',').forEach(tag => {
                const tagElem = document.createElement('span');
                tagElem.className = 'bg-indigo-100 text-indigo-700 rounded px-2 py-0.5 text-xs';
                tagElem.textContent = `#${tag.trim()}`;
                tagBar.appendChild(tagElem);
            });
        }
        return tagBar;
    }

    #removeNoteFromWall(noteId) {
        this.#noteWall.removeNote(noteId);
        const noteElement = this.#containNote.querySelector(`[data-id='${noteId}']`);
        if(noteElement){
            noteElement.remove();
        }
    }

    #textEdit(noteText, noteEdit) {
        noteText.classList.add("hidden");
        noteEdit.classList.remove("hidden");
        noteEdit.focus();
    }

    #saveInfo(newText, noteText, noteEdit){
        noteText.innerHTML = newText.replace(/\n/g, "<br>");
        noteText.classList.remove("hidden");
        noteEdit.classList.add("hidden");
    }

    #saveAfterAction(e, noteText, noteEdit){
        if (e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            this.#saveInfo(noteEdit.value, noteText, noteEdit);
        }else if(e.key == "Escape") {
            this.#saveInfo(noteText.textContent, noteText, noteEdit);
        }
    }

    #newNoteCreateWhenEnter(e){
        if (e.key === "Enter"){
            if (e.shiftKey) {
                return; 
            }
            e.preventDefault();
            const newNoteText = e.target.value.trim();
            // 태그와 이미지 입력 받기
            const tags = prompt('태그를 입력하세요 (쉼표로 구분, 예: work,idea,study):', '');
            let imageUrl = '';
            if (confirm('이미지를 첨부하시겠습니까?')) {
                imageUrl = prompt('이미지 URL을 입력하세요:', '');
            }
            if (newNoteText) {
                this.#createNote(newNoteText, tags, imageUrl);
                e.target.value = "";
            }
        }
    }

    #deleteNoteEvent(e){
        const noteId = e.detail;
        this.#removeNoteFromWall(noteId);
    }


}

export default StickyNotesApp;