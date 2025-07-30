// Get the current year for the footer copyright
const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) { // Check if the element exists to prevent errors
    currentYearSpan.textContent = new Date().getFullYear();
}

/////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
    // === Landing Page Logic (from previous discussions, ensure it's here) ===
    const heroSection = document.getElementById('hero');
    const mainContentWrapper = document.querySelector('.main-content-wrapper');
    const enterPortfolioLink = heroSection.querySelector('.scroll-down a');

    if (enterPortfolioLink && mainContentWrapper) {
        enterPortfolioLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor link behavior

            heroSection.classList.add('fade-out'); // Add a class to fade out hero
            // In CSS, you'd define .hero-section.fade-out { opacity: 0; visibility: hidden; transition: opacity 1s ease, visibility 1s ease; }

            // Wait for fade-out to complete (adjust time based on your CSS transition)
            setTimeout(() => {
                heroSection.style.display = 'none'; // Hide hero section completely
                mainContentWrapper.classList.add('active'); // Show main content
                document.body.style.overflow = 'auto'; // Re-enable body scrolling
                // For initial hidden state, make sure html, body has overflow: hidden;
                // document.documentElement.style.overflow = 'auto'; // For html element
            }, 1000); // Match this timeout to your hero fade-out transition duration
        });
    }

    // --- Image Modal Logic ---
    const galleryImages = document.querySelectorAll('.gallery-item img');
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.querySelector('.modal-image');
    const closeButton = document.querySelector('.close-button');

    // Function to open the modal
    function openImageModal(imageSrc) {
        modalImage.src = imageSrc;
        imageModal.classList.add('active'); // Add 'active' class to show modal
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    // Function to close the modal
    function closeImageModal() {
        imageModal.classList.remove('active'); // Remove 'active' class to hide modal
        document.body.style.overflow = 'auto'; // Re-enable scrolling background
    }

    // Add click listeners to all gallery images
    galleryImages.forEach(image => {
        image.addEventListener('click', () => {
            openImageModal(image.src);
        });
    });

    // Add click listener to the close button
    closeButton.addEventListener('click', closeImageModal);

    // Close modal if user clicks outside the image (on the modal background)
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) { // Check if the click was directly on the modal background
            closeImageModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.classList.contains('active')) {
            closeImageModal();
        }
    });

    // === Prevent Right-Click/Download on Modal Image ===
    modalImage.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevents the default right-click context menu
        alert("Image download is disabled."); // Optional: provide user feedback
    });

    // If you want to prevent right-click on ALL gallery images (even before modal opens)
    // galleryImages.forEach(image => {
    //     image.addEventListener('contextmenu', (e) => {
    //         e.preventDefault();
    //         alert("Image download is disabled.");
    //     });
    // });

    // --- Footer Year (ensure this is also in your JS) ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
