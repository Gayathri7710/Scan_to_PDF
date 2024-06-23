document.getElementById('image-file').addEventListener('change', handleImageUpload);
document.getElementById('scan-btn').addEventListener('click', scanImages);
document.getElementById('convert-btn').addEventListener('click', convertToPDF);

let images = [];

function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    images = [];
    const imagePreview = document.getElementById('image-preview');
    imagePreview.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageURL = URL.createObjectURL(file);

        const img = document.createElement('img');
        img.src = imageURL;
        img.classList.add('uploaded-image');

        images.push({ file, img });
        imagePreview.appendChild(img);
    }

    document.getElementById('convert-btn').disabled = false;
}

async function scanImages() {
    // Simulate scanning process
    alert('Simulating scanning process...');
}

async function convertToPDF() {
    const pdfDoc = await PDFLib.PDFDocument.create();
    const imagePromises = [];

    images.forEach(({ file }) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        const imagePromise = new Promise((resolve, reject) => {
            reader.onload = () => {
                const imgData = reader.result;
                resolve(imgData);
            };
            reader.onerror = error => reject(error);
        });

        imagePromises.push(imagePromise);
    });

    try {
        const imageBytes = await Promise.all(imagePromises);

        for (const imgData of imageBytes) {
            const img = await pdfDoc.embedPng(imgData);
            const page = pdfDoc.addPage();
            const { width, height } = img.scaleToFit(page.getWidth(), page.getHeight());
            page.drawImage(img, {
                x: (page.getWidth() - width) / 2,
                y: (page.getHeight() - height) / 2,
                width,
                height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById('download-link');
        downloadLink.href = url;
        downloadLink.classList.remove('hidden');
    } catch (error) {
        console.error('Error converting to PDF:', error);
        alert('Error converting to PDF. Please try again.');
    }
}
