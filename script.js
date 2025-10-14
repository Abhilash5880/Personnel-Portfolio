
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

document.addEventListener('DOMContentLoaded', () => {

    // --- Existing Image Modal Logic (Assuming it's similar to this) ---
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.querySelector('.modal-image');
    const closeImageButton = imageModal.querySelector('.close-button');
    const galleryItems = document.querySelectorAll('.gallery-item img'); // Select images within gallery-item

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            modalImage.src = item.src;
            imageModal.style.display = 'block';
        });
    });

    if (closeImageButton) {
        closeImageButton.addEventListener('click', () => {
            imageModal.style.display = 'none';
        });
    }

    // Close image modal when clicking outside the image
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });

    // --- NEW Project Modal Logic ---

    // 1. Select DOM elements for the new project modal
    const projectModal = document.getElementById('project-modal');
    const closeProjectButton = projectModal.querySelector('.close-button-rich');

    const modalProjectTitle = document.getElementById('modal-project-title');
    const modalProjectSubtitle = document.getElementById('modal-project-subtitle');
    const modalProjectMainImage = document.getElementById('modal-project-main-image');
    const modalProjectProblem = document.getElementById('modal-project-problem');
    const modalProjectFeatures = document.getElementById('modal-project-features');
    const modalProjectChallenges = document.getElementById('modal-project-challenges');
    const modaltech = document.getElementById('modal-tech');
    const modalProjectLinks = document.getElementById('modal-project-links');

    // 2. Define your project data
    //    Each object in this array corresponds to a project-item in your HTML
    //    The 'id' here should be unique and can be matched with a data-id attribute on your HTML project-item
    const projectsData = [
        {
            id: 'netflix-show-recap', // Unique ID for this project
            title: 'NETFLIX Show Recap 📽️',
            subtitle: 'This is a simple <b>Chrome Extension</b> that enhances your Netflix viewing experience by providing <b>AI-generated recaps for TV show directly into your browser</b>.',
            mainImage: 'images/4ebcc3b1-4507-4244-864f-929e85447aaa.png',
            problem: 'Have you ever been watching a TV show on Netflix, but left it halfway through and when you came after a few weeks or even months, you realize you\'ve completely forgotten what happened in the last episode? You\'re faced with a dilemma: do you try to remember and risk being lost, or do you rewind and re-watch, wasting precious time? <br></br>This project solves that exact problem. It\'s a Chrome extension that provides a quick, AI-generated summary of a TV show episode right in your browser. With a single click, you get a brief recap of the key plot points, refreshing your memory so you can jump straight into the next episode without missing a beat. It\'s the perfect solution for binge-watchers and casual viewers who want to stay on top of the story without the hassle of re-watching.',
            features: [
                "<b>Intelligent Episode Detection :</b> Automatically identifies the show, season, and episode you are currently watching on Netflix. (for now only works with NETFLIX on particular show's title page, will add more integrations later on)",
                '<b>AI-Powered Summaries</b>: Utilizes a powerful Hugging Face model to generate brief, relevant recaps of events leading up to the current episode.',
                '<b>Quick Memory Refresh :</b> Get 3-4 bullet points summarizing previous events, perfect for reminding yourself of the plot without spoilers.',
                '<b>Seamless Integration :</b> Designed to work directly within your Netflix browser tab.'
            ],

            challenges:["<b>Finding the right AI model : </b>Initially, I planned on Gemini and ChatGPT for generating results but after continuous failures I realized they were paid. However, to maintain an open-source and cost-effective approach, the focus shifted to finding a suitable free model. <br></br>This led to a search on <b>Hugging Face, a platform known for hosting a vast collection of accessible AI models for various purposes which can also be trained on different datasets</b> During model testing. An initial model, <b>zai-org/GLM-4.5</b>, while capable, would often include a verbose 'thinking' process in its output. It would start with an internal thought process like 'Thought: The user wants a summary of...' before providing the actual summary. This unnecessary text was not suitable for a user-facing application. <br></br>The issue was resolved by switching to a more suitable model, <b>Qwen/Qwen3-Coder-480B-A35B-Instruct</b>, which produced a clean, direct response without the extraneous conversational filler. The AI model finally chosen for its ability to follow instructions and generate accurate, concise recaps quickly.<br></br>",
                        "<b>Secure API Key Management:</b> Encountered lots of errors when attempting to <b>push a hard-coded API key to GitHub</b>. The solution involved <b>moving the key to a separate config.js file and adding that file to .gitignore</b> to prevent it from being exposed in the public repository.",],
            tech: ['JavaScript', 'Chrome Extension', 'HTML', 'CSS', 'Hugging Face'],
            links: {
                github: 'https://github.com/Abhilash5880/NETFLIX-Show-recaps', // Replace with actual link
                live: 'https://youtu.be/VsDYHcxCVxQ' // Replace with actual link if deployed
            }
        },
        {
            id: 'personnel-portfolio', // Unique ID for this project
            title: 'Pixel & Pigments ✒️',
            subtitle: 'A responsive, and interactive web portfolio showcasing a collection of digital art and creative expressions; designed to act as an online resume/portfolio',
            mainImage: 'images/Screenshot 2025-10-06 182300.png',
            problem: 'In today\'s competitive professional landscape, having a strong online presence is essential. A static resume often fails to capture the full scope of a person\'s skills, projects, and personality. This project aims to solve that by providing a dynamic, engaging, and easily accessible online portfolio that serves as an enhanced resume, allowing individuals to showcase their work, achievements, and unique abilities in a visually compelling manner.',
            features: [
                '<b>Responsive Design: </b>Ensures the portfolio looks great and functions perfectly on all devices, from desktops to mobile phones.',
                '<b>Project Showcase :</b> Dedicated sections to display projects with images, descriptions, and links to live demos or repositories.',
                '<b>A dedicated projects section:</b> To showcase all personnel projects under different tech. stacks with a clean pop-up modal for each project attached with respective information and links.',
                '<b>Contact Form :</b> Easy way for potential employers or collaborators to get in touch.',
                '<b>Customizable Layout:</b> Built with modular components for easy modification and personalization.'
            ],

            challenges:['<b>Gallery Grid Masonry Effect:</b> The JavaScript for calculating grid-row-end for the <b>Masonry-like layout like Pinterest</b> can sometimes result in <b>NaN errors</b> in the console, leading to inconsistent item sizing and spacing.<br></br>',
                '<b>Fine Tuning for different screen size:</b> Used <b>CSS media queries</b> to change sizes and alignment to make the website look good on all screen sizes',
                ],
            
            tech:['HTML', 'CSS', 'Javascript'],
                
            links: {
                github: 'https://github.com/Abhilash5880/Personnel-Portfolio', // Replace with actual link
                live: 'https://abhilash5880.github.io/Personnel-Portfolio/' // Replace with actual link if deployed
            }
        }
        // Add more project objects here as needed
    ];

    // 3. Add event listeners to your new .project-item elements
    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(item => {
        item.addEventListener('click', () => {
            // Get the project ID from a data attribute (you'll need to add this to your HTML project-items)
            // For now, we'll try to guess based on the title, or you can manually set it
            const projectTitle = item.querySelector('h3').textContent;
            let projectId = '';
            if (projectTitle === 'NETFLIX Show Recap') {
                projectId = 'netflix-show-recap';
            } else if (projectTitle === 'Pixel & Pigments') {
                projectId = 'personnel-portfolio';
            }
            // Ideally, your HTML project-items would have a data-id attribute:
            // <div class="project-item" data-id="netflix-show-recap">...</div>
            // Then you'd do: const projectId = item.dataset.id;

            const project = projectsData.find(p => p.id === projectId);

            if (project) {
                // Populate the modal with project data
                modalProjectTitle.innerHTML = project.title;
                modalProjectSubtitle.innerHTML = project.subtitle;
                modalProjectMainImage.src = project.mainImage;
                modalProjectMainImage.alt = project.title; // Set alt text for accessibility
                modalProjectProblem.innerHTML = project.problem;

                // Clear existing features and add new ones
                modalProjectFeatures.innerHTML = '';
                project.features.forEach(feature => {
                    const li = document.createElement('li');
                    li.innerHTML = feature;
                    modalProjectFeatures.appendChild(li);
                });

                
                modalProjectChallenges.innerHTML = '';
                project.challenges.forEach(challenge_ => {
                    const li = document.createElement('li');
                    li.innerHTML = challenge_;
                    modalProjectChallenges.appendChild(li);
                });
                

                modaltech.innerHTML = '';
                project.tech.forEach(tech_ => {
                    const li = document.createElement('li');
                    li.innerHTML = tech_;
                    modaltech.appendChild(li);
                });
                
                // Clear existing links and add new ones
                modalProjectLinks.innerHTML = '';
                if (project.links.github) {
                    const githubLink = document.createElement('a');
                    githubLink.href = project.links.github;
                    githubLink.target = '_blank';
                    githubLink.classList.add('project-link-button', 'github-link');
                    githubLink.innerHTML = 'GitHub Repo';
                    modalProjectLinks.appendChild(githubLink);
                }
                if (project.links.live) {
                    const liveLink = document.createElement('a');
                    liveLink.href = project.links.live;
                    liveLink.target = '_blank';
                    liveLink.classList.add('project-link-button', 'live-link');
                    liveLink.innerHTML = 'Live Demo';
                    modalProjectLinks.appendChild(liveLink);
                }

                // Show the modal
                projectModal.style.display = 'block';
            } else {
                console.error(`Project data not found for ID: ${projectId}`);
            }
        });
    });

    // 4. Add event listeners to close the project modal
    if (closeProjectButton) {
        closeProjectButton.addEventListener('click', () => {
            projectModal.style.display = 'none';
        });
    }

    // Close project modal when clicking outside the content area
    projectModal.addEventListener('click', (event) => {
        // Check if the click occurred directly on the modal background, not its content
        if (event.target === projectModal) {
            projectModal.style.display = 'none';
        }
    });

    // --- Footer Year Update (assuming you have this) ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }


    // --- Home Button Smooth Scroll (assuming you have this) ---
    const homeButton = document.getElementById('home-button-trigger');
    if (homeButton) {
        homeButton.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = homeButton.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // --- Filter Buttons (assuming you have this for your gallery) ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterableGalleryGrid = document.getElementById('filterable-gallery-grid');
    const galleryItemsActual = filterableGalleryGrid ? filterableGalleryGrid.querySelectorAll('.gallery-item') : [];

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' to the clicked button
            button.classList.add('active');

            const category = button.dataset.category;

            galleryItemsActual.forEach(item => {
                const itemCategory = item.dataset.category;
                if (category === 'all' || itemCategory === category) {
                    item.style.display = 'block'; // Show item
                } else {
                    item.style.display = 'none'; // Hide item
                }
            });
        });
    });
});innerHTML