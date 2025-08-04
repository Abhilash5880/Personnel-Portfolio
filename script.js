
const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) { // Check if the element exists to prevent errors
    currentYearSpan.textContent = new Date().getFullYear();
}


document.addEventListener('DOMContentLoaded', () => {
    // === Landing Page Logic (from previous discussions, ensure it's here) ===
    const heroSection = document.getElementById('hero');
    const mainContentWrapper = document.querySelector('.main-content-wrapper');
    const enterPortfolioLink = heroSection.querySelector('.scroll-down a');

    if (enterPortfolioLink && mainContentWrapper) {
        enterPortfolioLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor link behavior

            heroSection.classList.add('fade-out'); 
            setTimeout(() => {
                heroSection.style.display = 'none'; // Hide hero section completely
                mainContentWrapper.classList.add('active'); // Show main content
                document.body.style.overflow = 'auto'; 
            }, 1000); 
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

   
    
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});

document.addEventListener('DOMContentLoaded', () => {

     // function to calculate grid and rows for varying image sizes
    function applyMasonryLayout() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (!galleryItems.length) return;

        const filterableGalleryGrid = document.getElementById('filterable-gallery-grid');
        let gridAutoRowsValue = parseFloat(getComputedStyle(filterableGalleryGrid).gridAutoRows);

        if (isNaN(gridAutoRowsValue) || gridAutoRowsValue <= 0) {
            gridAutoRowsValue = 1;
            console.warn('gridAutoRowsValue was invalid or zero, defaulting to 1 for span calculation.');
        }
        console.log('gridAutoRowsValue (after validation):', gridAutoRowsValue);

        galleryItems.forEach(item => {
            if (item.style.display === 'none') {
                item.style.gridRowEnd = '';
                return;
            }

            const image = item.querySelector('img');
            const iframe = item.querySelector('iframe'); // Check for an iframe

            // Define common elements for both images and videos
            const h3 = item.querySelector('h3');
            const p = item.querySelector('p');
            const h3Height = h3 ? h3.offsetHeight : 0;
            const pHeight = p ? p.offsetHeight : 0;
            // You can adjust this padding value if your CSS changes
            const estimatedVerticalPadding = 15 + 15 + 5 + 15;

            // This helper function will handle the final calculation and application
            const updateRowSpan = (contentHeight, contentName) => {
                const finalItemHeight = contentHeight + h3Height + pHeight + estimatedVerticalPadding;
                let rowSpan = Math.ceil(finalItemHeight / gridAutoRowsValue);

                if (isNaN(rowSpan) || rowSpan <= 0) {
                    rowSpan = 1;
                    console.error(`Calculated rowSpan for ${contentName} is invalid (${rowSpan}), defaulting to 1.`);
                }
                
                item.style.gridRowEnd = `span ${rowSpan}`;
                console.log(`Updated rowSpan for ${contentName} to ${rowSpan}`);
            };

            if (image) {
                // Logic for image items
                const imgSrc = image.src.split('/').pop();
                console.log(`--- Debugging for ${imgSrc} ---`);

                if (image.complete && image.naturalHeight !== 0) {
                    updateRowSpan(image.clientHeight, imgSrc);
                } else {
                    image.addEventListener('load', () => updateRowSpan(image.clientHeight, imgSrc), { once: true });
                }
            } else if (iframe) {
                // Logic for video items (if no image is found)
                const iframeSrc = iframe.src.split('/').pop();
                console.log(`--- Debugging for iframe ${iframeSrc} ---`);
                
                // Get the height from the iframe. The CSS will ensure this is the correct aspect ratio.
                const videoHeight = iframe.clientHeight;
                
                if (videoHeight > 0) {
                    updateRowSpan(videoHeight, iframeSrc);
                } else {
                    // Fallback if clientHeight is 0 (this shouldn't happen with the new CSS)
                    console.warn(`iframe ${iframeSrc} has 0 height, using a default value.`);
                    updateRowSpan(315, iframeSrc + " (fallback)"); // Using default YouTube height
                }
            } else {
                // Fallback for items with no image or iframe
                console.warn('Gallery item has no image or iframe, using a default height.');
                updateRowSpan(200, "Unknown Item (fallback)");
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