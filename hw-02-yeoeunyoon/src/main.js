import "../style.css";
import StickyNotesApp from "./StickyNotesApp.js";

const app = new StickyNotesApp();
document.addEventListener("DOMContentLoaded", app.init.bind(app));