import Note from "./Note.js";
import NotesWall from "./NotesWall.js";

class StickyNotesApp {

    #noteWall;
    #insertNewNote;
    #containNote;


    constructor(){
        this.#noteWall = new NotesWall();
        this.#insertNewNote = document.getElementById("new-note");
        this.#containNote = document.getElementById("notes-wall");
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
    }


    #createNote(text){
        const note = new Note(text);
        this.#noteWall.addNote(text);

        const newNote = document.createElement("div");
        newNote.classList.add(
            "relative", "w-40", "h-40", "p-0", "m-2", "overflow-y-auto", "transition-transform", 
            "transform", "bg-yellow-200", "shadow-lg", "note", "hover:scale-105"
        );
        newNote.setAttribute("data-id", note.getId());

        const removeBtn = this.#createTrashButton(note.getId());
        const noteText = this.#createNoteText(note.getText());
        const noteEdit = this.#createTextArea(note.getText());

        newNote.append(removeBtn, noteText, noteEdit);
        this.#containNote.appendChild(newNote);

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

            if (newNoteText) {
                this.#createNote(newNoteText);
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