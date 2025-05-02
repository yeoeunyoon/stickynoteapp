class Note{
    static #nextId = 1;
    #id;
    #text;

    constructor(text){
        this.#text = text;
        this.#id = Note.#nextId++;
    }

    getId() {
        return this.#id;
    }

    getText() {
        return this.#text;
    }
}


export default Note;