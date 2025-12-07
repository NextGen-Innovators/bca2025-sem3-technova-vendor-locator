// Simple data storage with Nepali district addresses
let currentStock = [
    {id: 1, name: "Laptop", sku: "ELEC-001", category: "electronics", quantity: 50, transportAmount: 850, supplier: "ABC Suppliers", date: "2023-10-15", status: "in-stock", departureAddress: "", arrivalAddress: ""},
    {id: 2, name: "T-Shirt", sku: "CLOTH-001", category: "clothing", quantity: 100, transportAmount: 150, supplier: "XYZ Textiles", date: "2023-10-20", status: "departed", departureAddress: "Kathmandu", arrivalAddress: "Pokhara"},
    {id: 3, name: "Rice", sku: "FOOD-001", category: "food", quantity: 200, transportAmount: 350, supplier: "Food Corp", date: "2023-11-05", status: "arrived", departureAddress: "Biratnagar", arrivalAddress: "Kathmandu"},
    {id: 4, name: "Printer", sku: "ELEC-002", category: "electronics", quantity: 25, transportAmount: 2500, supplier: "Tech World", date: "2023-11-10", status: "in-stock", departureAddress: "", arrivalAddress: ""},
    {id: 5, name: "Notebook", sku: "OFF-001", category: "office", quantity: 150, transportAmount: 25, supplier: "Office Supplies", date: "2023-11-12", status: "departed", departureAddress: "Bhaktapur", arrivalAddress: "Chitwan"}
];

let oldStock = [
    {id: 101, name: "CRT Monitor", sku: "OLD-001", category: "electronics", quantity: 5, transportAmount: 500, supplier: "Old Tech", date: "2022-08-15", archived: "2023-01-15", status: "delivered", departureAddress: "Kathmandu", arrivalAddress: "Pokhara"},
    {id: 102, name: "VHS Tapes", sku: "OLD-002", category: "electronics", quantity: 12, transportAmount: 50, supplier: "Retro Media", date: "2022-05-10", archived: "2023-02-20", status: "delivered", departureAddress: "Pokhara", arrivalAddress: "Kathmandu"}
];

let nextId = 6;
let nextOldId = 103;

// List of Nepali districts
const nepaliDistricts = [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan", "Biratnagar", "Bharatpur", 
    "Butwal", "Dharan", "Nepalgunj", "Birendranagar", "Hetauda", "Janakpur", "Itahari", 
    "Tulsipur", "Dhankuta", "Baglung", "Dhangadhi", "Mahendranagar", "Other"
];

// Format Nepali currency (Rs)
function formatNepaliCurrency(amount) {
    return "Rs " + amount.toLocaleString('en-IN');
}

// Get status display text
function getStatusText(status) {
    const statusMap = {
        'in-stock': 'In Stock',
        'departed': 'Departed',
        'arrived': 'Arrived',
        'delivered': 'Delivered'
    };
    return statusMap[status] || status;
}

// Get status badge class
function getStatusBadgeClass(status) {
    const badgeMap = {
        'in-stock': 'status-in-stock',
        'departed': 'status-departed',
        'arrived': 'status-arrived',
        'delivered': 'status-delivered'
    };
    return badgeMap[status] || 'status-in-stock';
}

// DOM elements
const editModal = document.getElementById('edit-modal');
const closeModalBtn = document.querySelector('.close-modal');
const editForm = document.getElementById('edit-form');
const archiveItemBtn = document.getElementById('archive-item-btn');
let currentEditingId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default in the form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Set last login time
    updateLastLogin();
    
    // Setup navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Setup form
    document.getElementById('stock-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addStockItem();
    });
    
    // Setup report buttons
    document.getElementById('generate-report').addEventListener('click', generateReport);
    document.getElementById('print-report').addEventListener('click', printReport);
    
    // Auto-generate SKU
    document.getElementById('name').addEventListener('blur', function() {
        if (!document.getElementById('sku').value && this.value) {
            const name = this.value.substring(0, 3).toUpperCase();
            const num = Math.floor(100 + Math.random() * 900);
            document.getElementById('sku').value = name + '-' + num;
        }
    });
    
    // Setup modal events
    closeModalBtn.addEventListener('click', () => editModal.style.display = 'none');
    archiveItemBtn.addEventListener('click', archiveCurrentItem);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Setup edit form
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateStockItem();
    });
    
    // Populate district select options
    populateDistrictSelects();
    
    // Initial render
    updateDashboard();
    renderCurrentStock();
    renderOldStock();
});

