let newQuoteText = document.getElementById("newQuoteText");
let newQuoteCategory = document.getElementById("newQuoteCategory");
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuote = document.getElementById("newQuote");
let quotes = [];
let categoryFilter = document.getElementById("categoryFilter");

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API

// ==================== Local Storage ====================
function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem("quotes")) || [];
}
function saveToLocalStorage(quotes) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ==================== Add Quote ====================
function createAddQuoteForm() {
    let quotText = newQuoteText.value.trim();
    let quotCategory = newQuoteCategory.value.trim();

    if (quotText === "" || quotCategory === "") {
        alert("Please fill in both fields.");
        return;
    }

    let quote = {
        text: quotText,
        category: quotCategory,
        timestamp: Date.now()
    };

    quotes.push(quote);
    saveToLocalStorage(quotes);
    postQuoteToServer(quote); // ⬅️ send to server

    newQuoteText.value = "";
    newQuoteCategory.value = "";
    renderQuotes();
}

// ==================== Render Quotes ====================
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

// ==================== Show Random Quote ====================
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

// ==================== Import / Export ====================
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

// ==================== Filter by Category ====================
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

// ==================== Sync With Server ====================
async function fetchQuotesFromServer() {
    try {
        let response = await fetch(SERVER_URL);
        let serverQuotes = await response.json();

        // هنا بنضيف شوية Quotes Mock لأن JSONPlaceholder بيرجع Posts مش Quotes
        let formattedQuotes = serverQuotes.slice(0, 5).map(post => ({
            text: post.title,
            category: "Server",
            timestamp: Date.now()
        }));

        let localQuotes = getFromLocalStorage();
        let mergedQuotes = [...localQuotes, ...formattedQuotes];
        saveToLocalStorage(mergedQuotes);
        renderQuotes();
        console.log("✅ Synced with server");
    } catch (error) {
        console.error("❌ Error fetching quotes from server:", error);
    }
}

// ==================== Post to Server ====================
async function postQuoteToServer(quote) {
    try {
        let response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quote)
        });

        let data = await response.json();
        console.log("✅ Quote posted to server:", data);
    } catch (error) {
        console.error("❌ Error posting quote:", error);
    }
}

// run sync every 10 sec
setInterval(fetchQuotesFromServer, 10000);
