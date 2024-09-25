import Note from "./Note.js"

class NotesWall {
    #notes = [];


    addNote(text){
        const noteAdded = new Note(text);
        this.#notes.push(noteAdded);
    }

    removeNote(id){
        this.#notes = this.#notes.filter((n) => n.getId() !== id);
    }

    editNote(id, text){
        const note = this.#notes.find((n) => n.getId() === id);
        if (note) {
            note.text = text;
        }
    }

    getNote(){
        return this.#notes;
    }
}

export default NotesWall;