const form = document.getElementById("form");
const fields = Array.from(form.querySelectorAll("input, select"));
const resultBox = document.getElementById("result");

function getErrorEl(field) {
    const container = field.closest(".form-control");
    return container ? container.querySelector(".field-error") : null;
}

function validateForm() {
    let isValid = true;

    fields.forEach((field) => {
        const error = getErrorEl(field);
        const value = field.value.trim();

        let hasError = false;
        let message = "";

        if (value === "") {
            hasError = true;
            message = "This field is required.";
        } else if (field.tagName === "INPUT" && (Number.isNaN(Number(value)) || !field.checkValidity())) {
            hasError = true;
            message = "Enter a valid value.";
        }

        if (hasError) {
            field.classList.add("invalid");
            if (error && error.classList.contains("field-error")) {
                error.textContent = message;
            }
            isValid = false;
        } else {
            field.classList.remove("invalid");
            if (error && error.classList.contains("field-error")) {
                error.textContent = "";
            }
        }
    });

    return isValid;
}

fields.forEach((field) => {
    field.required = true;
    const eventName = field.tagName === "SELECT" ? "change" : "input";
    field.addEventListener(eventName, () => {
        if (field.value.trim() !== "") {
            field.classList.remove("invalid");
            const error = getErrorEl(field);
            if (error) {
                error.textContent = "";
            }
        }
    });
});

function setResultState(stateClass, text) {
    resultBox.classList.remove("result-safe", "result-risk", "result-error");
    resultBox.classList.add("prediction-result", stateClass);
    resultBox.innerText = text;
}

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    if (!validateForm()) {
        setResultState("result-error", "Please correct the highlighted fields.");
        return;
    }

    // collect all form data automatically
    const formData = new FormData(form);

    const data = {};

    formData.forEach((value, key) => {
        data[key] = parseFloat(value);
    });

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // display result
        setResultState(
            result.prediction === 1 ? "result-risk" : "result-safe",
            result.prediction === 1
                ? "⚠️ High Risk of Heart Disease"
                : "✅ Low Risk of Heart Disease"
        );

    } catch (error) {
        console.error(error);
        setResultState("result-error", "Error occurred");
    }
});