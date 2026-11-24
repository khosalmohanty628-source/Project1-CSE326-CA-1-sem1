/**
 * Punjab Travel Guide - Main Interactive Scripts
 * Handles:
 * 1. Login & Registration UI / Validation
 * 2. Lightbox Image Viewer for Mini Galleries & Image Gallery
 * 3. City Comments & Reviews System with LocalStorage persistence
 * 4. Image Upload & Filter System for Gallery Page
 */

// ============================================================================
// 1. LIGHTBOX SYSTEM (Shared across all pages)
// ============================================================================
function ensureLightboxExists() {
    if (document.getElementById('image-lightbox')) return;

    const lightbox = document.createElement('div');
    lightbox.id = 'image-lightbox';
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = `
        <span class="lightbox-close" title="Close (Esc)">&times;</span>
        <div class="lightbox-content">
            <img id="lightbox-img" src="" alt="Enlarged view">
            <div class="lightbox-caption">
                <span id="lightbox-badge" class="angle-badge"></span>
                <h4 id="lightbox-title"></h4>
                <p id="lightbox-desc"></p>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
}

function openLightbox(src, title, badge, desc) {
    ensureLightboxExists();
    const lightbox = document.getElementById('image-lightbox');
    const img = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');
    const badgeEl = document.getElementById('lightbox-badge');
    const descEl = document.getElementById('lightbox-desc');

    img.src = src;
    img.alt = title || 'Punjab landmark';
    titleEl.textContent = title || 'Landmark View';

    if (badge) {
        badgeEl.textContent = badge;
        badgeEl.style.display = 'inline-block';
    } else {
        badgeEl.style.display = 'none';
    }

    descEl.textContent = desc || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Bind Mini Gallery Items for Lightbox
function initMiniGalleryLightbox() {
    ensureLightboxExists();
    const items = document.querySelectorAll('.mini-gallery-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4') ? item.querySelector('h4').textContent : '';
            const desc = item.querySelector('p') ? item.querySelector('p').textContent : '';
            const badge = item.querySelector('.angle-badge') ? item.querySelector('.angle-badge').textContent : '';
            if (img) {
                openLightbox(img.src, title, badge, desc);
            }
        });
    });

    // Also attach to Explore section images in city pages
    const exploreItems = document.querySelectorAll('.image_gallery > div');
    exploreItems.forEach(card => {
        // Only if it doesn't already have an explicit mini-gallery class
        if (!card.classList.contains('mini-gallery-item') && !card.classList.contains('gallery-page-item')) {
            const img = card.querySelector('img');
            const p = card.querySelector('p');
            if (img && !card.dataset.lightboxBound) {
                card.dataset.lightboxBound = 'true';
                // Click on image opens lightbox if not directly clicking link
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', (e) => {
                    const title = p ? p.textContent.trim() : 'Punjab Landmark';
                    openLightbox(img.src, title, 'Explore View', 'Click anywhere outside to close.');
                });
            }
        }
    });
}

// ============================================================================
// 2. CITY REVIEWS & COMMENTS SYSTEM
// ============================================================================
const DEFAULT_CITY_REVIEWS = {
    'amritsar': [
        {
            id: 'amt-1',
            name: 'Jasleen Kaur',
            rating: 5,
            season: 'Winter (December)',
            text: 'Visiting Sri Harmandir Sahib during Amrit Vela (early morning) is a truly transcendent spiritual experience. The reflection of the Golden Temple on the holy Sarovar water in the morning light is breathtaking. Make sure to have Guru ka Langar and visit Jallianwala Bagh nearby.',
            date: 'February 12, 2026',
            helpful: 34
        },
        {
            id: 'amt-2',
            name: 'Rohan Sharma',
            rating: 5,
            season: 'Autumn (October)',
            text: 'The evening retreat ceremony at Attari-Wagah border was electrifying! The sheer energy of the crowd and patriotism was unforgettable. Amritsari kulchas near Town Hall and the sound & light show at Gobindgarh Fort are musts!',
            date: 'January 28, 2026',
            helpful: 21
        },
        {
            id: 'amt-3',
            name: 'Michael Henderson',
            rating: 5,
            season: 'Spring (March)',
            text: 'The architecture, the sacred atmosphere, and the extraordinary hospitality of the people make Amritsar the crown jewel of northern India. The evening illumination view of the temple is magnificent.',
            date: 'November 15, 2025',
            helpful: 18
        }
    ],
    'chandigarh': [
        {
            id: 'chd-1',
            name: 'Amit Verma',
            rating: 5,
            season: 'Winter (January)',
            text: 'Chandigarh’s urban layout and greenery are unmatched in India. Walking through Nek Chand’s Rock Garden felt like entering a magical sculpture kingdom made from recycled wonders. Sunset stroll by Sukhna Lake is completely serene.',
            date: 'February 10, 2026',
            helpful: 29
        },
        {
            id: 'chd-2',
            name: 'Priya Bansal',
            rating: 5,
            season: 'Spring (February)',
            text: 'Visited during the annual Rose Festival at Zakir Hussain Rose Garden. The varieties of blooming flowers were gorgeous. Capitol Complex architecture by Le Corbusier is a modernist masterpiece.',
            date: 'January 19, 2026',
            helpful: 15
        }
    ],
    'anandpur-sahib': [
        {
            id: 'and-1',
            name: 'Manpreet Singh',
            rating: 5,
            season: 'Spring (Hola Mohalla)',
            text: 'Virasat-e-Khalsa museum is an architectural and cultural marvel. The audiovisual exhibits detailing Punjab and Sikh history left our entire family in awe. The spiritual aura of Takht Sri Kesgarh Sahib on the hilltop is deeply peaceful.',
            date: 'February 14, 2026',
            helpful: 42
        },
        {
            id: 'and-2',
            name: 'Harjit Sodhi',
            rating: 5,
            season: 'Winter (November)',
            text: 'The holy atmosphere of Anandpur Sahib is unmatched. The view of the Shivalik hill backdrop behind Takhat Sri Kesgarh Sahib makes it majestic. Highly recommend stopping at Jhajjar Bachauli wildlife sanctuary too.',
            date: 'December 20, 2025',
            helpful: 19
        }
    ],
    'bathinda': [
        {
            id: 'bth-1',
            name: 'Gurinder Sandhu',
            rating: 5,
            season: 'Winter (December)',
            text: 'Qila Mubarak is one of India’s oldest surviving brick forts—standing where Empress Razia Sultana was held was surreal. Bathinda thermal lakes and Rose Garden are great spots for evening leisure.',
            date: 'January 25, 2026',
            helpful: 23
        },
        {
            id: 'bth-2',
            name: 'Simran Gill',
            rating: 5,
            season: 'Autumn (October)',
            text: 'Takht Sri Damdama Sahib at Talwandi Sabo holds immense spiritual power. Bathinda has wonderful Punjabi hospitality, broad streets, and rich historical depth.',
            date: 'November 30, 2025',
            helpful: 17
        }
    ],
    'fatehgarh-sahib': [
        {
            id: 'fgh-1',
            name: 'Navjot Kaur',
            rating: 5,
            season: 'Winter (Shaheedi Jor Mela)',
            text: 'Gurdwara Fatehgarh Sahib and Jyoti Swaroop Sahib commemorate the supreme courage and sacrifice of the Chhote Sahibzade. It evokes profound reverence. Aam Khas Bagh’s Mughal waterworks are also very pleasant to explore.',
            date: 'January 14, 2026',
            helpful: 38
        },
        {
            id: 'fgh-2',
            name: 'Rajat Mittal',
            rating: 5,
            season: 'Autumn (November)',
            text: 'Visiting the ancient archaeological mound at Sanghol gave us incredible insight into the Kushan dynasty history. A peaceful, solemn, and deeply historical district of Punjab.',
            date: 'December 05, 2025',
            helpful: 14
        }
    ],
    'kapurthala': [
        {
            id: 'kpt-1',
            name: 'Philippe Dupont',
            rating: 5,
            season: 'Winter (December)',
            text: 'Often called the "Paris of Punjab", and for good reason! Jagatjit Palace’s French neoclassical architecture is stunning. The Moorish Mosque with its Moroccan glazed tiles is exceptionally rare and magnificent.',
            date: 'February 02, 2026',
            helpful: 27
        },
        {
            id: 'kpt-2',
            name: 'Kirandeep Dhillon',
            rating: 5,
            season: 'Spring (March)',
            text: 'Shalimar Gardens and Panch Mandir are serene heritage spots. Kapurthala has a unique regal charm distinct from anywhere else in Punjab. Great place for photography lovers!',
            date: 'January 10, 2026',
            helpful: 16
        }
    ],
    'ludhiana': [
        {
            id: 'ldh-1',
            name: 'Hardeep Brar',
            rating: 5,
            season: 'Winter (January)',
            text: 'The Maharaja Ranjit Singh War Museum has an extraordinary collection of vintage armaments, fighter planes, and military medals. The Clock Tower (Ghanta Ghar) in the heart of town gives you the true vibrant pulse of industrial Punjab.',
            date: 'February 08, 2026',
            helpful: 31
        },
        {
            id: 'ldh-2',
            name: 'Tanya Gupta',
            rating: 5,
            season: 'Autumn (October)',
            text: 'PAU (Punjab Agricultural University) campus is lush, clean, and educational. Fantastic local street food around Sarabha Nagar and lively shopping near Chaura Bazaar.',
            date: 'December 18, 2025',
            helpful: 20
        }
    ],
    'mohali': [
        {
            id: 'mhl-1',
            name: 'Vikramaditya Rao',
            rating: 5,
            season: 'Spring (March)',
            text: 'The Baba Banda Singh Bahadur War Memorial minar is monumental and gorgeously illuminated at night. Watched an IPL match at I.S. Bindra stadium—the atmosphere was electric!',
            date: 'January 22, 2026',
            helpful: 35
        },
        {
            id: 'mhl-2',
            name: 'Sonia Rawat',
            rating: 5,
            season: 'Winter (November)',
            text: 'Siswan Dam is a fantastic quiet nature escape right on the edge of the Shivalik hills for boating and picnics. Gurdwara Amb Sahib has rich historical importance and peaceful vibes.',
            date: 'December 28, 2025',
            helpful: 19
        }
    ],
    'pathankot': [
        {
            id: 'ptk-1',
            name: 'Anuj Mehra',
            rating: 5,
            season: 'Autumn (October)',
            text: 'The scenic drive along Ranjit Sagar Dam is spectacular! The turquoise waters surrounded by green hills were refreshing. Mukteshwar Mahadev cave temples carved into the rock along river Ravi are ancient and sacred.',
            date: 'February 04, 2026',
            helpful: 28
        },
        {
            id: 'ptk-2',
            name: 'Deepali Sen',
            rating: 5,
            season: 'Spring (March)',
            text: 'Kathlour-Kushlian wildlife sanctuary is a paradise for birdwatchers and nature lovers. Pathankot is the perfect scenic gateway connecting Punjab to Himachal and Kashmir.',
            date: 'January 06, 2026',
            helpful: 15
        }
    ],
    'patiala': [
        {
            id: 'ptl-1',
            name: 'Jaswinder Ahluwalia',
            rating: 5,
            season: 'Winter (December)',
            text: 'Qila Mubarak and the Sheesh Mahal mirror palace reflect the opulent heritage of Patiala’s royalty. Don’t leave without exploring Baradari Gardens and shopping for authentic Patiala Shahi turbans, suits, and handcrafted juttis.',
            date: 'February 11, 2026',
            helpful: 33
        },
        {
            id: 'ptl-2',
            name: 'Meenakshi Nair',
            rating: 5,
            season: 'Autumn (November)',
            text: 'Moti Bagh Palace is majestic. The city preserves the finest classical music traditions and royal culinary flavors. Loved every minute of our heritage walk!',
            date: 'December 12, 2025',
            helpful: 22
        }
    ],
    'ropar': [
        {
            id: 'rpr-1',
            name: 'Davinder Saini',
            rating: 5,
            season: 'Winter (January)',
            text: 'Standing at the Harappan Indus Valley archaeological site in Ropar gave me chills—thousands of years of civilization right here! The Ropar Archaeological Museum exhibits are beautifully maintained and curated.',
            date: 'February 09, 2026',
            helpful: 30
        },
        {
            id: 'rpr-2',
            name: 'Natasha Roy',
            rating: 5,
            season: 'Winter (December)',
            text: 'Ropar Wetland is teeming with migratory birds during winter. Gurudwara Sri Bhatha Sahib has peaceful spiritual energy. Great weekend road trip destination.',
            date: 'January 15, 2026',
            helpful: 18
        }
    ]
};

function getCityReviews(cityKey) {
    const storageKey = `punjab_reviews_${cityKey}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse reviews from storage', e);
        }
    }
    const defaultReviews = DEFAULT_CITY_REVIEWS[cityKey] || [];
    localStorage.setItem(storageKey, JSON.stringify(defaultReviews));
    return defaultReviews;
}

