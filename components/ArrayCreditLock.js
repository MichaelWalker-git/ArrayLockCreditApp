import {originalTemplate} from '../templates/original.js';

class ArrayCreditLock extends HTMLElement {
    constructor() {
        super();
        this.data = [];
        this.showAllCreditHistory = false;
        this.numOfShownItems = 5;
        this.numOfRemainingItems = 0;
        this.hideLockHistory = false;
    }

    async connectedCallback() {
        if (!this.rendered) {
            await this.render();
            this.rendered = true;
        }
    }

    async render() {
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(originalTemplate);

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
    getJsonData = async () => {
        return await fetch("../test_data.json")
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                console.log("json", json);
                return json;
            })
            .catch((error) => console.error(error));
    };

    /**
     * Displays the credit history
     * @returns {Promise<void>}
     */
    displayCreditHistory = async () => {
        const originalTemplateElement = this.shadowRoot.firstElementChild;
        const creditHistoryList = originalTemplateElement.getElementsByClassName("history-list");
        const creditHistoryParent = originalTemplateElement.getElementsByClassName("history-list-parent")[0];
        while (creditHistoryList.length) {
            creditHistoryParent.removeChild(creditHistoryList[0]);
        }

        // Will clear all the list items and early exit
        if (this.hideLockHistory) {
            this.getShowAllText();
            creditHistoryParent.style.display = "none";
            return;
        }
        creditHistoryParent.style.display = "block";

        this.data = await this.getJsonData();

        this.numOfRemainingItems = this.data.length - this.numOfShownItems;
        this.getShowAllText();

        for (let index = 0; index < this.data.length; index++) {
            let historyListItem = document.createElement("li");
            let documentFragment = this.createCreditListItemFrag(this.data[index]);

            historyListItem.classList.add("history-list");
            historyListItem.appendChild(documentFragment);

            if (index >= this.numOfShownItems && !this.showAllCreditHistory) {
                break;
            }
            creditHistoryParent.appendChild(historyListItem);
        }
    }

    toggleCredHistory() {
        const showAll = this.shadowRoot.querySelector(".show-all");

        showAll.addEventListener("click", async (evt) => {
            evt.preventDefault();
            evt.stopPropagation();

            this.showAllCreditHistory = !this.showAllCreditHistory;
            await this.displayCreditHistory();
        });
    }

    toggleLockHistory() {
        const historyTitle = this.shadowRoot.querySelector(".history-title");

        historyTitle.addEventListener("click", async (evt) => {
            evt.preventDefault();
            evt.stopPropagation();

            this.hideLockHistory = !this.hideLockHistory;
            this.showAllCreditHistory = false;
            await this.displayCreditHistory();

            historyTitle.innerText = this.hideLockHistory
                ? "Show lock history"
                : "Hide lock history";

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
            factHeader.addEventListener("click", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                factHeader.classList.toggle("expanded");
            });
        });
    }
}

window.customElements.define("array-credit-lock", ArrayCreditLock);
