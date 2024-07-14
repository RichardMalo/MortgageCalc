document.addEventListener("DOMContentLoaded", function() {
    function calculateMortgage(event) {
        event.preventDefault();
    
        const principal = parseFloat(document.getElementById("principal").value);
        const amortization = parseFloat(document.getElementById("amortization").value);
        const term = parseFloat(document.getElementById("term").value);
        const interestRate = parseFloat(document.getElementById("interestRate").value.replace('%', '')) / 100;
        const extraPayment = parseFloat(document.getElementById("extraPayment").value);
    
        if (isNaN(principal) || isNaN(amortization) || isNaN(term) || isNaN(interestRate) || isNaN(extraPayment)) {
            alert("Please enter valid numbers for all fields.");
            return;
        }
    
        const monthlyRate = interestRate / 12;
        const numPayments = amortization * 12;
        const termPayments = term * 12;
    
        const mortgagePayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        const totalMortgagePayment = mortgagePayment + extraPayment;
        const data = [];
    
        let remainingBalance = principal;
        let totalInterestPaidWithoutExtraTerm = 0;
        let totalInterestPaidWithExtraTerm = 0;
        let totalInterestPaidWithoutExtraTotal = 0;
        let totalInterestPaidWithExtraTotal = 0;
    
        for (let i = 1; i <= termPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment;
            remainingBalance -= principalPayment;
    
            totalInterestPaidWithoutExtraTerm += interestPayment;
    
            if (remainingBalance < 0) remainingBalance = 0;
            data.push({ x: i, y: [principalPayment, interestPayment] });
        }
    
        remainingBalance = principal;
        for (let i = 1; i <= termPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment + extraPayment;
            remainingBalance -= principalPayment;
    
            totalInterestPaidWithExtraTerm += interestPayment;
    
            if (remainingBalance <= 0) {
                remainingBalance = 0;
                break;
            }
        }
    
        remainingBalance = principal;
        for (let i = 1; i <= numPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment;
            remainingBalance -= principalPayment;
    
            totalInterestPaidWithoutExtraTotal += interestPayment;
    
            if (remainingBalance < 0) remainingBalance = 0;
        }
    
        remainingBalance = principal;
        for (let i = 1; i <= numPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment + extraPayment;
            remainingBalance -= principalPayment;
    
            totalInterestPaidWithExtraTotal += interestPayment;
    
            if (remainingBalance <= 0) {
                remainingBalance = 0;
                break;
            }
        }
    
        const extraSavedTerm = totalInterestPaidWithoutExtraTerm - totalInterestPaidWithExtraTerm;
        const extraSavedTotal = totalInterestPaidWithoutExtraTotal - totalInterestPaidWithExtraTotal;
    
        document.getElementById("extraSavedTerm").value = extraPayment > 0 ? extraSavedTerm.toFixed(2) : "0.00";
        document.getElementById("extraSavedTotal").value = extraPayment > 0 ? extraSavedTotal.toFixed(2) : "0.00";
    
        const trace1 = {
            x: data.map((d) => d.x),
            y: data.map((d) => d.y[0]),
            name: 'Principal',
            type: 'bar',
            text: data.map((d) => d.y[0].toFixed(2)),
            textposition: 'auto',
            marker: { color: '#0E6663' }
        };
    
        const trace2 = {
            x: data.map((d) => d.x),
            y: data.map((d) => d.y[1]),
            name: 'Interest',
            type: 'bar',
            text: data.map((d) => d.y[1].toFixed(2)),
            textposition: 'auto',
            marker: { color: '#C64359' }
        };
    
        const layout = {
            barmode: 'stack',
            title: 'Mortgage Payment Breakdown',
            xaxis: {
                title: 'Payment Year',
                tickmode: 'array',
                tickvals: Array.from({length: Math.ceil(termPayments/12) + 1}, (_, i) => i*12),
                ticktext: Array.from({length: Math.ceil(termPayments/12) + 1}, (_, i) => `Year ${i}`)
            },
            yaxis: {
                title: 'Payment Amount',
            },
            width: window.innerWidth * 0.97,
            height: 400,
        };
    
        const config = { responsive: true };
    
        Plotly.newPlot('chart', [trace1, trace2], layout, config);
    
        plotCumulativeChart(data);
        plotRemainingBalanceChartWithoutExtra(principal, monthlyRate, numPayments, mortgagePayment);
        plotRemainingBalanceChartWithExtra(principal, monthlyRate, numPayments, mortgagePayment, extraPayment);
        plotImpactOfExtraPayments(principal, monthlyRate, mortgagePayment, extraPayment, numPayments);
        plotEquityBuildUp(principal, monthlyRate, mortgagePayment, extraPayment, numPayments);
        
        const firstPaymentDate = document.getElementById("firstPaymentDate").value;
        createAmortizationTable(principal, monthlyRate, numPayments, mortgagePayment, extraPayment, firstPaymentDate);
    }
    
    function plotCumulativeChart(data) {
        const cumulativePayments = [];
        const remainingBalances = [];
        let totalPayment = 0;
        let remainingBalance = parseFloat(document.getElementById("principal").value);
        const extraPayment = parseFloat(document.getElementById("extraPayment").value);
        const monthlyRate = parseFloat(document.getElementById("interestRate").value) / 100 / 12;
        const numPayments = parseFloat(document.getElementById("amortization").value) * 12;
        const mortgagePayment = remainingBalance * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
        for (let i = 1; i <= data.length; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment;
            
            totalPayment += mortgagePayment + extraPayment;
            remainingBalance -= (principalPayment + extraPayment);
    
            if (remainingBalance <= 0) {
                remainingBalance = 0;
                cumulativePayments.push({ x: i, y: totalPayment });
                remainingBalances.push({ x: i, y: remainingBalance });
                break;
            }
    
            cumulativePayments.push({ x: i, y: totalPayment });
            remainingBalances.push({ x: i, y: remainingBalance });
        }
    
        const trace1 = {
            x: cumulativePayments.map((d) => d.x),
            y: cumulativePayments.map((d) => d.y.toFixed(2)),
            name: 'Cumulative Payments',
            type: 'bar',
            marker: { color: '#0E6663' }
        };
    
        const trace2 = {
            x: remainingBalances.map((d) => d.x),
            y: remainingBalances.map((d) => d.y.toFixed(2)),
            name: 'Remaining Balance',
            type: 'bar',
            marker: { color: '#C64359' }
        };
    
        const layout = {
            barmode: 'group',
            title: 'Cumulative Payments vs Remaining Balance',
            xaxis: {
                title: 'Payment Year',
                tickmode: 'array',
                tickvals: Array.from({length: Math.ceil(data.length/12) + 1}, (_, i) => i*12),
                ticktext: Array.from({length: Math.ceil(data.length/12) + 1}, (_, i) => `Year ${i}`)
            },
            yaxis: {
                title: 'Amounts',
            },
            width: window.innerWidth * 0.97,
            height: 400,
        };
    
        const config = { responsive: true };
    
        Plotly.newPlot('chart2', [trace1, trace2], layout, config);
    }
    
    function plotRemainingBalanceChartWithoutExtra(principal, monthlyRate, numPayments, mortgagePayment) {
        const remainingBalances = [];
        let remainingBalance = principal;
    
        for (let i = 1; i <= numPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment;
            remainingBalance -= principalPayment;
            
            if (remainingBalance <= 0) {
                remainingBalance = 0;
                remainingBalances.push({ x: i, y: remainingBalance });
                break;
            }
            
            remainingBalances.push({ x: i, y: remainingBalance });
        }
    
        const trace = {
            x: remainingBalances.map((d) => d.x),
            y: remainingBalances.map((d) => d.y.toFixed(2)),
            name: 'Remaining Balance Without Extra Payments',
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: '#17BECF' }
        };
    
        const layout = {
            title: 'Remaining Balance Over Time (Without Extra Payments)',
            xaxis: {
                title: 'Payment Year',
                tickmode: 'array',
                tickvals: Array.from({length: Math.ceil(numPayments/12) + 1}, (_, i) => i*12),
                ticktext: Array.from({length: Math.ceil(numPayments/12) + 1}, (_, i) => `Year ${i}`),
                range: [0, numPayments]
            },
            yaxis: {
                title: 'Remaining Balance',
            },
            width: window.innerWidth * 0.97,
            height: 400,
        };
    
        const config = { responsive: true };
    
        Plotly.newPlot('chart3', [trace], layout, config);
    }
    
    function plotRemainingBalanceChartWithExtra(principal, monthlyRate, numPayments, mortgagePayment, extraPayment) {
        const remainingBalances = [];
        let remainingBalance = principal;
    
        for (let i = 1; i <= numPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment + extraPayment;
            remainingBalance -= principalPayment;
            
            if (remainingBalance <= 0) {
                remainingBalance = 0;
                remainingBalances.push({ x: i, y: remainingBalance });
                break;
            }
            
            remainingBalances.push({ x: i, y: remainingBalance });
        }
    
        const trace = {
            x: remainingBalances.map((d) => d.x),
            y: remainingBalances.map((d) => d.y.toFixed(2)),
            name: 'Remaining Balance With Extra Payments',
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: '#FFA500' }
        };
    
        const layout = {
            title: 'Remaining Balance Over Time (With Extra Payments)',
            xaxis: {
                title: 'Payment Year',
                tickmode: 'array',
                tickvals: Array.from({length: Math.ceil(numPayments/12) + 1}, (_, i) => i*12),
                ticktext: Array.from({length: Math.ceil(numPayments/12) + 1}, (_, i) => `Year ${i}`),
                range: [0, numPayments]
            },
            yaxis: {
                title: 'Remaining Balance',
            },
            width: window.innerWidth * 0.97,
            height: 400,
        };
    
        const config = { responsive: true };
    
        Plotly.newPlot('chart4', [trace], layout, config);
    }
    
    function plotImpactOfExtraPayments(principal, monthlyRate, mortgagePayment, extraPayment, numPayments) {
        const remainingBalancesWithExtra = [];
        let remainingBalance = principal;
        let totalPayments = 0;
      
        for (let i = 1; i <= numPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment + extraPayment;
            remainingBalance -= principalPayment;
            totalPayments = i;
      
            if (remainingBalance <= 0) {
                remainingBalance = 0;
                remainingBalancesWithExtra.push({ x: i, y: remainingBalance });
                break;
            }
      
            remainingBalancesWithExtra.push({ x: i, y: remainingBalance });
        }
      
        const trace = {
            x: remainingBalancesWithExtra.map((d) => d.x),
            y: remainingBalancesWithExtra.map((d) => d.y.toFixed(2)),
            name: 'Remaining Balance with Extra Payments',
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: '#FFA500' }
        };
      
        const layout = {
            title: 'Impact of Extra Payments on Remaining Balance',
            xaxis: {
                title: 'Payment Year',
                tickmode: 'array',
                tickvals: Array.from({length: Math.ceil(numPayments/12) + 1}, (_, i) => i*12),
                ticktext: Array.from({length: Math.ceil(numPayments/12) + 1}, (_, i) => `Year ${i}`),
                range: [0, numPayments]
            },
            yaxis: {
                title: 'Remaining Balance',
                range: [0, principal]
            },
            width: window.innerWidth * 0.97,
            height: 400,
        };
      
        const config = { responsive: true };
      
        Plotly.newPlot('chart4', [trace], layout, config);
    }
    
    function plotEquityBuildUp(principal, monthlyRate, mortgagePayment, extraPayment, numPayments) {
        const equityData = [];
        let remainingBalance = principal;
        let equity = 0;
        let totalPayments = 0;
    
        for (let i = 1; i <= numPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment + extraPayment;
            remainingBalance -= principalPayment;
            equity = principal - remainingBalance;
            totalPayments = i;
    
            if (remainingBalance <= 0) {
                remainingBalance = 0;
                equity = principal;
                equityData.push({ x: i, y: equity });
                break;
            }
    
            equityData.push({ x: i, y: equity });
        }
    
        const trace = {
            x: equityData.map((d) => d.x),
            y: equityData.map((d) => d.y.toFixed(2)),
            name: 'Home Equity',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#2ca02c' }
        };

        const layout = {
            title: 'Equity Build-up Over Time',
            xaxis: {
                title: 'Payment Year',
                tickmode: 'array',
                tickvals: Array.from({length: Math.ceil(numPayments/12) + 1}, (_, i) => i*12),
                ticktext: Array.from({length: Math.ceil(numPayments/12) + 1}, (_, i) => `Year ${i}`),
                range: [0, numPayments]
            },
            yaxis: {
                title: 'Equity',
                range: [0, principal]
            },
            width: window.innerWidth * 0.97,
            height: 400,
        };
    
        const config = { responsive: true };
    
        Plotly.newPlot('chart5', [trace], layout, config);
    }
    
    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    function createAmortizationTable(principal, monthlyRate, numPayments, mortgagePayment, extraPayment, firstPaymentDate) {
        const tableBody = document.querySelector("#amortization-table tbody");
        tableBody.innerHTML = ''; // Clear existing table rows
    
        let remainingBalance = principal;
        let totalInterest = 0;
        let totalPrincipal = 0;
        let totalExtraPayments = 0;
        let actualPayments = 0;
    
        let currentDate = firstPaymentDate ? new Date(firstPaymentDate) : null;
    
        for (let i = 1; i <= numPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = mortgagePayment - interestPayment;
            remainingBalance -= (principalPayment + extraPayment);
    
            totalInterest += interestPayment;
            totalPrincipal += principalPayment;
            totalExtraPayments += extraPayment;
            actualPayments++;
    
            const row = document.createElement('tr');
            
            // Create the payment number or date cell
            const paymentCell = document.createElement('td');
            if (currentDate) {
                paymentCell.textContent = formatDate(currentDate);
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else {
                paymentCell.textContent = `Year ${Math.floor((i-1)/12)}, Month ${(i-1)%12 + 1}`;
            }
            row.appendChild(paymentCell);
    
            // Add the rest of the cells
            row.innerHTML += `
                <td>$${mortgagePayment.toFixed(2)}</td>
                <td>$${extraPayment.toFixed(2)}</td>
                <td>$${principalPayment.toFixed(2)}</td>
                <td>$${interestPayment.toFixed(2)}</td>
                <td>$${remainingBalance.toFixed(2)}</td>
            `;
    
            tableBody.appendChild(row);
    
            if (remainingBalance <= 0) {
                break;
            }
        }
    
        // Add a summary row
        const summaryRow = document.createElement('tr');
        summaryRow.innerHTML = `
            <td colspan="2"><strong>Totals</strong></td>
            <td><strong>$${totalExtraPayments.toFixed(2)}</strong></td>
            <td><strong>$${totalPrincipal.toFixed(2)}</strong></td>
            <td><strong>$${totalInterest.toFixed(2)}</strong></td>
            <td><strong>$${(totalPrincipal + totalInterest + totalExtraPayments).toFixed(2)}</strong></td>
        `;
        tableBody.appendChild(summaryRow);
    
        // Add a message about loan payoff
        const roundedActualPayments = Math.round(actualPayments);
        const roundedNumPayments = Math.round(numPayments);
        document.getElementById("paidOffIn").value = roundedActualPayments;
        document.getElementById("outOf").value = roundedNumPayments;
    }
    
    function clearDate() {
        const firstPaymentDateInput = document.getElementById("firstPaymentDate");
        firstPaymentDateInput.value = "";
        
        // Recalculate the mortgage to update the amortization table
        calculateMortgage(new Event('submit'));
    }
    
    const form = document.getElementById("mortgageForm");
    form.addEventListener("submit", calculateMortgage);
    
    const clearDateBtn = document.getElementById("clearDateBtn");
    clearDateBtn.addEventListener("click", clearDate);
    
    window.addEventListener('resize', function() {
        const charts = ['chart', 'chart2', 'chart3', 'chart4', 'chart5'];
        charts.forEach(chart => {
            Plotly.relayout(chart, {
                width: window.innerWidth * 0.97
            });
        });
    });
});