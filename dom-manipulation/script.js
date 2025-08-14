let newQuoteText = document.getElementById("newQuoteText");
let newQuoteCategory = document.getElementById("newQuoteCategory");
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuote = document.getElementById("newQuote");
let quotes = [];

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

    let li = document.createElement("li");
    li.innerHTML = `<strong>Quote:</strong> ${quote.text}<br><strong>Category:</strong> ${quote.category}`;
    quoteDisplay.appendChild(li);

    newQuoteText.value = "";
    newQuoteCategory.value = "";
}

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
