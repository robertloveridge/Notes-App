'use strict'

// load up any existing notes, or load a fresh set
const getSavedNotes = () => {
    const notesJSON = localStorage.getItem('notes');
    try{
        return notesJSON ? JSON.parse(notesJSON) : [];
    } catch (e){
        return [];
    }   
}

let notes = getSavedNotes();

const timeStamp = moment().valueOf();
const generateLastEdited = (timestamp) => `Last edited ${moment(timestamp).fromNow()}`;
const filters = {
    searchText: ''
};

// find a note by its ID
function getById(noteId){
    var note = notes.find( (note) => note.id == noteId );
    return note;
}

// create a single note
function createNote(noteTitle, noteBody){
    const id = Date.now();
    notes.push({
        id: id,
        title: noteTitle,
        body: noteBody,
        createdAt: timeStamp,
        updatedAt: timeStamp,
    });
    saveNotes(notes);
};

// update a single note
function updateNote(noteId){
    var note = getById(noteId);
    const noteTitle = document.querySelector('#note-title').value;
    const noteBody = document.querySelector('#note-body').value;
    if (!note){
        createNote(noteTitle, noteBody);
    }
    else {
        note.body = noteBody;
        note.title = noteTitle;
        note.updatedAt = moment().valueOf();
        saveNotes(notes);
    }
    location.reload();
};

// clear the localStorage of all notes
const deleteAllNotes = () => {
    localStorage.removeItem('notes');
}

// delete a single note by id
const deleteNote = (id) => {
    const index = notes.findIndex((note) => note.id == id)
    if (index > -1) {
        notes.splice(index,1);
    }
    saveNotes(notes);
}

// save all notes
const saveNotes = (notes) => {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// render a single note
const renderNote = (note) => {
    var noteTitle = note.title;
    const noteStatus = generateLastEdited(note.updatedAt);
    
    if (note.title.length > 0){
        noteTitle = note.title;
    } else {
        noteTitle = 'Unnamed note';
    }

    return `
    <div class="card bg-light mb-3">
      <h5 class="card-header">${noteTitle}</h5>
      <div class="card-body">
        <p class="card-text">${note.body}</p>
        <button type="button" class="btn btn-warning" data-toggle="modal" data-target="#noteModal" data-noteid="${note.id}" data-action="update">Edit Note</button>
        <button type="button" class="btn btn-danger delete-note" data-noteid="${note.id}">Delete Note</button>
      </div>
      <div class="card-footer">
        <span class="badge badge-light">${note.createdAt}</span>
        <span class="badge badge-light">${noteStatus}</span>
      </div>
    </div>
    `;
}

// render all notes
const renderAllNotes = (notes, filters) => { 
    const notesEl = document.querySelector('#notes') 
    notes = notes;

    if (!notes.length > 0){
        $('#delete-all').hide();
    }
    else {
        $('#delete-all').show();
    }

    const filteredNotes = notes.filter( (note) => {
        const title = note.title.toLowerCase();
        const filter = filters.searchText.toLowerCase();
        return title.includes(filter);
    })

    notesEl.innerHTML = '';

    if (filteredNotes.length > 0){
        filteredNotes.forEach( (note) => {
            notesEl.innerHTML += renderNote(note);
        })
    }
    else {
        notesEl.innerHTML = `
        <div class="alert alert-warning" role="alert">
            <strong>No notes found</strong>
        </div>
        `;
    }
};

renderAllNotes(notes, filters);

$(function() {

    $(window).bind("storage", (e) => {
        if (e.key === 'notes'){
            notes = JSON.parse(e.newValue);
            renderAllNotes(notes, filters);
        }
    });

    $( "#search-text" ).on('input propertychange', function(e) {   
        filters.searchText = e.target.value;
        renderAllNotes(notes, filters);
    });

    $('#delete-all').click(function () {
        deleteAllNotes(notes);
        location.reload();
    });

    $('.delete-note').click(function () {
        var noteId = $(this).data('noteid');
        deleteNote(noteId);
        location.reload();
    });

    $('#noteModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var action = button.data('action');
        var modal = $(this);
        var noteId = action == 'create' ? null : button.data('noteid');

        if (action == 'update'){
            var note = getById(noteId);
            $('#note-title').val(note.title);
            $('#note-body').val(note.body);
            modal.find('.modal-title').text("Edit Note");
            $('#modal-save-btn').html("Save Changes");
            $('#modal-save-btn').attr("data-action","update");
            $('#hidden-noteid').attr("data-hidden-noteid",noteId);
        }
        else {
            $('#note-title').val('');
            $('#note-body').val('');
            modal.find('.modal-title').text("Create Note");
            $('#modal-save-btn').html("Create");
            $('#modal-save-btn').attr("data-action","create");
        }
    });

    $( "#modal-save-btn" ).click(function() {   
        updateNote($('#hidden-noteid').attr("data-hidden-noteid"));
    });

});