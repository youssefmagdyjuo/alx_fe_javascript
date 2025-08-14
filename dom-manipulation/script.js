let newQuoteText = document.getElementById("newQuoteText");
let newQuoteCategory = document.getElementById("newQuoteCategory");
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuote = document.getElementById("newQuote");
let quotes = [];

function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem("quotes")) || [];
}
function saveToLocalStorage(quotes) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}
function createAddQuoteForm() {
    let quotText = newQuoteText.value.trim();
    let quotCategory = newQuoteCategory.value.trim();

    if (quotText === "" || quotCategory === "") {
        alert("Please fill in both fields.");
        return;
    }

    let quote = {
        text: quotText,
        category: quotCategory
    };

    quotes.push(quote);
    saveToLocalStorage(quotes);
    newQuoteText.value = "";
    newQuoteCategory.value = "";
    renderQuotes();
}
function renderQuotes() {
    quotes = getFromLocalStorage();
    quoteDisplay.innerHTML = "";

    if (quotes.length === 0) {
        quoteDisplay.innerHTML = "<li>No quotes available.</li>";
        return;
    }

    quotes.forEach((quote ,index) => {
        let li = document.createElement("li");
        li.innerHTML = `<strong>Quote:</strong> ${quote.text}<br><strong>Category:</strong> ${quote.category}`;
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        li.appendChild(deleteButton);
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", () => {
            quotes.splice(index, 1);
            saveToLocalStorage(quotes);
            renderQuotes();
        });
        quoteDisplay.appendChild(li);
    });
}
renderQuotes() ;
function showRandomQuote() {
    if (quotes.length === 0) {
        alert("No quotes available.");
        return;
    }

    let randomIndex = Math.floor(Math.random() * quotes.length);
    let randomQuote = quotes[randomIndex];

    quoteDisplay.innerHTML = "";
    let li = document.createElement("li");
    li.innerHTML = `<strong>Quote:</strong> ${randomQuote.text}<br><strong>Category:</strong> ${randomQuote.category}`;
    quoteDisplay.appendChild(li);
}

newQuote.addEventListener("click", showRandomQuote);
