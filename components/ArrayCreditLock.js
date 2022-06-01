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

    lockIcon = (lock) => {
        if (lock) {
            return `                 <svg
                      class="lock-icon"
                      width="12px"
                      height="18px"
                      viewBox="0 0 12 18"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g
                        id="Credit-Lock"
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <g
                          id="2.1-Creditlock-Locked-History-Desktop"
                          transform="translate(-424.000000, -539.000000)"
                          fill="#3E3F42"
                          fill-rule="nonzero"
                        >
                          <g
                            id="bureau"
                            transform="translate(167.000000, 190.000000)"
                          >
                            <g
                              id="Group"
                              transform="translate(22.000000, 349.820582)"
                            >
                              <path
                                d="M245.5,5.79545455 L244.75,5.79545455 L244.75,3.75 C244.75,1.68 243.07,-1.77635684e-14 241,-1.77635684e-14 C238.93,-1.77635684e-14 237.25,1.68 237.25,3.75 L237.25,5.79545455 L236.5,5.79545455 C235.675,5.79545455 235,6.47045455 235,7.29545455 L235,14.7954545 C235,15.6204545 235.675,16.2954545 236.5,16.2954545 L245.5,16.2954545 C246.325,16.2954545 247,15.6204545 247,14.7954545 L247,7.29545455 C247,6.47045455 246.325,5.79545455 245.5,5.79545455 Z M241,12.5454545 C240.175,12.5454545 239.5,11.8704545 239.5,11.0454545 C239.5,10.2204545 240.175,9.54545455 241,9.54545455 C241.825,9.54545455 242.5,10.2204545 242.5,11.0454545 C242.5,11.8704545 241.825,12.5454545 241,12.5454545 Z M243.325,5.79545455 L238.675,5.79545455 L238.675,3.75 C238.675,2.4675 239.7175,1.425 241,1.425 C242.2825,1.425 243.325,2.4675 243.325,3.75 L243.325,5.79545455 Z"
                                id="unlock_icon-copy-8"
                              ></path>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>
`
        } else {
            return `                    <svg
                      class="lock-icon"
                      width="12px"
                      height="18px"
                      viewBox="0 0 14 21"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                    >
                      <g
                        id="Design"
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                        opacity="0.300176711"
                      >
                        <g
                          id="1.3-Creditlock-Expand-Desktop"
                          transform="translate(-720.000000, -711.000000)"
                          fill="#3E3F42"
                          fill-rule="nonzero"
                        >
                          <g
                            id="accounts"
                            transform="translate(164.500000, 616.000000)"
                          >
                            <g
                              id="Group-2"
                              transform="translate(0.500000, 44.000000)"
                            >
                              <g
                                id="row"
                                transform="translate(0.000000, 35.000000)"
                              >
                                <path
                                  d="M564.576471,24.2795232 L564.576471,20.67168 C564.576471,19.1963859 563.377255,17.9971702 561.901961,17.9971702 C560.426667,17.9971702 559.227451,19.1963859 559.227451,20.67168 L559.227451,20.67168 L559.227,22.0049545 L557.588,22.0049545 L557.588235,20.67168 C557.588235,18.3605382 559.408777,16.472022 561.693059,16.3629321 L561.901961,16.3579545 C564.283137,16.3579545 566.215686,18.2905036 566.215686,20.67168 L566.215686,20.67168 L566.215686,24.2795232 L567.078431,24.2795232 C568.027451,24.2795232 568.803922,25.0559938 568.803922,26.0050134 L568.803922,26.0050134 L568.803922,34.6324643 C568.803922,35.581484 568.027451,36.3579545 567.078431,36.3579545 L567.078431,36.3579545 L556.72549,36.3579545 C555.776471,36.3579545 555,35.581484 555,34.6324643 L555,34.6324643 L555,26.0050134 C555,25.0559938 555.776471,24.2795232 556.72549,24.2795232 L556.72549,24.2795232 L564.576471,24.2795232 Z M561.901961,28.5932487 C560.952941,28.5932487 560.176471,29.3697193 560.176471,30.3187389 C560.176471,31.2677585 560.952941,32.0442291 561.901961,32.0442291 C562.85098,32.0442291 563.627451,31.2677585 563.627451,30.3187389 C563.627451,29.3697193 562.85098,28.5932487 561.901961,28.5932487 Z"
                                  id="unlock_icon-copy"
                                ></path>
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>

`;
        }
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
               <span class="lock">
${creditItem.type === "enrollment" ? this.lockIcon(false) : this.lockIcon(true)}
${creditItem.type === "enrollment" ? "Unlocked" : "Locked"}</span>
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
