let dictionary = new Array(256);
let wordToByte = new Map();
let mode = 'encode';

const themes = {
    apostolos: ["pedro", "andré", "tiago", "joão", "filipe", "bartolomeu", "tomé", "mateus", "tiagofilho", "tadeu", "simão", "judas", "matias", "paulo", "lucas", "marcos", "gênesis", "êxodo", "levítico", "números", "deuteronômio", "josué", "juízes", "rute", "samuel", "reis", "crônicas", "esdras", "neemias", "ester", "jó", "salmos", "provérbios", "eclesiastes", "cantares", "isaías", "jeremias", "lamentações", "ezequiel", "daniel", "oseias", "joel", "amós", "obadias", "jonas", "miqueias", "naum", "habacuque", "sofonias", "ageu", "zacarias", "malaquias", "jerusalém", "belém", "egito", "galileia", "jordão", "sinai", "arcanjo", "querubim", "serafim", "messias", "cristo", "jesus", "maria", "josé", "lázaro", "marta", "madalena", "amém", "aleluia", "hosana", "selah", "shabat"],
    quimica: ["hidrogênio", "hélio", "lítio", "berílio", "boro", "carbono", "nitrogênio", "oxigênio", "flúor", "neônio", "sódio", "magnésio", "alumínio", "silício", "fósforo", "enxofre", "cloro", "argônio", "potássio", "cálcio", "escândio", "titânio", "vanádio", "cromo", "manganês", "ferro", "cobalto", "níquel", "cobre", "zinco", "gálio", "germânio", "arsênio", "selênio", "bromo", "criptônio"],
    espaco: ["mercúrio", "vênus", "terra", "marte", "júpiter", "saturno", "urano", "netuno", "plutão", "andrômeda", "sirius", "orion", "vega", "antares", "betelgeuse", "espica", "arcturus", "aldebarã", "rigel", "fomalhaut", "deneb", "regulus", "castor", "pollux", "capella", "canopus"]
};

function initDictionary() {
    const themeKey = document.getElementById('themeSelector').value;
    const base = themes[themeKey];
    wordToByte.clear();
    for (let i = 0; i < 256; i++) {
        let word = i < base.length ? base[i] : `${base[i % base.length]}_${Math.floor(i/base.length)}`;
        dictionary[i] = word;
        wordToByte.set(word, i);
    }
}

function safeUint8ToString(array) {
    const CHUNK_SIZE = 0x8000; 
    let str = "";
    for (let i = 0; i < array.length; i += CHUNK_SIZE) {
        str += String.fromCharCode.apply(null, array.subarray(i, i + CHUNK_SIZE));
    }
    return str;
}

async function handleAction() {
    const fileInput = document.getElementById('fileInput');
    const outputArea = document.getElementById('outputArea');
    const status = document.getElementById('statusMessage');
    const progress = document.getElementById('progressBar');
    const progContainer = document.getElementById('progressBarContainer');

    if (mode === 'encode') {
        const file = fileInput.files[0];
        if (!file) return alert("Selecione um arquivo!");
        
        progContainer.style.display = 'block';
        const bytes = new Uint8Array(await file.arrayBuffer());
        let words = [];
        
        for (let i = 0; i < bytes.length; i++) {
            words.push(dictionary[bytes[i]]);
            if (i % 50000 === 0) { 
                progress.style.width = `${(i / bytes.length) * 100}%`;
                status.innerText = `Mapeando: ${Math.round((i/bytes.length)*100)}%`;
                await new Promise(r => setTimeout(r, 0));
            }
        }
        
        status.innerText = "Comprimindo e Gerando Base64...";
        const compressed = pako.gzip(words.join(' '));
        outputArea.value = btoa(safeUint8ToString(compressed));
        
        download(compressed, file.name + ".holy");
        status.innerText = "✅ Encode Finalizado!";
        progress.style.width = "100%";
    } else {
        try {
            status.innerText = "Descodificando...";
            const b64Data = outputArea.value.trim();
            const compressed = new Uint8Array(atob(b64Data).split("").map(c => c.charCodeAt(0)));
            const plain = pako.ungzip(compressed, { to: 'string' });
            const words = plain.split(' ');
            const out = new Uint8Array(words.length);
            
            for(let i=0; i<words.length; i++) out[i] = wordToByte.get(words[i]);
            
            const ext = prompt("Extensão original (ex: jpg, pdf, zip)?", "bin");
            download(out, `restaurado.${ext}`);
            status.innerText = "✅ Decode Finalizado!";
        } catch(e) {
            alert("Erro nos dados. Certifique-se de que o texto e o tema estão corretos.");
        }
    }
}

function download(data, name) {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
}

// Inicialização e Eventos
initDictionary();
document.getElementById('dropZone').onclick = () => document.getElementById('fileInput').click();
document.getElementById('fileInput').onchange = (e) => {
    if(e.target.files[0]) document.getElementById('fileStatus').innerText = "📄 " + e.target.files[0].name;
};
function setMode(m) { 
    mode = m; 
    document.querySelectorAll('.mode-selector button').forEach(b => b.classList.remove('active'));
    document.getElementById(m === 'encode' ? 'btnEncode' : 'btnDecode').classList.add('active');
}