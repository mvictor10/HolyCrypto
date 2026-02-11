import os
import argparse
from pathlib import Path

class HolyBytesStorage:
    def __init__(self):
        # Dicionário Determinístico (Não alterar a ordem!)
        self._base = [
            "pedro", "andré", "tiago", "joão", "filipe", "bartolomeu", "tomé", "mateus", 
            "tiagofilho", "tadeu", "simão", "judas", "matias", "paulo", "lucas", "marcos",
            "gênesis", "êxodo", "levítico", "números", "deuteronômio", "josué", "juízes", "rute",
            "samuel", "reis", "crônicas", "esdras", "neemias", "ester", "jó", "salmos",
            "provérbios", "eclesiastes", "cantares", "isaías", "jeremias", "lamentações", "ezequiel",
            "daniel", "oseias", "joel", "amós", "obadias", "jonas", "miqueias", "naum", "habacuque",
            "sofonias", "ageu", "zacarias", "malaquias", "atos", "romanos", "coríntios", "gálatas", 
            "efésios", "filipenses", "colossenses", "tessalonicenses", "timóteo", "tito", "filemom", 
            "hebreus", "apocalipse", "jerusalém", "belém", "egito", "galileia", "jordão", "sinai", 
            "arcanjo", "querubim", "serafim", "messias", "cristo", "jesus", "maria", "josé", 
            "lázaro", "marta", "madalena", "amém", "aleluia", "hosana", "selah", "shabat", "elohim"
        ]
        self.dictionary = self._generate_full_dictionary()
        self.word_to_byte = {word: i for i, word in enumerate(self.dictionary)}

    def _generate_full_dictionary(self):
        unique_words = []
        seen = set()
        for w in self._base:
            if w not in seen:
                unique_words.append(w)
                seen.add(w)
        i = 0
        while len(unique_words) < 256:
            word = f"{self._base[i % len(self._base)]}_{i // len(self._base)}"
            if word not in seen:
                unique_words.append(word)
                seen.add(word)
            i += 1
        return unique_words

    def encode(self, input_path, output_path):
        # Resolve caminhos para absoluto para evitar erros de diretório atual
        input_file = Path(input_path).resolve()
        output_file = Path(output_path).resolve()

        if not input_file.exists():
            print(f"[-] Erro: O arquivo {input_file} não existe.")
            return

        with open(input_file, 'rb') as f:
            raw_data = f.read()

        encoded_text = " ".join([self.dictionary[b] for b in raw_data])

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(encoded_text)
        print(f"[+] Concluído: {len(raw_data)} bytes -> {output_file}")

    def decode(self, input_path, output_path):
        input_file = Path(input_path).resolve()
        output_file = Path(output_path).resolve()

        if not input_file.exists():
            print(f"[-] Erro: O arquivo {input_file} não existe.")
            return

        with open(input_file, 'r', encoding='utf-8') as f:
            words = f.read().split()

        reconstructed = bytearray()
        for word in words:
            if word in self.word_to_byte:
                reconstructed.append(self.word_to_byte[word])

        with open(output_file, 'wb') as f:
            f.write(reconstructed)
        print(f"[+] Concluído: {len(words)} palavras -> {output_file}")

# --- Interface de Linha de Comando ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HolyBytes CLI - Armazenamento Léxico")
    parser.add_argument("mode", choices=['encode', 'decode'], help="Ação a realizar")
    parser.add_argument("input", help="Caminho direto para o arquivo de entrada")
    parser.add_argument("output", help="Caminho direto para o arquivo de saída")

    args = parser.parse_args()
    storage = HolyBytesStorage()

    if args.mode == 'encode':
        storage.encode(args.input, args.output)
    else:
        storage.decode(args.input, args.output)