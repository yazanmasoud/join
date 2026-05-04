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
    let contact = {
        name: name,
        email: email,
        phone: phone,
        initials: initials
    };
    console.log(contact);
    
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