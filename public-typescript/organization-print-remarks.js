(() => {
    const fromDateStringElement = document.querySelector("#filter--fromDateString");
    const toDateStringElement = document.querySelector("#filter--toDateString");
    const remarkBlockElements = document.querySelectorAll(".is-remark-block");
    const showHideRemarks = () => {
        const fromDateString = fromDateStringElement.value;
        const toDateString = toDateStringElement.value;
        for (const remarkBlockElement of remarkBlockElements) {
            if (remarkBlockElement.dataset.remarkDateString < fromDateString ||
                remarkBlockElement.dataset.remarkDateString > toDateString) {
                remarkBlockElement.classList.add("is-hidden");
                remarkBlockElement.classList.remove("is-block");
            }
            else {
                remarkBlockElement.classList.add("is-block");
                remarkBlockElement.classList.remove("is-hidden");
            }
        }
    };
    showHideRemarks();
    fromDateStringElement.addEventListener("change", showHideRemarks);
    toDateStringElement.addEventListener("change", showHideRemarks);
    const resetValue = (clickEvent) => {
        const inputElement = clickEvent.currentTarget.closest(".field").querySelector("input");
        inputElement.value = inputElement.dataset.resetValue;
        showHideRemarks();
    };
    const resetButtonElements = document.querySelectorAll(".is-reset-value-button");
    for (const resetButtonElement of resetButtonElements) {
        resetButtonElement.addEventListener("click", resetValue);
    }
})();