// Populate district select options
function populateDistrictSelects() {
    const departureSelect = document.getElementById('departure-address');
    const arrivalSelect = document.getElementById('arrival-address');
    const editDepartureSelect = document.getElementById('edit-departure-address');
    const editArrivalSelect = document.getElementById('edit-arrival-address');
    
    // Clear existing options except first one
    [departureSelect, arrivalSelect, editDepartureSelect, editArrivalSelect].forEach(select => {
        // Keep the first option (placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add district options
        nepaliDistricts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            select.appendChild(option);
        });
    });
}

// Update last login time
function updateLastLogin() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const lastLogin = now.toLocaleDateString('en-US', options);
    document.getElementById('last-login-time').textContent = lastLogin;
    
    // Save to localStorage for persistence
    localStorage.setItem('lastLogin', now.toISOString());
}

// Add new stock item
function addStockItem() {
    const name = document.getElementById('name').value;
    const sku = document.getElementById('sku').value;
    const category = document.getElementById('category').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const transportAmount = parseFloat(document.getElementById('transport-amount').value);
    const supplier = document.getElementById('supplier').value;
    const date = document.getElementById('date').value;
    const departureAddress = document.getElementById('departure-address').value;
    const arrivalAddress = document.getElementById('arrival-address').value;
    
    // Determine initial status based on addresses
    let status = 'in-stock';
    if (departureAddress && !arrivalAddress) {
        status = 'departed';
    } else if (departureAddress && arrivalAddress) {
        status = 'arrived';
    }
    
    const newItem = {
        id: nextId++,
        name: name,
        sku: sku,
        category: category,
        quantity: quantity,
        transportAmount: transportAmount,
        supplier: supplier,
        date: date,
        status: status,
        departureAddress: departureAddress,
        arrivalAddress: arrivalAddress
    };
    
    currentStock.push(newItem);
    
    // Show success message
    const msg = document.getElementById('form-message');
    msg.textContent = `"${name}" added to stock successfully on ${date}!`;
    msg.className = 'message success';
    msg.style.display = 'block';
    
    // Reset form but keep today's date
    document.getElementById('stock-form').reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Update displays
    updateDashboard();
    renderCurrentStock();
    
    // Hide message after 3 seconds
    setTimeout(() => {
        msg.style.display = 'none';
    }, 3000);
}

// Render current stock table
function renderCurrentStock() {
    const tbody = document.getElementById('current-stock-body');
    tbody.innerHTML = '';
    
    currentStock.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.sku}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${formatNepaliCurrency(item.transportAmount)}</td>
            <td class="address-info">
                ${item.departureAddress ? ` ${item.departureAddress}` : '-'}
            </td>
            <td class="address-info">
                ${item.arrivalAddress ? `${item.arrivalAddress}` : '-'}
            </td>
            <td>
                <span class="status-badge ${getStatusBadgeClass(item.status)}">
                    ${getStatusText(item.status)}
                </span>
            </td>
            <td>
                <div class="actions">
                    </button>
                    <button class="btn btn-success btn-small" onclick="markAsDelivered(${item.id})">
                        <i class="fas fa-truck"></i> Delivered
                    </button>
                    <button class="btn btn-warning btn-small" onclick="editItem(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteItem(${item.id})">Delete</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Render old stock table
