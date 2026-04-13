const viewerItems = Array.from(document.querySelectorAll("[data-viewer-item]"));

if (viewerItems.length) {
    const overlay = document.createElement("div");
    overlay.className = "viewer";
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="viewer-backdrop" data-viewer-close></div>
        <div class="viewer-shell" role="dialog" aria-modal="true" aria-label="Image viewer">
            <button class="viewer-close" type="button" aria-label="Close viewer" data-viewer-close>&times;</button>
            <button class="viewer-nav viewer-nav-prev" type="button" aria-label="Previous image" data-viewer-prev>&larr;</button>
            <figure class="viewer-figure">
                <img class="viewer-image" alt="">
                <figcaption class="viewer-copy">
                    <div class="viewer-title"></div>
                    <div class="viewer-caption"></div>
                </figcaption>
            </figure>
            <button class="viewer-nav viewer-nav-next" type="button" aria-label="Next image" data-viewer-next>&rarr;</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const imageEl = overlay.querySelector(".viewer-image");
    const titleEl = overlay.querySelector(".viewer-title");
    const captionEl = overlay.querySelector(".viewer-caption");
    const prevButton = overlay.querySelector("[data-viewer-prev]");
    const nextButton = overlay.querySelector("[data-viewer-next]");

    let currentIndex = 0;
    let lastFocused = null;

    const itemData = viewerItems.map((item) => {
        const image = item.querySelector("img");
        const caption = item.querySelector("figcaption");
        return {
            src: image?.getAttribute("src") || "",
            alt: image?.getAttribute("alt") || "",
            title: item.getAttribute("data-viewer-title") || image?.getAttribute("alt") || "",
            caption: item.getAttribute("data-viewer-caption") || caption?.innerHTML || "",
        };
    });

    function render(index) {
        currentIndex = (index + itemData.length) % itemData.length;
        const item = itemData[currentIndex];
        imageEl.src = item.src;
        imageEl.alt = item.alt;
        titleEl.textContent = item.title;
        captionEl.innerHTML = item.caption;
        prevButton.hidden = itemData.length < 2;
        nextButton.hidden = itemData.length < 2;
    }

    function openViewer(index) {
        lastFocused = document.activeElement;
        render(index);
        overlay.hidden = false;
        document.body.classList.add("viewer-open");
        overlay.querySelector(".viewer-close")?.focus();
    }

    function closeViewer() {
        overlay.hidden = true;
        document.body.classList.remove("viewer-open");
        if (lastFocused instanceof HTMLElement) {
            lastFocused.focus();
        }
    }

    viewerItems.forEach((item, index) => {
        item.tabIndex = 0;
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", `Open image ${index + 1}`);
        item.addEventListener("click", () => openViewer(index));
        item.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openViewer(index);
            }
        });
    });

    overlay.addEventListener("click", (event) => {
        if (event.target instanceof HTMLElement && event.target.hasAttribute("data-viewer-close")) {
            closeViewer();
        }
    });

    prevButton.addEventListener("click", () => render(currentIndex - 1));
    nextButton.addEventListener("click", () => render(currentIndex + 1));

    overlay.addEventListener("wheel", (event) => {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 12) {
            render(currentIndex + (event.deltaX > 0 ? 1 : -1));
            event.preventDefault();
        }
    }, { passive: false });

    document.addEventListener("keydown", (event) => {
        if (overlay.hidden) {
            return;
        }
        if (event.key === "Escape") {
            closeViewer();
        } else if (event.key === "ArrowLeft") {
            render(currentIndex - 1);
        } else if (event.key === "ArrowRight") {
            render(currentIndex + 1);
        }
    });
}
