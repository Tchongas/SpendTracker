// main.js

// We'll simulate loading files from a folder
// In a real application, you might use fetch to load JSON files from a server
const fileNames = [
    'receipt1.json',
    'receipt2.json',
    'receipt3.json',
    'receipt4.json',
    'receipt5.json',
    'receipt6.json',
    'receipt7.json',
    'receipt8.json',
    'receipt9.json',

    // Add more filenames as needed
  ];
  
  // Store all receipts data
  let allReceipts = [];
  
  // Function to load a JSON file
  async function loadJsonFile(fileName) {
    try {
      const response = await fetch(`./data/${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${fileName}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error);
      return null;
    }
  }
  
  // Function to load all receipt files
  async function loadAllReceipts() {
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';
    
    try {
      const promises = fileNames.map(fileName => loadJsonFile(fileName));
      const results = await Promise.all(promises);
      allReceipts = results.filter(result => result !== null);
      
      displayReceipts(allReceipts);
    } catch (error) {
      console.error('Error loading receipts:', error);
      document.getElementById('error-message').textContent = 'Erro';
      document.getElementById('error-message').style.display = 'block';
    } finally {
      loadingIndicator.style.display = 'none';
    }
  }
  
  // Function to format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
  
  // Function to create a receipt card
  function createReceiptCard(receipt, index) {
    const card = document.createElement('div');
    card.className = 'receipt-card';
    card.innerHTML = `
      <h3>Receipt #${index + 1}</h3>
      <div class="receipt-total">Total: ${formatCurrency(receipt.total_spent)}</div>
      <button class="toggle-details" data-receipt-id="${index}">Mais detalhes</button>
      <div class="receipt-details" id="receipt-details-${index}" style="display: none;">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Item</th>
              <th>Quantidade</th>
              <th>Preco unidade</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${formatCurrency(item.total_price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    return card;
  }
  
  // Function to display all receipts
  function displayReceipts(receipts) {
    const container = document.getElementById('receipts-container');
    container.innerHTML = '';
    
    if (receipts.length === 0) {
      container.innerHTML = '<p>Nenhum recibo</p>';
      return;
    }
    
    // Create summary section
    const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.total_spent, 0);
    const summarySection = document.createElement('div');
    summarySection.className = 'summary-section';
    summarySection.innerHTML = `
      <h2>Resumo</h2>
      <p>Total de recibos: ${receipts.length}</p>
      <p>Total gasto: ${formatCurrency(totalSpent)}</p>
    `;
    container.appendChild(summarySection);
    
    // Create receipts section
    const receiptsSection = document.createElement('div');
    receiptsSection.className = 'receipts-section';
    
    receipts.forEach((receipt, index) => {
      const card = createReceiptCard(receipt, index);
      receiptsSection.appendChild(card);
    });
    
    container.appendChild(receiptsSection);
    
    // Add event listeners to toggle buttons
    document.querySelectorAll('.toggle-details').forEach(button => {
      button.addEventListener('click', function() {
        const receiptId = this.getAttribute('data-receipt-id');
        const detailsElement = document.getElementById(`receipt-details-${receiptId}`);
        
        if (detailsElement.style.display === 'none') {
          detailsElement.style.display = 'block';
          this.textContent = 'Esconder detalhes';
        } else {
          detailsElement.style.display = 'none';
          this.textContent = 'Mostrar detalhes';
        }
      });
    });
  }
  
  // Function to sort receipts by total amount
  function sortReceiptsByTotal() {
    allReceipts.sort((a, b) => b.total_spent - a.total_spent);
    displayReceipts(allReceipts);
  }
  
  // Function to filter receipts by category
// Function to filter and show total spent on a specific category
function filterReceiptsByCategory(category) {
    const container = document.getElementById('receipts-container');
    container.innerHTML = '';
    
    if (category === 'all') {
      displayReceipts(allReceipts);
      return;
    }
    
    // Calculate total spent on this category
    let totalSpentInCategory = 0;
    let categoryItems = [];
    
    allReceipts.forEach(receipt => {
      receipt.items.forEach(item => {
        if (item.category.toLowerCase() === category.toLowerCase()) {
          totalSpentInCategory += item.total_price;
          // Create a copy of the item with receipt info
          categoryItems.push({
            ...item,
            receiptIndex: allReceipts.indexOf(receipt)
          });
        }
      });
    });
    
    // Create summary section for the category
    const summarySection = document.createElement('div');
    summarySection.className = 'summary-section';
    summarySection.innerHTML = `
      <h2>${category} Summary</h2>
      <p>Total Items: ${categoryItems.length}</p>
      <p>Total Spent on ${category}: ${formatCurrency(totalSpentInCategory)}</p>
      <button id="back-button">Back to All Receipts</button>
    `;
    container.appendChild(summarySection);
    
    // Add event listener to back button
    summarySection.querySelector('#back-button').addEventListener('click', () => {
      displayReceipts(allReceipts);
    });
    
    // Create items section
    const itemsSection = document.createElement('div');
    itemsSection.className = 'category-items-section';
    itemsSection.innerHTML = `
      <h3>${category} Items</h3>
      <table>
        <thead>
          <tr>
            <th>Receipt #</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${categoryItems.map(item => `
            <tr>
              <td>${item.receiptIndex + 1}</td>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>${formatCurrency(item.total_price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.appendChild(itemsSection);
  }
  
  // Initialize the application
  document.addEventListener('DOMContentLoaded', () => {
    loadAllReceipts();
    
    // Set up sort button
    document.getElementById('sort-button').addEventListener('click', sortReceiptsByTotal);
    
    // Set up category filter
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.addEventListener('change', function() {
      filterReceiptsByCategory(this.value);
    });
  });