function renderOldStock() {
    const tbody = document.getElementById('old-stock-body');
    tbody.innerHTML = '';
    
    oldStock.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.sku}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${formatNepaliCurrency(item.transportAmount)}</td>
            <td class="address-info">
                ${item.departureAddress ? `<i class="fas fa-map-marker-alt"></i> ${item.departureAddress}` : '-'}
            </td>
            <td class="address-info">
                ${item.arrivalAddress ? `<i class="fas fa-map-marker-alt"></i> ${item.arrivalAddress}` : '-'}
            </td>
            <td class="date">${item.date}</td>
            <td class="date">${item.archived}</td>
            <td>
                <span class="status-badge ${getStatusBadgeClass(item.status)}">
                    ${getStatusText(item.status)}
                </span>
            </td>
            <td>
                <div class="actions">
                    </button>
                    <button class="btn btn-success btn-small" onclick="markAsDeliveredOld(${item.id})">
                        <i class="fas fa-truck"></i> Delivered
                    </button>
                    <button class="btn btn-primary btn-small" onclick="restoreItem(${item.id})">Restore</button>
                    <button class="btn btn-danger btn-small" onclick="deleteOldItem(${item.id})">Delete</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Mark item as departed (current stock)
function markAsDeparted(id) {
    const districts = [...nepaliDistricts];
    const departureDistrict = prompt("Enter departure district (or select from list):\n\n" + districts.join(", "), "Kathmandu");
    
    if (!departureDistrict) return;
    
    const index = currentStock.findIndex(item => item.id === id);
    if (index !== -1) {
        currentStock[index].status = 'departed';
        currentStock[index].departureAddress = departureDistrict;
        
        updateDashboard();
        renderCurrentStock();
        
        alert(`Item marked as departed from ${departureDistrict}.`);
    }
}

// Mark item as arrived (current stock)
function markAsArrived(id) {
    const districts = [...nepaliDistricts];
    const arrivalDistrict = prompt("Enter arrival district (or select from list):\n\n" + districts.join(", "), "Pokhara");
    
    if (!arrivalDistrict) return;
    
    const index = currentStock.findIndex(item => item.id === id);
    if (index !== -1) {
        currentStock[index].status = 'arrived';
        currentStock[index].arrivalAddress = arrivalDistrict;
        
        // Ensure departure address is set if not already
        if (!currentStock[index].departureAddress) {
            const departureDistrict = prompt("Enter departure district for this item (or select from list):\n\n" + districts.join(", "), "Kathmandu");
            if (departureDistrict) {
                currentStock[index].departureAddress = departureDistrict;
            }
        }
        
        updateDashboard();
        renderCurrentStock();
        
        alert(`Item marked as arrived at ${arrivalDistrict}.`);
    }
}

// Mark item as departed (old stock)
function markAsDepartedOld(id) {
    const districts = [...nepaliDistricts];
    const departureDistrict = prompt("Enter departure district (or select from list):\n\n" + districts.join(", "), "Kathmandu");
    
    if (!departureDistrict) return;
    
    const index = oldStock.findIndex(item => item.id === id);
    if (index !== -1) {
        oldStock[index].status = 'departed';
        oldStock[index].departureAddress = departureDistrict;
        
        renderOldStock();
        
        alert(`Item marked as departed from ${departureDistrict}.`);
    }
}

// Mark item as arrived (old stock)
function markAsArrivedOld(id) {
    const districts = [...nepaliDistricts];
    const arrivalDistrict = prompt("Enter arrival district (or select from list):\n\n" + districts.join(", "), "Pokhara");
    
    if (!arrivalDistrict) return;
    
    const index = oldStock.findIndex(item => item.id === id);
    if (index !== -1) {
        oldStock[index].status = 'arrived';
        oldStock[index].arrivalAddress = arrivalDistrict;
        
        // Ensure departure address is set if not already
        if (!oldStock[index].departureAddress) {
            const departureDistrict = prompt("Enter departure district for this item (or select from list):\n\n" + districts.join(", "), "Kathmandu");
            if (departureDistrict) {
                oldStock[index].departureAddress = departureDistrict;
            }
        }
        
        renderOldStock();
        
        alert(`Item marked as arrived at ${arrivalDistrict}.`);
    }
}

