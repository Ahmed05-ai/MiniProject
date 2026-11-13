const http = require('http');

http.get('http://localhost:5000/dashboard.html', res => {
    console.log('HTTP Status:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Has fees table:', data.includes('id="fees-table"'));
        console.log('Has timetable:', data.includes('id="timetable-tbody"'));
        console.log('Has fee breakdown:', data.includes('Fee Breakdown & Payment Schedule'));
        console.log('Has notices table:', data.includes('id="notices-table"'));
    });
}).on('error', err => {
    console.error('Error:', err.message);
});

