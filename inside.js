 // Sample stock data
        const stockData = [
            { id: 1, name: "Laptop", category: "electronics", quantity: 50, reorderLevel: 10, supplier: "ABC Suppliers", price: 850, lastUpdated: "2023-05-15" },
            { id: 2, name: "T-Shirt", category: "clothing", quantity: 100, reorderLevel: 20, supplier: "XYZ Textiles", price: 15, lastUpdated: "2023-05-10" },
            { id: 3, name: "Rice", category: "food", quantity: 200, reorderLevel: 50, supplier: "Food Corp", price: 25, lastUpdated: "2023-05-12" },
            { id: 4, name: "Office Chair", category: "furniture", quantity: 15, reorderLevel: 5, supplier: "Furniture Co", price: 120, lastUpdated: "2023-05-05" },
            { id: 5, name: "Printer", category: "electronics", quantity: 8, reorderLevel: 3, supplier: "Tech Distributors", price: 220, lastUpdated: "2023-05-08" },
            { id: 6, name: "Notebooks", category: "office", quantity: 300, reorderLevel: 100, supplier: "Office Supply Co", price: 3, lastUpdated: "2023-05-01" },
            { id: 7, name: "Coffee", category: "food", quantity: 12, reorderLevel: 10, supplier: "Food Corp", price: 18, lastUpdated: "2023-05-14" },
            { id: 8, name: "Desk", category: "furniture", quantity: 5, reorderLevel: 2, supplier: "Furniture Co", price: 350, lastUpdated: "2023-04-28" }
        ];

        // DOM elements
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('nav a');
        const totalItemsEl = document.getElementById('total-items');
        const lowStockEl = document.getElementById('low-stock');
        const totalCategoriesEl = document.getElementById('total-categories');
        const totalSuppliersEl = document.getElementById('total-suppliers');
        const stockTableBody = document.getElementById('stock-table-body');
        const reportTableBody = document.getElementById('report-table-body');
        const addStockForm = document.getElementById('add-stock-form');
        const searchStockInput = document.getElementById('search-stock');
        const filterCategorySelect = document.getElementById('filter-category');
        const filterStatusSelect = document.getElementById('filter-status');
        const editModal = document.getElementById('edit-modal');
        const closeModalBtn = document.querySelector('.close-modal');
        const editStockForm = document.getElementById('edit-stock-form');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        // Initialize the application
        function init() {
            updateStats();
            renderStockTable();
            renderReportTable();
            setupNavigation();
            setupEventListeners();
            setupTabs();
        }

        // Update dashboard statistics
        function updateStats() {
            // Calculate total items
            const totalItems = stockData.reduce((sum, item) => sum + item.quantity, 0);
            totalItemsEl.textContent = totalItems.toLocaleString();
            
            // Calculate low stock items (quantity <= reorderLevel)
            const lowStockItems = stockData.filter(item => item.quantity <= item.reorderLevel).length;
            lowStockEl.textContent = lowStockItems;
            
            // Calculate unique categories
            const uniqueCategories = [...new Set(stockData.map(item => item.category))];
            totalCategoriesEl.textContent = uniqueCategories.length;
            
            // Calculate unique suppliers
            const uniqueSuppliers = [...new Set(stockData.map(item => item.supplier))];
            totalSuppliersEl.textContent = uniqueSuppliers.length;
        }

        // Render stock table
        function renderStockTable(filteredData = stockData) {
            stockTableBody.innerHTML = '';
            
            if (filteredData.length === 0) {
                stockTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">
                            <i class="fas fa-box-open" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
                            <p>No stock items found. Add some items to get started.</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            filteredData.forEach(item => {
                const status = getStockStatus(item.quantity, item.reorderLevel);
                const statusClass = `status-${status.replace(' ', '-')}`;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${item.name}</strong></td>
                    <td>${capitalizeFirstLetter(item.category)}</td>
                    <td>${item.quantity} pcs</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>${item.supplier}</td>
                    <td>${formatDate(item.lastUpdated)}</td>
                    <td class="action-buttons">
                        <button class="btn btn-warning edit-btn" data-id="${item.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger delete-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                stockTableBody.appendChild(row);
            });
        }

        // Render report table
        function renderReportTable() {
            reportTableBody.innerHTML = '';
            
            stockData.forEach(item => {
                const status = getStockStatus(item.quantity, item.reorderLevel);
                const value = item.quantity * item.price;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${capitalizeFirstLetter(item.category)}</td>
                    <td>${item.quantity} pcs</td>
                    <td>${item.quantity <= item.reorderLevel ? 'Yes' : 'No'}</td>
                    <td>$${value.toLocaleString()}</td>
                `;
                reportTableBody.appendChild(row);
            });
        }

        // Get stock status based on quantity
        function getStockStatus(quantity, reorderLevel) {
            if (quantity === 0) return 'out of stock';
            if (quantity <= reorderLevel) return 'low stock';
            return 'in stock';
        }

        // Format date for display
        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        }

        // Capitalize first letter of a string
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // Setup navigation
        function setupNavigation() {
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get target section ID
                    const targetId = this.getAttribute('href').substring(1);
                    
                    // Update active nav link
                    navLinks.forEach(link => link.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show target section, hide others
                    sections.forEach(section => {
                        if (section.id === targetId) {
                            section.style.display = 'block';
                        } else {
                            section.style.display = 'none';
                        }
                    });
                    
                    // If viewing stock table, refresh it
                    if (targetId === 'view-stock') {
                        renderStockTable();
                    }
                });
            });
            
            // Show dashboard by default
            document.querySelector('nav a[href="#dashboard"]').click();
        }

        // Setup event listeners
        function setupEventListeners() {
            // Add stock form submission
            addStockForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Generate a unique ID
                const newId = stockData.length > 0 ? Math.max(...stockData.map(item => item.id)) + 1 : 1;
                
                // Get form values
                const formData = new FormData(this);
                const itemName = formData.get('item-name');
                const category = formData.get('category');
                const quantity = parseInt(formData.get('quantity'));
                const supplier = formData.get('supplier');
                const reorderLevel = parseInt(formData.get('reorder-level')) || 10;
                const price = parseFloat(formData.get('price')) || 0;
                
                // Create new stock item
                const newItem = {
                    id: newId,
                    name: itemName,
                    category: category,
                    quantity: quantity,
                    reorderLevel: reorderLevel,
                    supplier: supplier,
                    price: price,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
                
                // Add to stock data
                stockData.push(newItem);
                
                // Update UI
                updateStats();
                renderStockTable();
                
                // Show success message
                showAlert('Stock item added successfully!', 'success');
                
                // Reset form
                this.reset();
            });
            
            // Search and filter functionality
            searchStockInput.addEventListener('input', filterStockTable);
            filterCategorySelect.addEventListener('change', filterStockTable);
            filterStatusSelect.addEventListener('change', filterStockTable);
            
            // Edit and delete buttons (using event delegation)
            stockTableBody.addEventListener('click', function(e) {
                const target = e.target;
                const button = target.closest('button');
                
                if (!button) return;
                
                const itemId = parseInt(button.getAttribute('data-id'));
                
                if (button.classList.contains('edit-btn')) {
                    openEditModal(itemId);
                } else if (button.classList.contains('delete-btn')) {
                    deleteStockItem(itemId);
                }
            });
            
            // Close modal
            closeModalBtn.addEventListener('click', () => {
                editModal.style.display = 'none';
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    editModal.style.display = 'none';
                }
            });
            
            // Edit form submission
            editStockForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const itemId = parseInt(formData.get('item-id'));
                
                // Find and update the item
                const itemIndex = stockData.findIndex(item => item.id === itemId);
                if (itemIndex !== -1) {
                    stockData[itemIndex].name = formData.get('item-name');
                    stockData[itemIndex].category = formData.get('category');
                    stockData[itemIndex].quantity = parseInt(formData.get('quantity'));
                    stockData[itemIndex].reorderLevel = parseInt(formData.get('reorder-level'));
                    stockData[itemIndex].supplier = formData.get('supplier');
                    stockData[itemIndex].price = parseFloat(formData.get('price')) || 0;
                    stockData[itemIndex].lastUpdated = new Date().toISOString().split('T')[0];
                    
                    // Update UI
                    updateStats();
                    renderStockTable();
                    
                    // Close modal
                    editModal.style.display = 'none';
                    
                    // Show success message
                    showAlert('Stock item updated successfully!', 'success');
                }
            });
        }

        // Setup tabs
        function setupTabs() {
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs and tab contents
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding content
                    tab.classList.add('active');
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
        }

        // Filter stock table based on search and filters
        function filterStockTable() {
            const searchTerm = searchStockInput.value.toLowerCase();
            const categoryFilter = filterCategorySelect.value;
            const statusFilter = filterStatusSelect.value;
            
            const filteredData = stockData.filter(item => {
                // Search filter
                const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                                    item.category.toLowerCase().includes(searchTerm) ||
                                    item.supplier.toLowerCase().includes(searchTerm);
                
                // Category filter
                const matchesCategory = !categoryFilter || item.category === categoryFilter;
                
                // Status filter
                let matchesStatus = true;
                if (statusFilter) {
                    const status = getStockStatus(item.quantity, item.reorderLevel);
                    if (statusFilter === 'in-stock' && status !== 'in stock') matchesStatus = false;
                    if (statusFilter === 'low' && status !== 'low stock') matchesStatus = false;
                    if (statusFilter === 'out' && status !== 'out of stock') matchesStatus = false;
                }
                
                return matchesSearch && matchesCategory && matchesStatus;
            });
            
            renderStockTable(filteredData);
        }

        // Open edit modal with item data
        function openEditModal(itemId) {
            const item = stockData.find(item => item.id === itemId);
            if (!item) return;
            
            // Populate edit form
            editStockForm.innerHTML = `
                <input type="hidden" name="item-id" value="${item.id}">
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="edit-item-name">Item Name</label>
                        <input type="text" id="edit-item-name" name="item-name" value="${item.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-category">Category</label>
                        <select id="edit-category" name="category" required>
                            <option value="electronics" ${item.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                            <option value="clothing" ${item.category === 'clothing' ? 'selected' : ''}>Clothing</option>
                            <option value="food" ${item.category === 'food' ? 'selected' : ''}>Food & Beverages</option>
                            <option value="furniture" ${item.category === 'furniture' ? 'selected' : ''}>Furniture</option>
                            <option value="office" ${item.category === 'office' ? 'selected' : ''}>Office Supplies</option>
                            <option value="other" ${item.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-quantity">Quantity</label>
                        <input type="number" id="edit-quantity" name="quantity" value="${item.quantity}" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-reorder-level">Reorder Level</label>
                        <input type="number" id="edit-reorder-level" name="reorder-level" value="${item.reorderLevel}" min="1" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-price">Price per Unit ($)</label>
                        <input type="number" id="edit-price" name="price" value="${item.price}" min="0" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-supplier">Supplier</label>
                        <select id="edit-supplier" name="supplier" required>
                            <option value="ABC Suppliers" ${item.supplier === 'ABC Suppliers' ? 'selected' : ''}>ABC Suppliers</option>
                            <option value="XYZ Textiles" ${item.supplier === 'XYZ Textiles' ? 'selected' : ''}>XYZ Textiles</option>
                            <option value="Food Corp" ${item.supplier === 'Food Corp' ? 'selected' : ''}>Food Corp</option>
                            <option value="Tech Distributors" ${item.supplier === 'Tech Distributors' ? 'selected' : ''}>Tech Distributors</option>
                            <option value="Furniture Co" ${item.supplier === 'Furniture Co' ? 'selected' : ''}>Furniture Co</option>
                            <option value="Office Supply Co" ${item.supplier === 'Office Supply Co' ? 'selected' : ''}>Office Supply Co</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button type="button" class="btn btn-outline close-modal">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            `;
            
            // Show modal
            editModal.style.display = 'flex';
            
            // Add event listener to cancel button
            editStockForm.querySelector('.close-modal').addEventListener('click', () => {
                editModal.style.display = 'none';
            });
        }

        // Delete stock item
        function deleteStockItem(itemId) {
            if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                return;
            }
            
            const itemIndex = stockData.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                stockData.splice(itemIndex, 1);
                
                // Update UI
                updateStats();
                renderStockTable();
                
                // Show success message
                showAlert('Stock item deleted successfully!', 'success');
            }
        }

        // Show alert message
        function showAlert(message, type = 'success') {
            // Remove any existing alerts
            const existingAlert = document.querySelector('.alert');
            if (existingAlert) existingAlert.remove();
            
            // Create alert element
            const alertEl = document.createElement('div');
            alertEl.className = `alert alert-${type}`;
            alertEl.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                <div>${message}</div>
                <button class="close-alert" style="margin-left: auto; background: none; border: none; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add to dashboard section
            const dashboardSection = document.getElementById('dashboard');
            dashboardSection.insertBefore(alertEl, dashboardSection.querySelector('h2').nextSibling);
            
            // Add event listener to close button
            alertEl.querySelector('.close-alert').addEventListener('click', () => {
                alertEl.remove();
            });
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (alertEl.parentNode) {
                    alertEl.remove();
                }
            }, 5000);
        }

        // Export functionality
        document.getElementById('export-btn').addEventListener('click', function() {
            // In a real application, this would generate a CSV or PDF file
            alert('Export functionality would generate a CSV/PDF file in a real application.');
        });

        // Initialize the application when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);

        // Simple chart simulation (in a real app, you would use a library like Chart.js)
        function renderCharts() {
            // This is a placeholder for chart rendering
            // In a real application, you would use Chart.js, D3.js, or similar
            const chartContainers = document.querySelectorAll('.chart-container');
            chartContainers.forEach(container => {
                container.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #95a5a6;">
                        <div style="text-align: center;">
                            <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <p>Interactive chart would appear here with a charting library</p>
                        </div>
                    </div>
                `;
            });
        }

        // Call chart rendering after a short delay to simulate loading
        setTimeout(renderCharts, 500);