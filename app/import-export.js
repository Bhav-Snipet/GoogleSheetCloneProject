const download = document.getElementById('downloadBtn');
const upload = document.getElementById('upload');

download.addEventListener('click', () => {  
    const data = JSON.stringify(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'google-spreadsheet.json';
    link.click();
}
);

upload.addEventListener('change', (event) => {
    console.log("File upload triggered");
    const file = event.target.files[0];
    if (file.type !== 'application/json') {
        alert("Please upload a JSON file.");
        return;
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log("File content:", e.target.result);
            try {
                const data = JSON.parse(e.target.result);
                console.log("Parsed JSON:", data);
                alert("JSON file uploaded successfully.");
                Object.keys(data).forEach((key) => {
                    const cell = document.getElementById(key);
                    if (cell) {
                        cell.innerText = data[key].innerText;
                    }
                });
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    }
});