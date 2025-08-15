let newQuoteText = document.getElementById("newQuoteText");
let newQuoteCategory = document.getElementById("newQuoteCategory");
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuote = document.getElementById("newQuote");
let quotes = [];
let categoryFilter = document.getElementById("categoryFilter");
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
        li.innerHTML = `<div><strong>Quote:</strong> ${quote.text}<br><strong>Category:</strong> ${quote.category}</div>`;
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
    li.innerHTML = `<div><strong>Quote:</strong> ${randomQuote.text}<br><strong>Category:</strong> ${randomQuote.category}</div>`;
    quoteDisplay.appendChild(li);
}

newQuote.addEventListener("click", showRandomQuote);
    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes = getFromLocalStorage();
        quotes.push(...importedQuotes);
        saveToLocalStorage(quotes);
        renderQuotes();
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
// filter 
function populateCategories (){
    let allQuotes = getFromLocalStorage()
    let allCategories =[... new Set(allQuotes.map(c=> c.category))]
    allCategories.forEach((q) =>{
        let option = document.createElement('option');
        option.innerHTML =q
        option.value= q
        categoryFilter.appendChild(option)
    })
}
populateCategories()

function filterQuotes(e){
let value = e.target.value
let allQuotes = getFromLocalStorage()
let selectedCategory= allQuotes.filter(q=>{
    return q.category == value
})
quoteDisplay.innerHTML=''
    selectedCategory.forEach((quote ,index) => {
        let li = document.createElement("li");
        li.innerHTML = `<div><strong>Quote:</strong> ${quote.text}<br><strong>Category:</strong> ${quote.category}</div>`;
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        li.appendChild(deleteButton);
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", () => {    
            allQuotes= allQuotes.filter(q=>{
                return q.text !== quote.text
            })        
            console.log(allQuotes)
            saveToLocalStorage(allQuotes);
            filterQuotes ({ target: { value: value } });
        });
        quoteDisplay.appendChild(li);
    });
}
