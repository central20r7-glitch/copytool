// Carrega as imagens do navegador ou começa vazio
let images = JSON.parse(localStorage.getItem('minhasImagens')) || [];

const topRanking = document.getElementById('topRanking');
const mainGallery = document.getElementById('mainGallery');
const placeholderURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TZW0gSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==";

function render() {
    // Se não houver imagens, mostra o placeholder cinza
    if (images.length === 0) {
        topRanking.innerHTML = `<div class="card"><img src="${placeholderURL}" style="width:100%"></div>`;
        mainGallery.innerHTML = "<p style='padding:20px'>Nenhuma imagem adicionada. Clique em 'Adicionar Imagem' acima.</p>";
        return;
    }

    // Salva no navegador
    localStorage.setItem('minhasImagens', JSON.stringify(images));

    // Ranking (Top 5)
    const sorted = [...images].sort((a, b) => b.copies - a.copies);
    topRanking.innerHTML = sorted.slice(0, 5).map((img, i) => createCard(img, i + 1)).join('');

    // Galeria Completa
    mainGallery.innerHTML = images.map(img => createCard(img)).join('');
}

function createCard(img, rank = null) {
    return `
        <div class="card">
            ${rank ? `<span class="badge">#${rank}</span>` : ''}
            <div class="img-container">
                <img src="${img.url}">
                <div class="overlay">
                    <button class="btn-copy" onclick="copyImage('${img.url}', ${img.id}, this)">
                        <i class="fas fa-copy"></i> COPIAR
                    </button>
                    <button class="btn-delete" onclick="deleteImage(${img.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-info">
                <h3>${img.name}</h3>
                <span class="copy-count">${img.copies} envios</span>
            </div>
        </div>
    `;
}

// FUNÇÃO REAL DE COPIAR IMAGEM
async function copyImage(url, id, btn) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);

        // Atualiza contador
        const imgObj = images.find(i => i.id === id);
        imgObj.copies++;
        
        showToast();
        render();
    } catch (err) {
        alert("Erro: O navegador bloqueia cópias em arquivos locais. \n\nPara funcionar, você precisa rodar este arquivo dentro de um servidor (como o Live Server do VS Code) ou hospedar no GitHub.");
    }
}

function deleteImage(id) {
    if(confirm("Remover esta imagem?")) {
        images = images.filter(i => i.id !== id);
        render();
    }
}

function showToast() {
    const t = document.getElementById('toast');
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2000);
}

// Upload de arquivos
function triggerUpload() { document.getElementById('fileInput').click(); }

document.getElementById('fileInput').addEventListener('change', function(e) {
    Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            images.push({
                id: Date.now() + Math.random(),
                name: file.name,
                url: event.target.result,
                copies: 0
            });
            render();
        };
        reader.readAsDataURL(file);
    });
});

render();