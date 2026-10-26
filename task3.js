const TOTAL_POINTS = 20;
const MIN_SKILL = 1;
const MAX_SKILL = 10;

const TAKEN_NAMES = ["Arman", "Shadow", "Dragon"];

const SKILLS = ["strength", "magic", "agility", "defense"];

const CLASS_RULES = {
    Warrior: { skill: "strength", minimum: 5 },
    Mage: { skill: "magic", minimum: 5 },
    Archer: { skill: "agility", minimum: 5 }
};

const form = document.getElementById("characterForm");
const nameInput = document.getElementById("characterName");
const classInput = document.getElementById("characterClass");
const colorInput = document.getElementById("characterColor");
const pointsLeft = document.getElementById("pointsLeft");
const formErrors = document.getElementById("formErrors");
const previewCard = document.getElementById("previewCard");
const result = document.getElementById("result");

let submitted = false;
const touched = new Set();

form.noValidate = true;

function getSkillTotal() {
    let total = 0;

    for (const skill of SKILLS) {
        total += Number(document.getElementById(skill).value);
    }

    return total;
}

function validateField(input) {
    const value = input.value.trim();
    let error = "";

    if (input.id === "characterName") {
        if (value.length < 3 || value.length > 15) {
            error = "Name must contain 3 to 15 characters.";
        } else if (TAKEN_NAMES.some(name => name.toLowerCase() === value.toLowerCase())) {
            error = "This name is already taken.";
        }
    }

    if (input.id === "characterClass" && value === "") {
        error = "Choose a character class.";
    }

    if (SKILLS.includes(input.id)) {
        const number = Number(value);

        if (value === "" || !Number.isInteger(number) || number < MIN_SKILL || number > MAX_SKILL) {
            error = "Enter a whole number from 1 to 10.";
        } else if (getSkillTotal() !== TOTAL_POINTS) {
            error = "All four skills must total exactly 20 points.";
        }
    }

    if (input.id === "characterClass" && value !== "") {
        const rule = CLASS_RULES[value];

        if (rule && Number(document.getElementById(rule.skill).value) < rule.minimum) {
            error = `${value} requires ${rule.skill} to be at least ${rule.minimum}.`;
        }
    }

    if (SKILLS.includes(input.id) && classInput.value !== "") {
        const rule = CLASS_RULES[classInput.value];

        if (rule && rule.skill === input.id && Number(input.value) < rule.minimum) {
            error = `${classInput.value} requires this skill to be at least ${rule.minimum}.`;
        }
    }

    input.setAttribute("aria-invalid", String(error !== ""));

    const errorElement = document.getElementById(`${input.id}Error`);

    if (errorElement) {
        errorElement.textContent = error;
    }

    return error;
}

function updatePreview() {
    document.getElementById("previewName").textContent =
        nameInput.value.trim() || "Unnamed Character";

    document.getElementById("previewClass").textContent =
        classInput.value || "Not selected";

    for (const skill of SKILLS) {
        document.getElementById(`preview${skill[0].toUpperCase()}${skill.slice(1)}`).textContent =
            document.getElementById(skill).value || "0";
    }

    previewCard.style.borderColor = colorInput.value;

    pointsLeft.textContent = TOTAL_POINTS - getSkillTotal();

    if (submitted) {
        validateAll();
    }
}

function validateAll() {
    let errors = 0;

    const fields = [nameInput, classInput, ...SKILLS.map(skill => document.getElementById(skill))];

    for (const field of fields) {
        if (validateField(field) !== "") {
            errors++;
        }
    }

    if (getSkillTotal() !== TOTAL_POINTS) {
        errors++;
    }

    return errors;
}

form.addEventListener("input", function (event) {
    updatePreview();

    if (touched.has(event.target.id) || submitted) {
        validateField(event.target);
    }

    result.replaceChildren();
});

form.addEventListener("change", function (event) {
    if (event.target === classInput) {
        updatePreview();

        if (touched.has(classInput.id) || submitted) {
            validateField(classInput);
        }
    }
});

form.addEventListener("focusout", function (event) {
    if (event.target.matches("input, select")) {
        touched.add(event.target.id);
        validateField(event.target);
    }
});

function createResult() {
    const card = document.createElement("div");
    card.classList.add("success");
    card.style.borderColor = colorInput.value;

    const heading = document.createElement("h2");
    heading.textContent = nameInput.value.trim();

    const characterClass = document.createElement("p");
    characterClass.textContent = `Class: ${classInput.value}`;

    card.append(heading, characterClass);

    for (const skill of SKILLS) {
        const item = document.createElement("p");
        item.textContent = `${skill}: ${document.getElementById(skill).value}`;
        card.append(item);
    }

    result.replaceChildren(card);
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitted = true;

    const errors = validateAll();

    if (errors > 0) {
        formErrors.textContent = `Please correct your errors. Invalid fields: ${errors}.`;

        const firstInvalid = form.querySelector('[aria-invalid="true"]');

        if (firstInvalid) {
            firstInvalid.focus();
        }

        return;
    }

    formErrors.textContent = "";
    createResult();

    form.reset();
    touched.clear();
    submitted = false;

    for (const field of form.querySelectorAll("input, select")) {
        field.removeAttribute("aria-invalid");
    }

    for (const skill of SKILLS) {
        document.getElementById(`${skill}Error`).textContent = "";
    }

    document.getElementById("characterNameError").textContent = "";
    document.getElementById("characterClassError").textContent = "";

    updatePreview();
});

updatePreview();