// Edit item
function editItem(id) {
    const item = currentStock.find(item => item.id === id);
    if (!item) return;
    
    currentEditingId = id;
    
    // Fill edit form with item data
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-sku').value = item.sku;
    document.getElementById('edit-category').value = item.category;
    document.getElementById('edit-quantity').value = item.quantity;
    document.getElementById('edit-transport-amount').value = item.transportAmount;
    document.getElementById('edit-supplier').value = item.supplier;
    document.getElementById('edit-date').value = item.date;
    document.getElementById('edit-departure-address').value = item.departureAddress || '';
    document.getElementById('edit-arrival-address').value = item.arrivalAddress || '';
    
    // Show modal
    editModal.style.display = 'flex';
}

// Update stock item
function updateStockItem() {
    const id = parseInt(document.getElementById('edit-id').value);
    const name = document.getElementById('edit-name').value;
    const sku = document.getElementById('edit-sku').value;
    const category = document.getElementById('edit-category').value;
    const quantity = parseInt(document.getElementById('edit-quantity').value);
    const transportAmount = parseFloat(document.getElementById('edit-transport-amount').value);
    const supplier = document.getElementById('edit-supplier').value;
    const date = document.getElementById('edit-date').value;
    const departureAddress = document.getElementById('edit-departure-address').value;
    const arrivalAddress = document.getElementById('edit-arrival-address').value;
    
    // Determine status based on addresses
    let status = 'in-stock';
    if (departureAddress && !arrivalAddress) {
        status = 'departed';
    } else if (departureAddress && arrivalAddress) {
        status = 'arrived';
    }
    
    const index = currentStock.findIndex(item => item.id === id);
    if (index !== -1) {
        currentStock[index] = {
            id: id,
            name: name,
            sku: sku,
            category: category,
            quantity: quantity,
            transportAmount: transportAmount,
            supplier: supplier,
            date: date,
            status: status,
            departureAddress: departureAddress,
            arrivalAddress: arrivalAddress
        };
        
        updateDashboard();
        renderCurrentStock();
        editModal.style.display = 'none';
        
        alert(`"${name}" updated successfully!`);
    }
}

// Archive current editing item
function archiveCurrentItem() {
    if (!currentEditingId) return;
    
    if (!confirm("Archive this item to old stock?")) return;
    
    const index = currentStock.findIndex(item => item.id === currentEditingId);
    if (index !== -1) {
        const item = currentStock[index];
        item.archived = new Date().toISOString().split('T')[0];
        oldStock.push(item);
        currentStock.splice(index, 1);
        
        updateDashboard();
        renderCurrentStock();
        renderOldStock();
        editModal.style.display = 'none';
        
        alert("Item archived to old stock.");
    }
}

// Mark item as delivered (current stock)
function markAsDelivered(id) {
    if (!confirm("Mark this item as delivered? It will be removed from stock.")) return;
    
    const index = currentStock.findIndex(item => item.id === id);
    if (index !== -1) {
        const row = document.querySelector(`#current-stock-body tr:nth-child(${index + 1})`);
        
        // Add fade effect
        row.classList.add('fade-out');
        
        // Remove from array after animation
        setTimeout(() => {
            currentStock.splice(index, 1);
            updateDashboard();
            renderCurrentStock();
            alert("Item marked as delivered and removed from stock.");
        }, 500);
    }
}

// Mark item as delivered (old stock)
function markAsDeliveredOld(id) {
    if (!confirm("Mark this item as delivered? It will be removed from old stock.")) return;
    
    const index = oldStock.findIndex(item => item.id === id);
    if (index !== -1) {
        const row = document.querySelector(`#old-stock-body tr:nth-child(${index + 1})`);
        
        // Add fade effect
        row.classList.add('fade-out');
        
        // Remove from array after animation
        setTimeout(() => {
            oldStock.splice(index, 1);
            renderOldStock();
            alert("Item marked as delivered and removed from old stock.");
        }, 500);
    }
}