function saveCityReviews(cityKey, reviews) {
    localStorage.setItem(`punjab_reviews_${cityKey}`, JSON.stringify(reviews));
}

function renderReviews(cityKey) {
    const feed = document.getElementById(`reviews-feed-${cityKey}`);
    if (!feed) return;

    const reviews = getCityReviews(cityKey);
    feed.innerHTML = '';

    if (reviews.length === 0) {
        feed.innerHTML = `
            <div style="text-align:center; padding: 30px; color:#777;">
                <p>No reviews yet. Be the first to share your experience!</p>
            </div>
        `;
        return;
    }

    reviews.forEach(review => {
        const initials = review.name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'PT';

        const starDisplay = '★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating));

        const card = document.createElement('div');
        card.className = `review-card ${review.userAdded ? 'user-added' : ''}`;
        card.id = `review-${review.id}`;
        card.innerHTML = `
            <div class="reviewer-header">
                <div class="reviewer-profile">
                    <div class="reviewer-avatar">${initials}</div>
                    <div>
                        <h4 class="reviewer-name">${escapeHtml(review.name)} <span class="verified-tag">✓ Verified Traveler</span></h4>
                        <p class="review-visit-date">Visited: ${escapeHtml(review.season || 'Recent visit')} • ${escapeHtml(review.date || 'Recent')}</p>
                    </div>
                </div>
                <div class="review-stars" title="${review.rating} out of 5 stars">${starDisplay}</div>
            </div>
            <p class="review-text">${escapeHtml(review.text)}</p>
            <div class="review-footer">
                <span>Shared on Punjab Travel Guide</span>
                <button type="button" class="helpful-btn" onclick="voteHelpful('${cityKey}', '${review.id}')">
                    👍 Helpful (${review.helpful || 0})
                </button>
            </div>
        `;
        feed.appendChild(card);
    });

    // Update summary score count if available
    const countEl = document.querySelector(`.reviews-list-card .total-reviews-count`);
    if (countEl) {
        countEl.textContent = `Based on ${reviews.length} traveler reviews`;
    }
}

