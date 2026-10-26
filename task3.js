const TOTAL_POINTS = 20;
const MIN_SKILL = 1;
const MAX_SKILL = 10;

const TAKEN_NAMES = ["Arman", "Shadow", "Dragon"];
const SKILLS = ["strength", "magic", "agility", "defense"];

const CLASS_RULES = {
    Warrior: { skill: "strength", minimum: 5, label: "Strength" },
    Mage: { skill: "magic", minimum: 5, label: "Magic" },
    Archer: { skill: "agility", minimum: 5, label: "Agility" }
};

const form = document.getElementById("characterForm");
const nameInput = document.getElementById("characterName");
const classInput = document.getElementById("characterClass");
const colorInput = document.getElementById("characterColor");
const pointsLeft = document.getElementById("pointsLeft");
const formErrors = document.getElementById("formErrors");
const skillsTotalError = document.getElementById("skillsTotalError");
const previewCard = document.getElementById("previewCard");
const result = document.getElementById("result");

let submitted = false;
const touched = new Set();

form.noValidate = true;

function getSkillTotal() {
    return SKILLS.reduce((total, skill) => {
        const value = document.getElementById(skill).value;
        return total + (value === "" ? 0 : Number(value));
    }, 0);
}

function getFields() {
    return [
        nameInput,
        classInput,
        ...SKILLS.map(skill => document.getElementById(skill))
    ];
}

function validateField(input) {
    const value = input.value.trim();
    let error = "";

    if (input.id === "characterName") {
        if (value.length < 3 || value.length > 15) {
            error = "Name must contain 3 to 15 characters.";
        } else if (!/^[\p{L}][\p{L} -]*$/u.test(value)) {
            error = "Name must start with a letter and contain only letters, spaces or hyphens.";
        } else if (TAKEN_NAMES.some(name => name.toLowerCase() === value.toLowerCase())) {
            error = "This name is already taken.";
        }
    }

    if (input.id === "characterClass") {
        if (value === "") {
            error = "Choose a character class.";
        } else {
            const rule = CLASS_RULES[value];

            if (rule && Number(document.getElementById(rule.skill).value) < rule.minimum) {
                error = `${value} requires ${rule.label} to be at least ${rule.minimum}.`;
            }
        }
    }

    if (SKILLS.includes(input.id)) {
        const number = Number(value);

        if (value === "" || !Number.isInteger(number) || number < MIN_SKILL || number > MAX_SKILL) {
            error = "Enter a whole number from 1 to 10.";
        }
    }

    input.setAttribute("aria-invalid", String(error !== ""));

    const errorElement = document.getElementById(`${input.id}Error`);

    if (errorElement) {
        errorElement.textContent = error;
    }

    return error;
}

function updateSkillsTotalError(showError) {
    const total = getSkillTotal();

    pointsLeft.textContent = TOTAL_POINTS - total;

    const error = showError && total !== TOTAL_POINTS
        ? "All four skills must total exactly 20 points."
        : "";

    skillsTotalError.textContent = error;

    return error;
}

function updatePreview() {
    document.getElementById("previewName").textContent =
        nameInput.value.trim() || "Unnamed Character";

    document.getElementById("previewClass").textContent =
        classInput.value || "Not selected";

    for (const skill of SKILLS) {
        const value = document.getElementById(skill).value;
        const previewId = `preview${skill[0].toUpperCase()}${skill.slice(1)}`;

        document.getElementById(previewId).textContent = value || "0";
    }

    previewCard.style.setProperty("--character-color", colorInput.value);

    updateSkillsTotalError(submitted || SKILLS.some(skill => touched.has(skill)));
}

function validateAll() {
    let errors = 0;

    for (const field of getFields()) {
        if (validateField(field) !== "") {
            errors++;
        }
    }

    if (updateSkillsTotalError(true) !== "") {
        errors++;
    }

    return errors;
}

function updateRelatedValidation(target) {
    if (target.id === "characterClass" || SKILLS.includes(target.id)) {
        if (touched.has(classInput.id) || submitted) {
            validateField(classInput);
        }
    }

    if (SKILLS.includes(target.id)) {
        updateSkillsTotalError(submitted || SKILLS.some(skill => touched.has(skill)));
    }
}

form.addEventListener("input", function (event) {
    const target = event.target;

    updatePreview();

    if (touched.has(target.id) || submitted) {
        validateField(target);
    }

    updateRelatedValidation(target);

    result.replaceChildren();
});

form.addEventListener("focusout", function (event) {
    const target = event.target;

    if (!target.matches("input, select")) {
        return;
    }

    touched.add(target.id);
    validateField(target);

    if (target.id === "characterClass" || SKILLS.includes(target.id)) {
        if (touched.has(classInput.id) || submitted) {
            validateField(classInput);
        }
    }

    updateSkillsTotalError(submitted || SKILLS.some(skill => touched.has(skill)));
});

function createResult() {
    const card = document.createElement("div");
    card.classList.add("success");
    card.style.setProperty("--character-color", colorInput.value);

    const heading = document.createElement("h2");
    heading.textContent = nameInput.value.trim();

    const characterClass = document.createElement("p");
    characterClass.textContent = `Class: ${classInput.value}`;

    card.append(heading, characterClass);

    for (const skill of SKILLS) {
        const item = document.createElement("p");
        const label = skill[0].toUpperCase() + skill.slice(1);

        item.textContent = `${label}: ${document.getElementById(skill).value}`;
        card.append(item);
    }

    result.replaceChildren(card);
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitted = true;

    const errors = validateAll();

    if (errors > 0) {
        formErrors.textContent = `Please correct your errors. Total errors: ${errors}.`;

        const firstInvalid = form.querySelector('[aria-invalid="true"]');

        if (firstInvalid) {
            firstInvalid.focus();
        } else {
            document.getElementById("strength").focus();
        }

        return;
    }

    formErrors.textContent = "";
    createResult();

    form.reset();
    touched.clear();
    submitted = false;

    for (const field of getFields()) {
        field.removeAttribute("aria-invalid");
    }

    for (const skill of SKILLS) {
        document.getElementById(`${skill}Error`).textContent = "";
    }

    document.getElementById("characterNameError").textContent = "";
    document.getElementById("characterClassError").textContent = "";
    skillsTotalError.textContent = "";

    updatePreview();
});
    
updatePreview();