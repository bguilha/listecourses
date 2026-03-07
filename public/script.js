const tabs = document.querySelectorAll('.tab-btn');
const shoppingList = document.getElementById('shopping-list');
const newItemInput = document.getElementById('new-item-input');
const addBtn = document.getElementById('add-btn');
const emptyState = document.getElementById('empty-state');

// Library Elements
const libraryBtn = document.getElementById('library-btn');
const libraryModal = document.getElementById('library-modal');
const closeLibraryBtn = document.getElementById('close-library-btn');
const libraryList = document.getElementById('library-list');
const newLibraryItemInput = document.getElementById('new-library-item-input');
const addLibraryBtn = document.getElementById('add-library-btn');

let currentCategory = 'Alimentaire';

// Initial fetch
fetchItems();

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.tab;
        fetchItems();
    });
});

// Add Item Events
addBtn.addEventListener('click', handleAddItem);
newItemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddItem();
});

// Library Events
libraryBtn.addEventListener('click', () => {
    libraryModal.classList.remove('hidden');
    fetchLibraryItems();
});

closeLibraryBtn.addEventListener('click', () => {
    libraryModal.classList.add('hidden');
});

libraryModal.addEventListener('click', (e) => {
    if (e.target === libraryModal) {
        libraryModal.classList.add('hidden');
    }
});

addLibraryBtn.addEventListener('click', handleAddLibraryItem);
newLibraryItemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddLibraryItem();
});

async function fetchItems() {
    try {
        const response = await fetch(`/api/items?category=${encodeURIComponent(currentCategory)}`);
        const items = await response.json();
        renderItems(items);
        initSortable();
    } catch (err) {
        console.error('Failed to fetch items:', err);
    }
}

function renderItems(items) {
    shoppingList.innerHTML = '';

    if (items.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'item';
            li.dataset.id = item.id; // Store ID for reordering

            li.innerHTML = `
                <span>${escapeHtml(item.name)}</span>
                <button class="delete-btn" onclick="deleteItem(${item.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;

            shoppingList.appendChild(li);
        });
    }
}

// Initialize SortableJS
let sortableList;

function initSortable() {
    if (sortableList) {
        sortableList.destroy();
    }
    sortableList = Sortable.create(shoppingList, {
        animation: 150,
        delay: 200,
        delayOnTouchOnly: true,
        ghostClass: 'sortable-ghost',
        onEnd: handleReorder
    });
}

async function handleReorder() {
    const items = [...shoppingList.querySelectorAll('.item')];
    const itemIds = items.map(item => parseInt(item.dataset.id));

    // Optimistic update (UI already updated by drag), now send to server
    try {
        await fetch('/api/items/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: itemIds })
        });
    } catch (err) {
        console.error('Failed to reorder items:', err);
    }
}

async function handleAddItem() {
    const name = newItemInput.value.trim();
    if (!name) return;

    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category: currentCategory })
        });

        if (response.ok) {
            newItemInput.value = '';
            fetchItems(); // Refresh list
        }
    } catch (err) {
        console.error('Failed to add item:', err);
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

// --- Library Functions ---

async function fetchLibraryItems() {
    try {
        const response = await fetch(`/api/items?category=${encodeURIComponent('Bibliothèque')}`);
        const items = await response.json();
        renderLibraryItems(items);
    } catch (err) {
        console.error('Failed to fetch library items:', err);
    }
}

function renderLibraryItems(items) {
    libraryList.innerHTML = '';

    if (items.length === 0) {
        libraryList.innerHTML = '<p class="empty-state">La bibliothèque est vide.</p>';
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'item';

        const textSpan = document.createElement('span');
        textSpan.innerHTML = escapeHtml(item.name);
        textSpan.onclick = () => addFromLibrary(item.name);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        deleteBtn.onclick = () => deleteItem(item.id, true);

        li.appendChild(textSpan);
        li.appendChild(deleteBtn);
        libraryList.appendChild(li);
    });
}

async function handleAddLibraryItem() {
    const name = newLibraryItemInput.value.trim();
    if (!name) return;

    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category: 'Bibliothèque' })
        });

        if (response.ok) {
            newLibraryItemInput.value = '';
            fetchLibraryItems();
        }
    } catch (err) {
        console.error('Failed to add library item:', err);
    }
}

async function addFromLibrary(name) {
    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category: 'Alimentaire' })
        });
        if (response.ok) {
            if (currentCategory === 'Alimentaire') {
                fetchItems();
            }
            libraryModal.classList.add('hidden');
        }
    } catch (err) {
        console.error('Failed to add from library:', err);
    }
}

// Update deleteItem to handle refreshing different lists
async function deleteItem(id, isLibrary = false) {
    try {
        const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
        if (response.ok) {
            if (isLibrary) {
                fetchLibraryItems();
            } else {
                fetchItems();
            }
        }
    } catch (err) {
        console.error('Failed to delete item:', err);
    }
}

// Global scope for onclick
window.deleteItem = deleteItem;
