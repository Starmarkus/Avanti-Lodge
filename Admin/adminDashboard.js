// adminDashboard.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// Supabase credentials
const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const addPromotionBtn = document.getElementById('add-promotion-btn');
const promotionName = document.getElementById('promotion-name');
const promotionDescription = document.getElementById('promotion-description');
const promotionDiscount = document.getElementById('promotion-discount');
const promotionStartDate = document.getElementById('promotion-start-date');
const promotionEndDate = document.getElementById('promotion-end-date');
const promotionList = document.getElementById('promotion-list');
const errorMessage = document.getElementById('error-message');

// Show error message
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}

// Fetch promotions
async function fetchPromotions() {
    try {
        const { data: promotions, error } = await supabaseClient
            .from('PromotionTable')
            .select('*');

        if (error) {
            console.error('Error fetching promotions:', error);
            showError('Failed to fetch promotions.');
            throw error;
        }

        if (!promotions || promotions.length === 0) {
            promotionList.innerHTML = '<p>No promotions found.</p>';
            return;
        }

        renderPromotions(promotions);
    } catch (error) {
        console.error('Error in fetchPromotions:', error);
        showError('An error occurred while fetching promotions.');
    }
}

// Render promotions
function renderPromotions(promotions) {
    promotionList.innerHTML = `
        <table class="room-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Discount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${promotions.map(promotion => `
                    <tr>
                        <td>${promotion.PromoName || 'Unnamed'}</td>
                        <td>${promotion.PromoDescription || 'No description'}</td>
                        <td>${promotion.PromoPrice}%</td>
                        <td>${promotion.PromoStartDate}</td>
                        <td>${promotion.PromoEndDate}</td>
                        <td>
                            <button class="btn" onclick="editPromotion('${promotion.PromoID}')">Edit</button>
                            <button class="btn btn-danger" onclick="deletePromotion('${promotion.PromoID}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Add a promotion
async function addPromotion() {
    const newPromotion = {
        PromoName: promotionName.value,
        PromoDescription: promotionDescription.value,
        PromoPrice: parseInt(promotionDiscount.value),
        PromoStartDate: promotionStartDate.value,
        PromoEndDate: promotionEndDate.value,
        created_at: new Date().toISOString()
    };

    if (newPromotion.PromoName && !isNaN(newPromotion.PromoPrice) && newPromotion.PromoStartDate && newPromotion.PromoEndDate) {
        try {
            const { error } = await supabaseClient
                .from('PromotionTable')
                .insert([newPromotion]);

            if (error) {
                console.error('Error adding promotion:', error);
                showError('Failed to add promotion.');
                throw error;
            }

            promotionName.value = '';
            promotionDescription.value = '';
            promotionDiscount.value = '';
            promotionStartDate.value = '';
            promotionEndDate.value = '';
            fetchPromotions();
        } catch (error) {
            console.error('Error in addPromotion:', error);
            showError('An error occurred while adding the promotion.');
        }
    } else {
        showError('Promotion name, discount, start date, and end date are required.');
    }
}

// Edit a promotion
async function editPromotion(promotionId) {
    try {
        const { data: promotion, error } = await supabaseClient
            .from('PromotionTable')
            .select('*')
            .eq('PromoID', promotionId)
            .single();

        if (error) {
            console.error('Error fetching promotion:', error);
            showError('Failed to fetch promotion details.');
            throw error;
        }

        if (!promotion) {
            console.error('No promotion found with ID:', promotionId);
            showError('Promotion not found.');
            return;
        }

        const modal = document.getElementById('edit-modal');
        document.getElementById('modal-title').textContent = 'Edit Promotion';
        document.getElementById('modal-content').innerHTML = `
            <div class="form-group">
                <label>Promotion Name:</label>
                <input type="text" id="edit-promotion-name" value="${promotion.PromoName || ''}">
            </div>
            <div class="form-group">
                <label>Description:</label>
                <textarea id="edit-promotion-description">${promotion.PromoDescription || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Discount (%):</label>
                <input type="number" id="edit-promotion-discount" value="${promotion.PromoPrice || 0}" min="0" max="100">
            </div>
            <div class="form-group">
                <label>Start Date:</label>
                <input type="date" id="edit-promotion-start-date" value="${promotion.PromoStartDate || ''}">
            </div>
            <div class="form-group">
                <label>End Date:</label>
                <input type="date" id="edit-promotion-end-date" value="${promotion.PromoEndDate || ''}">
            </div>
        `;

        modal.style.display = 'block';

        document.getElementById('save-changes-btn').onclick = null;
        document.getElementById('save-changes-btn').addEventListener('click', async () => {
            try {
                const updatedPromotion = {
                    PromoName: document.getElementById('edit-promotion-name').value || promotion.PromoName,
                    PromoDescription: document.getElementById('edit-promotion-description').value || null,
                    PromoPrice: parseInt(document.getElementById('edit-promotion-discount').value) || promotion.PromoPrice,
                    PromoStartDate: document.getElementById('edit-promotion-start-date').value || promotion.PromoStartDate,
                    PromoEndDate: document.getElementById('edit-promotion-end-date').value || promotion.PromoEndDate
                };

                if (!updatedPromotion.PromoName || isNaN(updatedPromotion.PromoPrice) || !updatedPromotion.PromoStartDate || !updatedPromotion.PromoEndDate) {
                    showError('Promotion name, discount, start date, and end date are required.');
                    return;
                }

                const { error: updateError } = await supabaseClient
                    .from('PromotionTable')
                    .update(updatedPromotion)
                    .eq('PromoID', promotionId);

                if (updateError) {
                    console.error('Error updating promotion:', updateError);
                    showError('Failed to update promotion.');
                    throw updateError;
                }

                modal.style.display = 'none';
                fetchPromotions();
            } catch (error) {
                console.error('Error in editPromotion:', error);
                showError('An error occurred while updating the promotion.');
            }
        });
    } catch (error) {
        console.error('Error in editPromotion:', error);
        showError('An error occurred while fetching the promotion.');
    }
}

// Delete a promotion
async function deletePromotion(promotionId) {
    try {
        const { error } = await supabaseClient
            .from('PromotionTable')
            .delete()
            .eq('PromoID', promotionId);

        if (error) {
            console.error('Error deleting promotion:', error);
            showError('Failed to delete promotion.');
            throw error;
        }

        fetchPromotions();
    } catch (error) {
        console.error('Error in deletePromotion:', error);
        showError('An error occurred while deleting the promotion.');
    }
}

// Expose functions globally
window.editPromotion = editPromotion;
window.deletePromotion = deletePromotion;

// Event Listeners
if (addPromotionBtn) {
    addPromotionBtn.addEventListener('click', addPromotion);
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchPromotions);