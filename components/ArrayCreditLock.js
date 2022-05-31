class ArrayCreditLock extends HTMLElement {
    constructor() {
        super();
        this.data = [];
        this.showAllCreditHistory = false;
        this.numOfShownItems = 5;
        this.numOfRemainingItems = 0;
        this.hideLockHistory = false;
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    async render() {
        this.attachShadow({mode: "open"});

        this.shadowRoot.appendChild(originalTemplate.content.cloneNode(true));

        await this.displayCreditHistory();
        this.toggleStepAndFacts();
        this.toggleCredHistory();
        this.toggleLockHistory();
    }


    formatTime = (clientDate) => {
        const date = new Date(clientDate);
        const month = date.getMonth();
        const day = date.getDate();
        const year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        let timeZone = date.getTimezoneOffset() / -60;
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        timeZone = timeZone < 0 ? `GMT- ${timeZone}` : `GMT+ ${timeZone}`;

        return `${year}-${month}-${day} ${hours}:${minutes}${ampm} ${timeZone}`;
    };

    /**
     *  Create the document fragment for the credit history
     * @param creditItem
     * @returns {DocumentFragment}
     */
    createCreditListItemFrag = (creditItem) => {
        return document.createRange().createContextualFragment(`
            <span class="date">${this.formatTime(creditItem.date)}</span>
                <div class="lock-wrapper">
               <span class="lock">${
            creditItem.type === "enrollment" ? "Unlocked" : "Locked"
        }</span>
                 </div>
    `);
    };

    /**
     * Ingests the data from the API and displays it in the credit history section
     * @returns {Promise<any>}
     */
    readJson = async () => {
        return await fetch("/data.json")
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                return json;
            })
            .catch((error) => console.error(error));
    };

    /**
     * Displays the credit history
     * @returns {Promise<void>}
     */
    displayCreditHistory = async () => {
        const creditHistoryList = this.shadowRoot.getElementById("credit-history-list");

        while (creditHistoryList.firstChild) {
            creditHistoryList.removeChild(creditHistoryList.firstChild);
        }

        /* If true, clear '<li>s' and get show All (n) text, which will be hidden, then exit method  */
        if (this.hideLockHistory) {
            this.getShowAllText();
            return;
        }

        const ul = this.shadowRoot.getElementById("credit-history-list");

        this.data = await this.readJson();

        this.numOfRemainingItems = this.data.length - this.numOfShownItems;
        this.getShowAllText();

        for (let index = 0; index < this.data.length; index++) {
            let historyListItem = document.createElement("li");
            let documentFragment = this.createCreditListItemFrag(this.data[index]);

            historyListItem.classList.add("history-list");
            historyListItem.appendChild(documentFragment);

            /* if showAll is false, and number to display exceeded, exit loop  */
            if (index >= this.numOfShownItems && !this.showAllCreditHistory) {
                break;
            }

            ul.appendChild(li);
        }
    }


    toggleCredHistory() {
        const showAll = this.shadowRoot.querySelector(".show-all");

        showAll.addEventListener("click", () => {
            this.showAllCreditHistory = !this.showAllCreditHistory;
            this.displayCreditHistory();
        });
    }

    toggleLockHistory() {
        const historyTitle = this.shadowRoot.querySelector(".history-title");
        const transUnionFile = this.shadowRoot.querySelector(".transunion-file");

        historyTitle.addEventListener("click", () => {
            this.hideLockHistory = !this.hideLockHistory;
            // Reset list to only show 5 items whenever history is clicked
            this.showAllCreditHistory = false;
            this.displayCreditHistory();

            historyTitle.innerText = this.hideLockHistory
                ? "Show lock history"
                : "Hide lock history";

            transUnionFile.innerText = this.hideLockHistory
                ? "Your TransUnion File is Locked"
                : "Your TransUnion File is Open";
        });
    }

    getShowAllText = () => {
        const showAllElement = this.shadowRoot.querySelector(".show-all");
        showAllElement.style.display = this.hideLockHistory ? "none" : "block";
        showAllElement.innerText = this.showAllCreditHistory
            ? `Hide (${this.numOfRemainingItems})`
            : `Show All (${this.numOfRemainingItems})`;
    }

    toggleStepAndFacts = () => {
        const factHeaders = this.shadowRoot.querySelectorAll(".collapsible");

        factHeaders.forEach((factHeader) => {
            factHeader.addEventListener("click", () => {
                factHeader.classList.toggle("expanded");
            });
        });
    }
}

window.customElements.define("array-credit-lock", ArrayCreditLock);
