// weekly-report.js
// Reusable functions for generating weekly analytics reports

async function readCSV(filepath) {
  const response = await fetch(filepath);
  const text = await response.text();
  
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

async function loadTemplate(templatePath, csvPath, customHTML = '') {
  try {
    // Fetch and inject template
    const response = await fetch(templatePath);
    const templateHTML = await response.text();
    document.getElementById('report-container').innerHTML = templateHTML;
    
    // Calculate and render metrics
    const metrics = await calculateMetrics(csvPath);
    renderReport(metrics);
    
    // Add custom content
    if (customHTML) {
      document.getElementById('custom-content').innerHTML = customHTML;
    }
  } catch (error) {
    console.error('Error loading report:', error);
    document.getElementById('report-container').innerHTML = `<h1>Error loading report</h1><p>${error.message}</p>`;
  }
}

function formatCurrency(value) {
  return `$${parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatPercentage(value) {
  return `${(parseFloat(value) * 100).toFixed(2)}%`;
}

function formatNumber(value) {
  return parseInt(parseFloat(value)).toLocaleString('en-US');
}

function calculateChange(current, previous) {
  current = parseFloat(current);
  previous = parseFloat(previous);
  
  if (previous === 0) return 0;
  
  return ((current - previous) / previous) * 100;
}

function getChangeClass(change, inverse = false) {
  if (inverse) {
    return change > 0 ? "negative" : "positive";
  }
  return change > 0 ? "positive" : "negative";
}

function formatChange(change) {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% WoW`;
}

function aggregateMetric(data, column, method = 'sum') {
  const values = data.map(row => parseFloat(row[column]));
  
  if (method === 'sum') {
    return values.reduce((a, b) => a + b, 0);
  } else if (method === 'average') {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  
  return 0;
}

async function calculateMetrics(csvPath) {
  const data = await readCSV(csvPath);
  
  if (!data || data.length === 0) {
    throw new Error("No data in CSV");
  }
  
  // Aggregate metrics
  const totalSales = aggregateMetric(data, 'Total sales', 'sum');
  const totalSalesPrev = aggregateMetric(data, 'Total sales (previous_week)', 'sum');
  
  const cvr = aggregateMetric(data, 'Conversion rate', 'average');
  const cvrPrev = aggregateMetric(data, 'Conversion rate (previous_week)', 'average');
  
  const aov = aggregateMetric(data, 'Average order value', 'average');
  const aovPrev = aggregateMetric(data, 'Average order value (previous_week)', 'average');
  
  const sessions = aggregateMetric(data, 'Sessions', 'sum');
  const sessionsPrev = aggregateMetric(data, 'Sessions (previous_week)', 'sum');
  
  const returningRate = aggregateMetric(data, 'Returning customer rate', 'average');
  const returningRatePrev = aggregateMetric(data, 'Returning customer rate (previous_week)', 'average');
  
  const bounceRate = aggregateMetric(data, 'Bounce rate', 'average');
  const bounceRatePrev = aggregateMetric(data, 'Bounce rate (previous_week)', 'average');
  
  const cartRate = aggregateMetric(data, 'Added to cart rate', 'average');
  const cartRatePrev = aggregateMetric(data, 'Added to cart rate (previous_week)', 'average');
  
  const checkoutRate = aggregateMetric(data, 'Reached checkout rate', 'average');
  const checkoutRatePrev = aggregateMetric(data, 'Reached checkout rate (previous_week)', 'average');
  
  const completeRate = aggregateMetric(data, 'Completed checkout rate', 'average');
  const completeRatePrev = aggregateMetric(data, 'Completed checkout rate (previous_week)', 'average');
  
  const orders = aggregateMetric(data, 'Orders', 'sum');
  const ordersPrev = aggregateMetric(data, 'Orders (previous_week)', 'sum');
  
  // Calculate changes
  const salesChange = calculateChange(totalSales, totalSalesPrev);
  const cvrChange = calculateChange(cvr, cvrPrev);
  const aovChange = calculateChange(aov, aovPrev);
  const sessionsChange = calculateChange(sessions, sessionsPrev);
  const returningChange = calculateChange(returningRate, returningRatePrev);
  const bounceChange = calculateChange(bounceRate, bounceRatePrev);
  const cartChange = calculateChange(cartRate, cartRatePrev);
  const checkoutChange = calculateChange(checkoutRate, checkoutRatePrev);
  const completeChange = calculateChange(completeRate, completeRatePrev);
  const ordersChange = calculateChange(orders, ordersPrev);
  
  // Get date range
  const firstDate = data[0]['Day'];
  const lastDate = data[data.length - 1]['Day'];
  const dateRange = `${firstDate} to ${lastDate}`;
  
  return {
    dateRange: dateRange,
    totalSales: formatCurrency(totalSales),
    totalSalesChange: formatChange(salesChange),
    totalSalesClass: getChangeClass(salesChange),
    
    cvr: formatPercentage(cvr),
    cvrChange: formatChange(cvrChange),
    cvrClass: getChangeClass(cvrChange),
    
    aov: formatCurrency(aov),
    aovChange: formatChange(aovChange),
    aovClass: getChangeClass(aovChange),
    
    sessions: formatNumber(sessions),
    sessionsChange: formatChange(sessionsChange),
    sessionsClass: getChangeClass(sessionsChange),
    
    returningRate: formatPercentage(returningRate),
    returningRateChange: formatChange(returningChange),
    returningRateClass: getChangeClass(returningChange),
    
    bounceRate: formatPercentage(bounceRate),
    bounceRatePrev: formatPercentage(bounceRatePrev),
    bounceRateChange: formatChange(bounceChange),
    bounceRateClass: getChangeClass(bounceChange, true),
    
    cartRate: formatPercentage(cartRate),
    cartRatePrev: formatPercentage(cartRatePrev),
    cartRateChange: formatChange(cartChange),
    cartRateClass: getChangeClass(cartChange),
    
    checkoutRate: formatPercentage(checkoutRate),
    checkoutRatePrev: formatPercentage(checkoutRatePrev),
    checkoutRateChange: formatChange(checkoutChange),
    checkoutRateClass: getChangeClass(checkoutChange),
    
    completeRate: formatPercentage(completeRate),
    completeRatePrev: formatPercentage(completeRatePrev),
    completeRateChange: formatChange(completeChange),
    completeRateClass: getChangeClass(completeChange),
    
    orders: formatNumber(orders),
    ordersPrev: formatNumber(ordersPrev),
    ordersChange: formatChange(ordersChange),
    ordersClass: getChangeClass(ordersChange),
  };
}

function renderReport(metrics) {
  // Update date range
  document.querySelector('.subtitle').textContent = `${metrics.dateRange} | Lotus & Luna E-Commerce`;
  
  // Summary metrics table
  const summaryRows = document.querySelectorAll('#summary-table tbody tr');
  summaryRows[0].children[1].textContent = metrics.totalSales;
  summaryRows[0].children[2].textContent = metrics.totalSalesChange;
  summaryRows[0].children[2].className = metrics.totalSalesClass;
  
  summaryRows[1].children[1].textContent = metrics.cvr;
  summaryRows[1].children[2].textContent = metrics.cvrChange;
  summaryRows[1].children[2].className = metrics.cvrClass;
  
  summaryRows[2].children[1].textContent = metrics.aov;
  summaryRows[2].children[2].textContent = metrics.aovChange;
  summaryRows[2].children[2].className = metrics.aovClass;
  
  summaryRows[3].children[1].textContent = metrics.sessions;
  summaryRows[3].children[2].textContent = metrics.sessionsChange;
  summaryRows[3].children[2].className = metrics.sessionsClass;
  
  summaryRows[4].children[1].textContent = metrics.returningRate;
  summaryRows[4].children[2].textContent = metrics.returningRateChange;
  summaryRows[4].children[2].className = metrics.returningRateClass;
  
  // Funnel table
  const funnelRows = document.querySelectorAll('#funnel-table tbody tr');
  funnelRows[0].children[1].textContent = metrics.bounceRate;
  funnelRows[0].children[2].textContent = metrics.bounceRatePrev;
  funnelRows[0].children[3].textContent = metrics.bounceRateChange;
  funnelRows[0].children[3].className = metrics.bounceRateClass;
  
  funnelRows[1].children[1].textContent = metrics.cartRate;
  funnelRows[1].children[2].textContent = metrics.cartRatePrev;
  funnelRows[1].children[3].textContent = metrics.cartRateChange;
  funnelRows[1].children[3].className = metrics.cartRateClass;
  
  funnelRows[2].children[1].textContent = metrics.checkoutRate;
  funnelRows[2].children[2].textContent = metrics.checkoutRatePrev;
  funnelRows[2].children[3].textContent = metrics.checkoutRateChange;
  funnelRows[2].children[3].className = metrics.checkoutRateClass;
  
  funnelRows[3].children[1].textContent = metrics.completeRate;
  funnelRows[3].children[2].textContent = metrics.completeRatePrev;
  funnelRows[3].children[3].textContent = metrics.completeRateChange;
  funnelRows[3].children[3].className = metrics.completeRateClass;
  
  funnelRows[4].children[1].textContent = metrics.cvr;
  funnelRows[4].children[2].textContent = metrics.cvr;
  funnelRows[4].children[3].textContent = metrics.cvrChange;
  funnelRows[4].children[3].className = metrics.cvrClass;
  
  funnelRows[5].children[1].textContent = metrics.orders;
  funnelRows[5].children[2].textContent = metrics.ordersPrev;
  funnelRows[5].children[3].textContent = metrics.ordersChange;
  funnelRows[5].children[3].className = metrics.ordersClass;
}

