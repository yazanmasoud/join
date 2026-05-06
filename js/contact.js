let contacts = [];
function openAddContact() {
document.getElementById("add-contact").classList.remove("hidden");
}

function closeAddContact() {
document.getElementById("add-contact").classList.add("hidden");
}

function createContact() {
    let name = document.getElementById("contact-name").value;
    let email = document.getElementById("contact-email").value;
    let phone = document.getElementById("contact-phone").value;

    let initials = getInitials(name);
    let color = getRandomColor();

    let contact = {
        name,
        email,
        phone,
        initials,
        color
    };

    contacts.push(contact);
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
}

function renderContacts() {
    let list = document.getElementById("contact-list");

    list.innerHTML = ""; // clear existing contacts

    for (let i = 0; i < contacts.length; i++) {
        let contact = contacts[i];

        list.innerHTML += `
            <div class="contact-item">
                <div class="contact-avatar" style="background-color: ${contact.color}">
                    ${contact.initials}
                </div>
                <div>
                    <div>${contact.name}</div>
                    <div>${contact.email}</div>
                </div>
            </div>
        `;
    }
}

function getInitials(name) {
    let words = name.trim().split(" ").filter(word => word !== "");

    if (words.length === 0) {
        return "";
    }

    if (words.length === 1) {
        return words[0][0].toUpperCase();
    }

    let firstLetter = words[0][0].toUpperCase();
    let lastLetter = words[words.length - 1][0].toUpperCase();

    return firstLetter + lastLetter;
}

function getRandomColor() {
    const colors = [
        "#FF7A00",
        "#FF5EB3",
        "#6E52FF",
        "#9327FF",
        "#00BEE8",
        "#1FD7C1",
        "#FF745E",
        "#FFA35E",
        "#FF5E5E",
        "#FF5E9E"
    ];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}