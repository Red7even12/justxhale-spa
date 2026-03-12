import api from './api';

const noteService = {
  /**
   * Creates a new note.
   * V2: Requires 'contextUrl' (e.g., 'vizabiliti/cases/1') to hit the correct endpoint.
   */
  createNote(payload, contextUrl = null) {
    if (contextUrl) {
      // V2 Path: /vizabiliti/cases/1/notes
      return api.post(`/${contextUrl}/notes`, payload);
    } else {
      // V1 Legacy Path: /notes
      return api.post('/notes', payload);
    }
  },

  /**
   * Get notes.
   * V2: Uses contextUrl + Query Params for filtering.
   */
  getNotes(noteableType, noteableId, contextUrl = null) {
    if (contextUrl) {
      // V2 Path: /vizabiliti/cases/1/notes?noteable_type=...&noteable_id=...
      return api.get(`/${contextUrl}/notes`, {
        params: { noteable_type: noteableType, noteable_id: noteableId }
      });
    } else {
      // V1 Legacy Path: /notes/{type}/{id}
      return api.get(`/notes/${noteableType}/${noteableId}`);
    }
  }
};

export default noteService;