/////////////////////////////
// Ensure all DOM content is loaded before running scripts that manipulate elements
document.addEventListener('DOMContentLoaded', () => {

    // function to calculate grid and rows for varying image sizes
    function applyMasonryLayout() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (!galleryItems.length) return;

        const filterableGalleryGrid = document.getElementById('filterable-gallery-grid');
        let gridAutoRowsValue = parseFloat(getComputedStyle(filterableGalleryGrid).gridAutoRows); // Get the computed value

        // --- NEW/MODIFIED: Robustness check for gridAutoRowsValue ---
        if (isNaN(gridAutoRowsValue) || gridAutoRowsValue <= 0) {
            gridAutoRowsValue = 1; // Default to 1 if it cannot be parsed or is invalid
            console.warn('gridAutoRowsValue was invalid or zero, defaulting to 1 for span calculation.');
        }
        console.log('gridAutoRowsValue (after validation):', gridAutoRowsValue); // Log validated value

        galleryItems.forEach(item => {
            if (item.style.display === 'none') {
                item.style.gridRowEnd = ''; // Reset grid-row-end for hidden items
                return; // Skip hidden items
            }

            const image = item.querySelector('img');
            if (image) {
                // Reset grid-row-end temporarily to get accurate clientHeight before recalculating
                item.style.gridRowEnd = '';

                const updateRowSpan = () => {
                    const h3 = item.querySelector('h3');
                    const p = item.querySelector('p');

                    const h3Height = h3 ? h3.offsetHeight : 0; // Use offsetHeight for full height including padding/border
                    const pHeight = p ? p.offsetHeight : 0; // Use offsetHeight

                    let imgHeight = image.clientHeight; // clientHeight is fine for image content area
                    const imgSrc = image.src.split('/').pop(); // Get image filename for logging
                    console.log(`--- Debugging for ${imgSrc} ---`);
                    console.log(`Raw image.clientHeight: ${imgHeight}`);

                    // Enhanced check for image loading, as images might not have loaded immediately
                    if (imgHeight === 0 && !image.complete) {
                        console.warn(`Image ${imgSrc} not yet loaded, attempting to wait or use placeholder.`);
                        // If image not loaded, attach a 'load' listener and return, it will update then
                        image.addEventListener('load', () => {
                            // Ensure this is called with the specific item's context
                            const newImgHeight = image.clientHeight;
                            const newFinalItemHeight = newImgHeight + h3Height + pHeight + estimatedVerticalPadding;
                            const newRowSpan = Math.ceil(newFinalItemHeight / gridAutoRowsValue);
                            item.style.gridRowEnd = `span ${newRowSpan}`;
                            console.log(`Image ${imgSrc} loaded, updated rowSpan to ${newRowSpan}`);
                        }, { once: true });
                        return; // Exit this iteration, the 'load' event will trigger the update
                    } else if (imgHeight === 0 && image.complete) {
                        console.error(`Image ${imgSrc} loaded but has 0 height! This is problematic, using placeholder.`);
                        imgHeight = 200; // Fallback placeholder height if truly 0 after load
                    }
                    console.log(`Adjusted image height for calculation: ${imgHeight}`);


                    // Adjust this based on your CSS inspection of .gallery-item padding and h3/p margins
                    // (e.g., padding-top/bottom on .gallery-item, margin-bottom on h3 and p)
                    // For your CSS, .gallery-item h3 has margin: 15px 15px 5px 15px; (so 5px bottom margin)
                    // .gallery-item p has margin: 0 15px 15px 15px; (so 15px bottom margin)
                    // You might have implicit vertical padding on .gallery-item itself.
                    // A safer way is to measure the total height after elements are rendered:
                    // const totalContentHeight = item.offsetHeight - image.offsetHeight; // This is tricky as image height is variable.
                    // The 'estimatedVerticalPadding' is usually for fixed padding/margin.
                    const estimatedVerticalPadding = 15 + 15 + 5 + 15; // Example based on your margins (top/bottom h3 margin + p margin)
                                                                    // Re-evaluate this if the padding/margins on .gallery-item itself change.

                    const finalItemHeight = imgHeight + h3Height + pHeight + estimatedVerticalPadding;

                    console.log(`H3 Height: ${h3Height}`);
                    console.log(`P Height: ${pHeight}`);
                    console.log(`Estimated Padding: ${estimatedVerticalPadding}`);
                    console.log(`Final Item Height (total item content height): ${finalItemHeight}`);

                    let rowSpan = Math.ceil(finalItemHeight / gridAutoRowsValue);

                    // Final validation for rowSpan to prevent NaN or non-positive values
                    if (isNaN(rowSpan) || rowSpan <= 0) {
                        rowSpan = 1; // Default to 1 to prevent layout issues
                        console.error(`Calculated rowSpan for ${imgSrc} is invalid (${rowSpan}), defaulting to 1.`);
                    }
                    console.log(`Calculated Row Span: ${rowSpan}`);

                    item.style.gridRowEnd = `span ${rowSpan}`;
                };

                // Use image.decode() for more reliable measurement after decoding
                if (image.complete && image.naturalHeight !== 0) {
                    updateRowSpan();
                } else {
                    image.addEventListener('load', updateRowSpan, { once: true });
                    // If image is still not loaded or has 0 height after load, a small timeout can sometimes help
                    // (though 'load' event is generally preferred)
                    // setTimeout(() => { if (image.clientHeight === 0) updateRowSpan(); }, 100);
                }
            }
        });
    }


    // --- Artwork Filtering Functionality ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const filterableGalleryGrid = document.getElementById('filterable-gallery-grid');

    // Check if gallery elements exist before proceeding with filtering logic
    if (filterButtons.length > 0 && galleryItems.length > 0 && filterableGalleryGrid) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove 'active' class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add 'active' class to the clicked button
                button.classList.add('active');

                const category = button.dataset.category; // Get the category from the data-category attribute

                // Iterate over all gallery items
                galleryItems.forEach(item => {
                    const itemCategory = item.dataset.category; // Get the category of the current item

                    // Show or hide items based on the selected category
                    if (category === 'all' || itemCategory === category) {
                        item.style.display = 'block'; // Show the item
                    } else {
                        item.style.display = 'none'; // Hide the item
                    }
                });

                // IMPORTANT: Re-apply masonry layout after filtering changes visibility
                // Use a small delay to allow the browser to process display changes
                setTimeout(applyMasonryLayout, 50); // Small delay, adjust if needed
            });
        });

        // Trigger a click on the 'All Artworks' button on initial load
        const allArtworksButton = document.querySelector('.filter-btn[data-category="all"]');
        if (allArtworksButton) {
            allArtworksButton.click();
        } else {
            // Fallback: If 'All Artworks' button isn't found, ensure all items are displayed
            galleryItems.forEach(item => item.style.display = 'block');
            applyMasonryLayout(); // Also apply masonry if no 'all' button is clicked
        }
    } else {
        console.warn("Could not find all necessary elements for gallery filtering. Skipping filtering logic.");
    }

    // --- Fixed Landing Page Interaction (main-content-wrapper reveal) ---
    const homeButtonTrigger = document.getElementById('home-button-trigger'); // The "Home" button on the landing page
    const heroSection = document.getElementById('hero'); // The full-screen landing page section
    const mainContentWrapper = document.querySelector('.main-content-wrapper'); // The wrapper for all content after hero
    const htmlElement = document.documentElement; // Represents the <html> tag
    const bodyElement = document.body; // Represents the <body> tag

    // Only set up the landing page logic if all required elements exist
    if (homeButtonTrigger && heroSection && mainContentWrapper && htmlElement && bodyElement) {
        homeButtonTrigger.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior (jumping directly)

            heroSection.style.opacity = '0';
            heroSection.style.pointerEvents = 'none';

            setTimeout(() => {
                heroSection.style.display = 'none';

                htmlElement.style.overflow = 'auto';
                bodyElement.style.overflow = 'auto';

                mainContentWrapper.classList.add('active');

                // Scroll to the top of the main content wrapper after it becomes visible
                setTimeout(() => {
                    mainContentWrapper.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 50);
            }, 800); // This timeout (800ms) MUST match the transition duration set for heroSection's opacity in style.css
        });
    } else {
        console.warn("Could not find all necessary elements for fixed landing page. Ensuring main content is visible by default.");
        if (mainContentWrapper) {
            mainContentWrapper.classList.add('active');
        }
        htmlElement.style.overflow = 'auto';
        bodyElement.style.overflow = 'auto';
    }

    // *** IMPORTANT: Initial call for masonry layout when the page loads ***
    applyMasonryLayout();

    // *** Re-apply if window is resized (for responsiveness) ***
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyMasonryLayout, 250); // Debounce resize for performance
    });

});