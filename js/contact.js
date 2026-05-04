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

    let color = getRandomColor();
    let initials = getInitials(name);

    let contact = {
        name: name,
        email: email,
        phone: phone,
        color: color,
        initials: initials
    };
    console.log(contact);

    let contactAvatar = document.getElementById("contact-avatar");
    contactAvatar.innerText = initials;
    contactAvatar.style.backgroundColor = color;
    
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
        "#FFA35E"
    ];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}