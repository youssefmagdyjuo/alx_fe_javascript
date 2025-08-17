let newQuoteText = document.getElementById("newQuoteText");
let newQuoteCategory = document.getElementById("newQuoteCategory");
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuote = document.getElementById("newQuote");
let categoryFilter = document.getElementById("categoryFilter");

let quotes = [];

// Local Storage helpers
function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem("quotes")) || [];
}
function saveToLocalStorage(quotes) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// 🔄 Sync function (حفظ + عرض + فلترة)
function syncQuotes() {
    saveToLocalStorage(quotes);
    renderQuotes();
    populateCategories();
}

// Add Quote
function createAddQuoteForm() {
    let text = newQuoteText.value.trim();
    let category = newQuoteCategory.value.trim();

    if (!text || !category) {
        alert("Please fill in both fields.");
        return;
    }

    let quote = {
        id: Date.now(), // unique id
        text,
        category
    };

    quotes.push(quote);
    syncQuotes();
    newQuoteText.value = "";
    newQuoteCategory.value = "";
}

// Reusable render function
function renderList(list) {
    quoteDisplay.innerHTML = "";
    if (list.length === 0) {
        quoteDisplay.innerHTML = "<li>No quotes available.</li>";
        return;
    }

    list.forEach((quote) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>Quote:</strong> ${quote.text}<br>
                <strong>Category:</strong> ${quote.category}
            </div>
        `;

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", () => {
            quotes = quotes.filter(q => q.id !== quote.id);
            syncQuotes();
        });

        li.appendChild(deleteButton);
        quoteDisplay.appendChild(li);
    });
}

// Show all quotes
function renderQuotes() {
    quotes = getFromLocalStorage();
    renderList(quotes);
}

// Random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        alert("No quotes available.");
        return;
    }
    let randomIndex = Math.floor(Math.random() * quotes.length);
    renderList([quotes[randomIndex]]);
}
newQuote.addEventListener("click", showRandomQuote);

// Import / Export
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes = getFromLocalStorage();
        quotes.push(...importedQuotes.map(q => ({ ...q, id: Date.now() + Math.random() })));
        syncQuotes();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();

    URL.revokeObjectURL(url);
}

// Category Filter
function populateCategories() {
    categoryFilter.innerHTML = ""; // clear old options

    let option = document.createElement("option");
    option.value = "all";
    option.textContent = "All Categories";
    categoryFilter.appendChild(option);

    let allQuotes = getFromLocalStorage();
    let allCategories = [...new Set(allQuotes.map(c => c.category))];

    allCategories.forEach((cat) => {
        let option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

function filterQuotes(e) {
    let value = e.target.value;
    let allQuotes = getFromLocalStorage();

    if (value === "all") {
        renderList(allQuotes);
    } else {
        let selected = allQuotes.filter(q => q.category === value);
        renderList(selected);
    }
}

categoryFilter.addEventListener("change", filterQuotes);

// Init
renderQuotes();
populateCategories();
