// Percorso verso la radice del sito: le pagine dentro PagesAndForms/ devono risalire di una cartella
const ROOT = window.location.pathname.includes("/PagesAndForms/") ? "../" : "";
const PARTIALS_DIR = ROOT + "PagesAndForms/";

// I frammenti (menu, footer...) scrivono i percorsi relativi alla radice in data-href / data-src:
// qui li trasformiamo in percorsi validi per la pagina corrente.
function fixRootPaths(container) {
    container.querySelectorAll("[data-href]").forEach((el) => {
        el.setAttribute("href", ROOT + el.dataset.href);
    });
    container.querySelectorAll("[data-src]").forEach((el) => {
        el.setAttribute("src", ROOT + el.dataset.src);
    });
}

// Carica dentro un elemento il frammento indicato in data-include (es. data-include="contact.html")
async function loadInclude(placeholder) {
    const file = PARTIALS_DIR + placeholder.dataset.include;

    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error("Non riesco a trovare " + file);
        }
        placeholder.innerHTML = await response.text();
        fixRootPaths(placeholder);
    } catch (error) {
        console.error(error);
        if (placeholder.dataset.fallback) {
            placeholder.textContent = placeholder.dataset.fallback;
        }
    }
}

// Menù hamburger (mobile) + evidenziazione della pagina corrente
function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        nav.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Chiude il menù quando si sceglie una voce (es. "Contact Us") o si preme Esc
    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setOpen(false);
    });

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("[data-href]").forEach((link) => {
        if (link.dataset.href.split("/").pop() === currentPage) {
            link.setAttribute("aria-current", "page");
        }
    });
}

// Form contatti: invia il messaggio a Web3Forms senza lasciare il sito e mostra l'esito sotto il bottone
function initContactForm() {
    const form = document.querySelector(".contact form");
    if (!form) return;

    const status = form.querySelector(".contact-status");
    const button = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        button.disabled = true;
        status.className = "contact-status";
        status.textContent = "Sending...";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: new FormData(form),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Invio non riuscito");
            }
            form.reset();
            status.classList.add("is-ok");
            status.textContent = "Thank you! Your message has been sent, we'll get back to you soon.";
        } catch (error) {
            console.error(error);
            status.classList.add("is-error");
            status.textContent = "Something went wrong. Please try again or write us at haegenofficial@gmail.com";
        } finally {
            button.disabled = false;
        }
    });
}

Promise.all([...document.querySelectorAll("[data-include]")].map(loadInclude)).then(() => {
    initMenu();
    initContactForm();
});
