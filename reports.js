
// Initialize Supabase (Use keys found in previous analysis)
const SUPABASE_URL = 'https://fcuxncgafmtfmagtzouh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdXhuY2dhZm10Zm1hZ3R6b3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTY4ODAsImV4cCI6MjA2OTYzMjg4MH0.nviYxi7M-6ENGTiPwItrnEiUltAoJINB4mAF_nnFACE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { jsPDF } = window.jspdf;

// --- Data Fetching ---

async function fetchCategories() {
    const { data, error } = await supabase
        .from('fets_expenses_data')
        .select('category')
        .not('category', 'is', null);
    
    if (error) {
        console.error('Error fetching categories', error);
        return;
    }

    // Unique categories
    const categories = [...new Set(data.map(item => item.category))].sort();
    const select = document.getElementById('expenseCategory');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

async function fetchSettleUpCycles() {
    const { data: cycles, error } = await supabase
        .from('settleup_cycles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching cycles', error);
        return;
    }

    const tbody = document.getElementById('settleupCyclesTable');
    tbody.innerHTML = '';

    if (!cycles || cycles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No settlement cycles found</td></tr>';
        return;
    }

    cycles.forEach(cycle => {
        const tr = document.createElement('tr');
        const startDate = cycle.start_date ? new Date(cycle.start_date).toLocaleDateString() : 'N/A';
        const endDate = cycle.end_date ? new Date(cycle.end_date).toLocaleDateString() : 'Active';
        const status = cycle.is_settled ? 
            '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Settled</span>' : 
            '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Active</span>';

        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${startDate} - ${endDate}</td>
            <td class="px-6 py-4 whitespace-nowrap">${status}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${cycle.mithun_total || 0}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${cycle.niyas_total || 0}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="generateSettleUpReport('${cycle.id}')" class="text-indigo-600 hover:text-indigo-900 font-bold hover:underline">
                    Download PDF
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Report Generation ---

async function generatePDF(title, columns, data, filename) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // Blue
    doc.text("FETS PayBook", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text(title, 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

    // Table
    doc.autoTable({
        head: [columns],
        body: data,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(filename);
    showToast();
}

// --- Expense Reports ---

window.generateMonthReport = async () => {
    const monthInput = document.getElementById('expenseMonth').value;
    if (!monthInput) {
        alert('Please select a month');
        return;
    }

    const [year, month] = monthInput.split('-');
    // Assuming 'date' column format YYYY-MM-DD
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

    const { data, error } = await supabase
        .from('fets_expenses_data')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

    if (error) {
        alert('Error fetching data');
        console.error(error);
        return;
    }

    const rows = data.map(item => [
        item.date,
        item.category || '-',
        item.name || '-',
        item.location || '-',
        `₹${item.amount}`
    ]);

    generatePDF(
        `Expenses Report - ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
        ['Date', 'Category', 'Description', 'Location', 'Amount'],
        rows,
        `expenses_${year}_${month}.pdf`
    );
};

window.generateCategoryReport = async () => {
    const category = document.getElementById('expenseCategory').value;
    
    let query = supabase.from('fets_expenses_data').select('*');
    let title = 'All Expenses by Category';

    if (category) {
        query = query.eq('category', category);
        title = `Expenses Report - ${category}`;
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
        alert('Error fetching data');
        console.error(error);
        return;
    }

    const rows = data.map(item => [
        item.date,
        item.category || '-',
        item.name || '-',
        item.location || '-',
        `₹${item.amount}`
    ]);

    generatePDF(
        title,
        ['Date', 'Category', 'Description', 'Location', 'Amount'],
        rows,
        `expenses_${category || 'all'}.pdf`
    );
};

window.generateFullExpenseReport = async () => {
    const { data, error } = await supabase
        .from('fets_expenses_data')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        alert('Error fetching data');
        console.error(error);
        return;
    }

    const rows = data.map(item => [
        item.date,
        item.category || '-',
        item.name || '-',
        item.location || '-',
        `₹${item.amount}`
    ]);

    generatePDF(
        'Full Expenses History',
        ['Date', 'Category', 'Description', 'Location', 'Amount'],
        rows,
        'full_expenses_history.pdf'
    );
};

// --- SettleUp Report ---

window.generateSettleUpReport = async (cycleId) => {
    // Fetch cycle details
    const { data: cycle, error: cycleError } = await supabase
        .from('settleup_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();
    
    if (cycleError) {
        alert('Error fetching cycle details');
        return;
    }

    // Fetch contributions
    const { data: contributions, error: contribError } = await supabase
        .from('settleup_contributions')
        .select('*')
        .eq('cycle_id', cycleId)
        .order('date', { ascending: true });

    if (contribError) {
        alert('Error fetching contributions');
        return;
    }

    const rows = contributions.map(item => [
        item.date,
        item.contributor,
        item.description || '-',
        `₹${item.amount}`
    ]);

    // Add totals row
    rows.push(['', '', 'Mithun Total:', `₹${cycle.mithun_total}`]);
    rows.push(['', '', 'Niyas Total:', `₹${cycle.niyas_total}`]);
    rows.push(['', '', 'Status:', cycle.is_settled ? `Settled on ${cycle.settled_date}` : 'Active']);

    const title = `Settlement Report (${new Date(cycle.start_date).toLocaleDateString()} - ${cycle.end_date ? new Date(cycle.end_date).toLocaleDateString() : 'Present'})`;

    generatePDF(
        title,
        ['Date', 'Contributor', 'Description', 'Amount'],
        rows,
        `settlement_${cycleId}.pdf`
    );
};

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchSettleUpCycles();
});

// Expose functions to window (modules have their own scope)
// Already attached to window above
