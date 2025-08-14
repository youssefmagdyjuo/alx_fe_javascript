let newQuoteText = document.getElementById("newQuoteText")
let newQuoteCategory = document.getElementById("newQuoteCategory")
let quoteDisplay = document.getElementById("quoteDisplay")
let newQuote = document.getElementById("newQuote")
let quots= [];
function addQuote() {
    console.log(quots) 
    let quotText = newQuoteText.value.trim();
    let quotCategory = newQuoteCategory.value.trim();
    if (quotText === "" || quotCategory === "") {
        alert("Please fill in both fields.");
    }
    else {
        let quote ={
            text: quotText,
            category: quotCategory
        }
        quots.push(quote);
        newQuoteText.value = "";
        newQuoteCategory.value = "";
    }
}
function showRandomQuote (){
    let randomIndex = Math.floor(Math.random() * quots.length);
    quoteDisplay.innerHTML = `
            <li>
            <strong>Quote:</strong> ${quots[randomIndex].text}
            <br>
            <strong>Category:</strong> ${quots[randomIndex].category}
        </li>
    `;
}
newQuote.addEventListener("click", showRandomQuote);