function voteHelpful(cityKey, reviewId) {
    const reviews = getCityReviews(cityKey);
    const target = reviews.find(r => r.id === reviewId);
    if (target) {
        target.helpful = (target.helpful || 0) + 1;
        saveCityReviews(cityKey, reviews);
        renderReviews(cityKey);
    }
}

function handleReviewSubmit(event, cityKey) {
    event.preventDefault();
    const nameInput = document.getElementById(`reviewer-name-${cityKey}`);
    const ratingInput = document.getElementById(`review-rating-${cityKey}`);
    const seasonSelect = document.getElementById(`review-season-${cityKey}`);
    const commentInput = document.getElementById(`reviewer-comment-${cityKey}`);

    if (!nameInput || !commentInput) return;

    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    const rating = parseFloat(ratingInput ? ratingInput.value : 5) || 5;
    const season = seasonSelect ? seasonSelect.value : 'Recent visit';

    if (!name || !comment) {
        alert('Please provide your name and review details.');
        return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const newReview = {
        id: 'user-' + Date.now(),
        name: name,
        rating: rating,
        season: season,
        text: comment,
        date: formattedDate,
        helpful: 1,
        userAdded: true
    };

    const reviews = getCityReviews(cityKey);
    reviews.unshift(newReview);
    saveCityReviews(cityKey, reviews);
    renderReviews(cityKey);

    // Reset inputs
    nameInput.value = '';
    commentInput.value = '';

    // Reset star picker to 5
    const starPicker = document.getElementById(`star-picker-${cityKey}`);
    if (starPicker) {
        updateStarPickerUI(starPicker, 5);
        if (ratingInput) ratingInput.value = '5';
        const ratingText = document.getElementById(`rating-text-${cityKey}`);
        if (ratingText) ratingText.textContent = '5.0 / 5.0 (Exceptional)';
    }

    // Friendly feedback
    alert('Thank you! Your review has been posted and will help other Punjab travelers.');
}

function updateStarPickerUI(container, score) {
    const stars = container.querySelectorAll('.star');
    stars.forEach(star => {
        const val = parseInt(star.dataset.value, 10);
        if (val <= score) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function initStarRatingPickers() {
    const pickers = document.querySelectorAll('.star-rating-select');
    pickers.forEach(picker => {
        const stars = picker.querySelectorAll('.star');
        const hiddenInput = picker.querySelector('input[type="hidden"]');
        const textLabel = picker.querySelector('.rating-text');

        const ratingLabels = {
            1: '1.0 / 5.0 (Poor)',
            2: '2.0 / 5.0 (Fair)',
            3: '3.0 / 5.0 (Good)',
            4: '4.0 / 5.0 (Very Good)',
            5: '5.0 / 5.0 (Exceptional)'
        };

        // Initialize with default 5
        updateStarPickerUI(picker, 5);

        stars.forEach(star => {
            const val = parseInt(star.dataset.value, 10);

            star.addEventListener('mouseenter', () => {
                stars.forEach(s => {
                    const sVal = parseInt(s.dataset.value, 10);
                    if (sVal <= val) {
                        s.classList.add('hovered');
                    } else {
                        s.classList.remove('hovered');
                    }
                });
            });

            star.addEventListener('mouseleave', () => {
                stars.forEach(s => s.classList.remove('hovered'));
            });

            star.addEventListener('click', () => {
                if (hiddenInput) hiddenInput.value = val;
                updateStarPickerUI(picker, val);
                if (textLabel) {
                    textLabel.textContent = ratingLabels[val] || `${val}.0 / 5.0`;
                }
            });
        });
    });
}

function initCityReviewsSystem() {
    const reviewSections = document.querySelectorAll('.city-reviews-section');
    reviewSections.forEach(section => {
        const cityKey = section.dataset.city;
        if (cityKey) {
            renderReviews(cityKey);
        }
    });
    initStarRatingPickers();
}

// ============================================================================
// 3. GALLERY PAGE IMAGE UPLOAD & FILTER SYSTEM (Image_gallery.html)
// ============================================================================
const GALLERY_UPLOAD_STORAGE_KEY = 'punjab_user_gallery_uploads';

function getUserUploadedImages() {
    const stored = localStorage.getItem(GALLERY_UPLOAD_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error(e);
        }
    }
    return [];
}

function saveUserUploadedImages(list) {
    localStorage.setItem(GALLERY_UPLOAD_STORAGE_KEY, JSON.stringify(list));
}

function initGalleryUpload() {
    const dropZone = document.getElementById('gallery-drop-zone');
    const fileInput = document.getElementById('gallery-file-input');
    const previewBox = document.getElementById('preview-box');
    const previewImg = document.getElementById('preview-img');
    const uploadBtn = document.getElementById('upload-submit-btn');
    const titleInput = document.getElementById('upload-title');
    const citySelect = document.getElementById('upload-city');
    const authorInput = document.getElementById('upload-author');

    if (!dropZone || !fileInput) return;

    let selectedBase64 = null;

    // Trigger file dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, WebP, etc.).');
            return;
        }

        // 5MB limit check
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB. Please choose a smaller image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            selectedBase64 = e.target.result;
            if (previewImg && previewBox) {
                previewImg.src = selectedBase64;
                previewBox.style.display = 'block';
            }
            if (!titleInput.value) {
                // Suggest title from file name
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                titleInput.value = nameWithoutExt;
            }
        };
        reader.readAsDataURL(file);
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!selectedBase64) {
                alert('Please select or drag an image first!');
                return;
            }

            const title = (titleInput.value.trim() || 'Punjab Photo');
            const city = citySelect ? citySelect.value : 'Punjab';
            const author = (authorInput && authorInput.value.trim()) || 'Visitor';

            const newImage = {
                id: 'upload-' + Date.now(),
                src: selectedBase64,
                title: title,
                city: city,
                author: author,
                date: new Date().toLocaleDateString()
            };

            const list = getUserUploadedImages();
            list.unshift(newImage);
            try {
                saveUserUploadedImages(list);
            } catch (err) {
                alert('Storage quota exceeded. Please delete previous uploads or choose a smaller image.');
                return;
            }

            // Reset upload UI
            selectedBase64 = null;
            if (previewBox) previewBox.style.display = 'none';
            if (fileInput) fileInput.value = '';
            titleInput.value = '';
            if (authorInput) authorInput.value = '';

            renderUserUploadedGalleryItems();
            alert(`Photo "${title}" uploaded successfully to the gallery!`);
        });
    }

    renderUserUploadedGalleryItems();
    initGalleryFilters();
}

