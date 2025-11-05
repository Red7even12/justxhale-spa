// frontend-spa/src/services/noteService.js

import api from './api';

const noteService = {
  /**
   * Creates a new note for a given "noteable" entity.
   * @param {object} payload - The note data.
   * @param {string} payload.noteable_type - The alias for the parent model (e.g., 'estate').
   * @param {number} payload.noteable_id - The ID of the parent record.
   * @param {string} payload.content - The text content of the note.
   * @returns {Promise} Axios promise with the API response for the newly created note.
   */
  createNote(payload) {
    return api.post('/notes', payload);
  },

  /**
   * Retrieves all notes for a given "noteable" entity.
   * @param {string} noteableType - The alias for the parent model (e.g., 'estate').
   * @param {number} noteableId - The ID of the parent record.
   * @returns {Promise} Axios promise with the API response for the list of notes.
   */
  getNotes(noteableType, noteableId) {
    return api.get(`/notes/${noteableType}/${noteableId}`);
  }
};

export default noteService;