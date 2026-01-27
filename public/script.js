const tabs = document.querySelectorAll('.tab-btn');
const shoppingList = document.getElementById('shopping-list');
const newItemInput = document.getElementById('new-item-input');
const addBtn = document.getElementById('add-btn');
const emptyState = document.getElementById('empty-state');

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

async function fetchItems() {
    try {
        const response = await fetch(`/api/items?category=${encodeURIComponent(currentCategory)}`);
        const items = await response.json();
        renderItems(items);
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

async function deleteItem(id) {
    if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return;

    try {
        const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchItems();
        }
    } catch (err) {
        console.error('Failed to delete item:', err);
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

// Global scope for onclick
window.deleteItem = deleteItem;