// Update dashboard stats
function updateDashboard() {
    const totalItems = currentStock.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate unique categories
    const uniqueCategories = [...new Set(currentStock.map(item => item.category))].length;
    
    // Calculate items in transit (departed but not arrived)
    const itemsInTransit = currentStock.filter(item => item.status === 'departed').length;
    
    // Calculate recent items (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentItems = currentStock.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= sevenDaysAgo;
    }).length;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-categories').textContent = uniqueCategories;
    document.getElementById('total-transit').textContent = itemsInTransit;
    document.getElementById('recent-items').textContent = recentItems;
}

// Restore item from old to current stock
function restoreItem(id) {
    if (!confirm("Restore this item to current stock?")) return;
    
    const index = oldStock.findIndex(item => item.id === id);
    if (index !== -1) {
        const item = oldStock[index];
        delete item.archived; // Remove archived date
        currentStock.push(item);
        oldStock.splice(index, 1);
        
        updateDashboard();
        renderCurrentStock();
        renderOldStock();
        
        alert("Item restored to current stock.");
    }
}

// Delete item from current stock
function deleteItem(id) {
    if (!confirm("Permanently delete this item?")) return;
    
    const index = currentStock.findIndex(item => item.id === id);
    if (index !== -1) {
        currentStock.splice(index, 1);
        
        updateDashboard();
        renderCurrentStock();
        
        alert("Item deleted.");
    }
}

// Delete item from old stock
function deleteOldItem(id) {
    if (!confirm("Permanently delete this old stock item?")) return;
    
    const index = oldStock.findIndex(item => item.id === id);
    if (index !== -1) {
        oldStock.splice(index, 1);
        renderOldStock();
        
        alert("Old stock item deleted.");
    }
}

