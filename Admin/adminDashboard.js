document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase client
    const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // DOM Elements
    const addPromoBtn = document.getElementById('add-promo-btn');
    const newPromotion = document.getElementById('new-promotion');
    const newPromotionDescription = document.getElementById('new-promotion-description');
    const newPromotionPrice = document.getElementById('new-promotion-price');
    const newPromotionStartDate = document.getElementById('new-promotion-start-date');
    const newPromotionEndDate = document.getElementById('new-promotion-end-date');
    const newPromotionActive = document.getElementById('new-promotion-active');
    const modal = document.getElementById('edit-modal');
    const saveBtn = document.getElementById('save-changes-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Function to test Supabase connection
    async function testSupabaseConnection() {
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('id');

            if (error) {
                console.error('Error testing Supabase connection:', error);
                return false;
            }

            console.log('Supabase connection successful:', data);
            return true;
        } catch (error) {
            console.error('Error testing Supabase connection:', error);
            return false;
        }
    }

    // Fetch promotions from the database
    async function fetchPromotions() {
        try {
            const { data: promotions, error } = await supabase
                .from('promotions')
                .select('*');

            if (error) {
                console.error('Error fetching promotions:', error);
                throw error;
            }

            if (!promotions || promotions.length === 0) {
                console.log('No promotions found in the database.');
                return;
            }

            renderPromotions(promotions);
        } catch (error) {
            console.error('Error in fetchPromotions:', error);
        }
    }

    // Render promotions in the promotion list
    function renderPromotions(promotions) {
        const promoList = document.getElementById('promotion-list');
        if (!promoList) {
            console.error('Element with ID "promotion-list" not found.');
            return;
        }

        promoList.innerHTML = promotions.map(promo => `
            <div class="promotion-item">
                <h4>${promo.name}</h4>
                <p>${promo.description}</p>
                <p>Price: $${promo.price.toFixed(2)}</p>
                <p>Start Date: ${promo.start_date}</p>
                <p>End Date: ${promo.end_date}</p>
                <p>Status: ${promo.is_active ? 'Active' : 'Inactive'}</p>
                <button onclick="editPromotion(${promo.id})">Edit</button>
                <button class="btn btn-danger" onclick="deletePromotion(${promo.id})">Delete</button>
            </div>
        `).join('');
    }

    // Add a new promotion to the database
    async function addPromotion() {
        const newPromo = {
            name: newPromotion.value,
            description: newPromotionDescription.value,
            price: parseFloat(newPromotionPrice.value),
            start_date: newPromotionStartDate.value,
            end_date: newPromotionEndDate.value,
            is_active: newPromotionActive.checked
        };

        if (newPromo.name && newPromo.price) {
            try {
                const { error } = await supabase
                    .from('promotions')
                    .insert([newPromo]);

                if (error) {
                    console.error('Error adding promotion:', error);
                    throw error;
                }

                newPromotion.value = '';
                newPromotionDescription.value = '';
                newPromotionPrice.value = '';
                newPromotionStartDate.value = '';
                newPromotionEndDate.value = '';
                newPromotionActive.checked = true;
                fetchPromotions();
            } catch (error) {
                console.error('Error in addPromotion:', error);
            }
        }
    }

    // Edit an existing promotion in the database
    async function editPromotion(promotionId) {
        try {
            const { data: [promo], error } = await supabase
                .from('promotions')
                .select('*')
                .eq('id', promotionId)
                .single();

            if (error) {
                console.error('Error fetching promotion:', error);
                throw error;
            }

            document.getElementById('modal-title').textContent = 'Edit Promotion';
            document.getElementById('modal-content').innerHTML = `
                <input type="text" id="edit-promo-name" value="${promo.name}">
                <textarea id="edit-promo-description">${promo.description}</textarea>
                <input type="number" id="edit-promo-price" value="${promo.price}" step="0.01">
                <input type="date" id="edit-promo-start-date" value="${promo.start_date}">
                <input type="date" id="edit-promo-end-date" value="${promo.end_date}">
                <input type="checkbox" id="edit-promo-active" ${promo.is_active ? 'checked' : ''}>
            `;
            modal.style.display = 'block';
            saveBtn.onclick = async () => {
                try {
                    const updatedPromo = {
                        id: promo.id,
                        name: document.getElementById('edit-promo-name').value,
                        description: document.getElementById('edit-promo-description').value,
                        price: parseFloat(document.getElementById('edit-promo-price').value),
                        start_date: document.getElementById('edit-promo-start-date').value,
                        end_date: document.getElementById('edit-promo-end-date').value,
                        is_active: document.getElementById('edit-promo-active').checked
                    };

                    const { error } = await supabase
                        .from('promotions')
                        .update(updatedPromo)
                        .eq('id', updatedPromo.id);

                    if (error) {
                        console.error('Error updating promotion:', error);
                        throw error;
                    }

                    modal.style.display = 'none';
                    fetchPromotions();
                } catch (error) {
                    console.error('Error in editPromotion save:', error);
                }
            };
        } catch (error) {
            console.error('Error in editPromotion:', error);
        }
    }

    // Delete a promotion from the database
    async function deletePromotion(promotionId) {
        try {
            const { error } = await supabase
                .from('promotions')
                .delete()
                .eq('id', promotionId);

            if (error) {
                console.error('Error deleting promotion:', error);
                throw error;
            }

            fetchPromotions();
        } catch (error) {
            console.error('Error in deletePromotion:', error);
        }
    }

    // Event Listeners
    addPromoBtn.addEventListener('click', addPromotion);
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Test Supabase connection and initialize application
    testSupabaseConnection().then(connectionSuccess => {
        if (connectionSuccess) {
            fetchPromotions();
        } else {
            console.error('Failed to connect to Supabase. Please check your Supabase URL and API key.');
        }
    });
});