function renderUserUploadedGalleryItems() {
    const galleryGrid = document.querySelector('.image_gallery');
    if (!galleryGrid) return;

    // Remove previously rendered user-upload items to avoid duplication
    const existingUserItems = galleryGrid.querySelectorAll('.user-uploaded-card');
    existingUserItems.forEach(el => el.remove());

    const uploads = getUserUploadedImages();
    if (uploads.length === 0) return;

    // Prepend uploads at the top of the gallery grid
    uploads.slice().reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-page-item user-uploaded-card';
        card.style.position = 'relative';
        card.dataset.category = 'user';
        card.innerHTML = `
            <span class="user-badge">User Upload</span>
            <img src="${item.src}" alt="${escapeHtml(item.title)}" style="cursor:zoom-in;">
            <p><b>${escapeHtml(item.title)}</b><br><small style="color:#777;">${escapeHtml(item.city)} • by ${escapeHtml(item.author)}</small></p>
            <button class="delete-img-btn" title="Delete this upload" onclick="deleteUserUpload('${item.id}', event)">✕ Delete</button>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-img-btn')) return;
            openLightbox(item.src, item.title, `Uploaded Photo (${item.city})`, `Contributed by ${item.author} on ${item.date}`);
        });

        galleryGrid.insertBefore(card, galleryGrid.firstChild);
    });
}

function deleteUserUpload(id, event) {
    if (event) event.stopPropagation();
    if (!confirm('Are you sure you want to remove this uploaded photo?')) return;

    let list = getUserUploadedImages();
    list = list.filter(item => item.id !== id);
    saveUserUploadedImages(list);
    renderUserUploadedGalleryItems();
}

function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            const galleryItems = document.querySelectorAll('.image_gallery > div');
            galleryItems.forEach(item => {
                const isUserUpload = item.classList.contains('user-uploaded-card');
                if (filter === 'all') {
                    item.style.display = '';
                } else if (filter === 'user') {
                    item.style.display = isUserUpload ? '' : 'none';
                } else if (filter === 'official') {
                    item.style.display = isUserUpload ? 'none' : '';
                }
            });
        });
    });

    // Make regular gallery items clickable for lightbox
    const galleryItems = document.querySelectorAll('.image_gallery > div:not(.user-uploaded-card)');
    galleryItems.forEach(item => {
        item.style.cursor = 'zoom-in';
        item.addEventListener('click', (e) => {
            // Check if inner link wasn't clicked
            if (e.target.tagName.toLowerCase() === 'a') return;
            const img = item.querySelector('img');
            const p = item.querySelector('p');
            if (img) {
                const title = p ? p.textContent.trim() : 'Punjab Landmark';
                openLightbox(img.src, title, 'Gallery Collection', 'Landmark of Punjab');
            }
        });
    });
}

// ============================================================================
// 4. LOGIN & REGISTRATION POLISH
// ============================================================================
function initLoginPage() {
    const wrapper = document.querySelector('.wrapper');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const btnPopup = document.querySelector('.btnLogin-popup');
    const iconClose = document.querySelector('.icon-close');

    if (!wrapper) return;

    // In dedicated Loginpage.html, make the card active by default!
    if (window.location.pathname.toLowerCase().includes('loginpage')) {
        wrapper.classList.add('active-popup');
    }

    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            wrapper.classList.add('active');
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            wrapper.classList.remove('active');
        });
    }

    if (btnPopup) {
        btnPopup.addEventListener('click', () => {
            wrapper.classList.add('active-popup');
        });
    }

    if (iconClose) {
        iconClose.addEventListener('click', () => {
            wrapper.classList.remove('active-popup');
        });
    }

    // Tab switcher if present
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');
    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            wrapper.classList.remove('active');
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
        });
        tabRegister.addEventListener('click', () => {
            wrapper.classList.add('active');
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
        });
    }

    // Password visibility toggle
    const toggleBtns = document.querySelectorAll('.toggle-password-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '👁️';
                    btn.title = 'Hide password';
                } else {
                    input.type = 'password';
                    btn.textContent = '🔒';
                    btn.title = 'Show password';
                }
            }
        });
    });

    // Simulated login handler with feedback
    const loginForm = document.querySelector('.form-box.login form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            if (btn) btn.textContent = 'Signing in...';

            setTimeout(() => {
                alert(`Welcome back to Punjab Travel Guide! Logged in as ${email}`);
                window.location.href = 'index.html';
            }, 500);
        });
    }

    // Simulated registration handler
    const registerForm = document.querySelector('.form-box.register form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = registerForm.querySelector('input[type="text"]').value;
            const btn = registerForm.querySelector('button[type="submit"]');
            if (btn) btn.textContent = 'Creating account...';

            setTimeout(() => {
                alert(`Account created successfully! Welcome to Punjab Travel Guide, ${username}.`);
                window.location.href = 'index.html';
            }, 500);
        });
    }
}

// Utility: HTML escaping
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================================================
// GLOBAL DOM READY INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initMiniGalleryLightbox();
    initCityReviewsSystem();
    initGalleryUpload();
    initLoginPage();
});