// Generate report
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    
    let reportData = [];
    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = '';
    
    // Update chart placeholder
    document.querySelector('.chart-placeholder').innerHTML = `
        <i class="fas fa-chart-${reportType === 'category' ? 'pie' : 'line'}"></i>
        <p>${getReportTitle(reportType, month, year)}</p>
    `;
    
    if (reportType === 'monthly') {
        // Monthly summary report
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        months.forEach((monthName, index) => {
            const monthNum = index + 1;
            // Filter items for this month
            const monthItems = currentStock.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() + 1 === monthNum && 
                       itemDate.getFullYear() == year;
            });
            
            const itemCount = monthItems.length;
            const totalQty = monthItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalTransport = monthItems.reduce((sum, item) => sum + (item.quantity * item.transportAmount), 0);
            const avgTransport = itemCount > 0 ? totalTransport / totalQty : 0;
            
            if (month === 'all' || month == monthNum) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${monthName} ${year}</td>
                    <td>${itemCount}</td>
                    <td>${totalQty}</td>
                    <td>${formatNepaliCurrency(totalTransport)}</td>
                    <td>${formatNepaliCurrency(avgTransport)}</td>
                `;
                tbody.appendChild(row);
            }
        });
    } 
    else if (reportType === 'category') {
        // Category report
        const categories = [...new Set(currentStock.map(item => item.category))];
        
        categories.forEach(category => {
            const categoryItems = currentStock.filter(item => item.category === category);
            const itemCount = categoryItems.length;
            const totalQty = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalTransport = categoryItems.reduce((sum, item) => sum + (item.quantity * item.transportAmount), 0);
            const avgTransport = itemCount > 0 ? totalTransport / totalQty : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                <td>${itemCount}</td>
                <td>${totalQty}</td>
                <td>${formatNepaliCurrency(totalTransport)}</td>
                <td>${formatNepaliCurrency(avgTransport)}</td>
            `;
            tbody.appendChild(row);
        });
    }
    else if (reportType === 'supplier') {
        // Supplier report
        const suppliers = [...new Set(currentStock.map(item => item.supplier))];
        
        suppliers.forEach(supplier => {
            const supplierItems = currentStock.filter(item => item.supplier === supplier);
            const itemCount = supplierItems.length;
            const totalQty = supplierItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalTransport = supplierItems.reduce((sum, item) => sum + (item.quantity * item.transportAmount), 0);
            const avgTransport = itemCount > 0 ? totalTransport / totalQty : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier}</td>
                <td>${itemCount}</td>
                <td>${totalQty}</td>
                <td>${formatNepaliCurrency(totalTransport)}</td>
                <td>${formatNepaliCurrency(avgTransport)}</td>
            `;
            tbody.appendChild(row);
        });
    }
    else if (reportType === 'status') {
        // Status report
        const statuses = ['in-stock', 'departed', 'arrived'];
        
        statuses.forEach(status => {
            const statusItems = currentStock.filter(item => item.status === status);
            const itemCount = statusItems.length;
            const totalQty = statusItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalTransport = statusItems.reduce((sum, item) => sum + (item.quantity * item.transportAmount), 0);
            const avgTransport = itemCount > 0 ? totalTransport / totalQty : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${getStatusText(status)}</td>
                <td>${itemCount}</td>
                <td>${totalQty}</td>
                <td>${formatNepaliCurrency(totalTransport)}</td>
                <td>${formatNepaliCurrency(avgTransport)}</td>
            `;
            tbody.appendChild(row);
        });
    }
    else if (reportType === 'district') {
        // District report (by departure district)
        const districts = [...new Set(currentStock.map(item => item.departureAddress).filter(Boolean))];
        
        districts.forEach(district => {
            const districtItems = currentStock.filter(item => item.departureAddress === district);
            const itemCount = districtItems.length;
            const totalQty = districtItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalTransport = districtItems.reduce((sum, item) => sum + (item.quantity * item.transportAmount), 0);
            const avgTransport = itemCount > 0 ? totalTransport / totalQty : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${district} (Departure)</td>
                <td>${itemCount}</td>
                <td>${totalQty}</td>
                <td>${formatNepaliCurrency(totalTransport)}</td>
                <td>${formatNepaliCurrency(avgTransport)}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    const totalQty = currentStock.reduce((sum, item) => sum + item.quantity, 0);
    const totalTransport = currentStock.reduce((sum, item) => sum + (item.quantity * item.transportAmount), 0);
    
    totalRow.innerHTML = `
        <td>TOTAL</td>
        <td>${currentStock.length}</td>
        <td>${totalQty}</td>
        <td>${formatNepaliCurrency(totalTransport)}</td>
        <td>${formatNepaliCurrency(totalTransport / totalQty)}</td>
    `;
    tbody.appendChild(totalRow);
    
    // Show success message
    alert(`Report generated successfully! ${getReportTitle(reportType, month, year)}`);
}

// Get report title
function getReportTitle(reportType, month, year) {
    const titles = {
        'monthly': 'Monthly Summary Report',
        'category': 'Category Analysis Report',
        'supplier': 'Supplier Analysis Report',
        'status': 'Status Analysis Report',
        'district': 'District Analysis Report'
    };
    
    let title = titles[reportType] || 'Stock Report';
    if (month !== 'all') {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
        title += ` - ${months[parseInt(month)-1]} ${year}`;
    } else {
        title += ` - Year ${year}`;
    }
    
    return title;
}

// Print report
function printReport() {
    const reportType = document.getElementById('report-type').value;
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Stock Report - Carriers Sewa Nepal</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2c3e50; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #2c3e50; color: white; }
                .total-row { font-weight: bold; background-color: #f2f2f2; }
                .date { font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <h1>${getReportTitle(reportType, month, year)}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Last Login: ${document.getElementById('last-login-time').textContent}</p>
            ${document.getElementById('report-table').outerHTML}
            <p style="margin-top: 30px; font-size: 12px; text-align: center;">
                Carriers Sewa Nepal Vision - Stock Management System
            </p>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}