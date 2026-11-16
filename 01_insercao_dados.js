// =============================================================================
// PARTE 1 - Manipulação e Inserção de Dados (Exercício Guiado)
// Modelagem NoSQL com MongoDB - catálogo de e-commerce
//
// Como executar:  mongosh --file 01_insercao_dados.js
// =============================================================================

// Equivale ao comando interativo `use ecommerce_db`.
// (O atalho `use` só funciona no terminal interativo, não dentro de arquivos .js,
//  por isso usamos getSiblingDB, que cria/seleciona o banco da mesma forma.)
db = db.getSiblingDB("ecommerce_db");

// Torna o script re-executável: remove a coleção antiga (e seus índices) antes de recriar.
db.produtos.drop();

// Inserção de 6 produtos (mínimo exigido: 3) com insertMany().
// Cada documento tem:
//   - ARRAYS:        tags, variacoes (array de subdocumentos) e comentarios
//   - SUBDOCUMENTOS: fabricante (e fabricante.contato, aninhado)
const resultado = db.produtos.insertMany([
  {
    titulo: "Smartphone Nova X12",
    descricao:
      "Smartphone com tela AMOLED de 6,5 polegadas, câmera tripla e bateria de longa duração com carregamento rápido.",
    categoria: "celulares",
    preco: 2499.9,
    tags: ["eletrônicos", "celular", "promoção"],
    fabricante: {
      nome: "TechNova",
      pais: "China",
      contato: { site: "https://technova.example.com", email: "sac@technova.example.com" },
    },
    variacoes: [
      { cor: "Preto", armazenamento: "128GB", estoque: 15 },
      { cor: "Azul", armazenamento: "256GB", estoque: 8 },
    ],
    comentarios: [
      { autor: "Ana Souza", nota: 5, texto: "Bateria dura o dia todo.", data: ISODate("2026-09-12T14:30:00Z") },
      { autor: "Bruno Lima", nota: 4, texto: "Ótima câmera, mas esquenta um pouco.", data: ISODate("2026-10-02T09:10:00Z") },
    ],
    criadoEm: ISODate("2026-08-01T12:00:00Z"),
  },
  {
    titulo: "Camiseta Básica Algodão",
    descricao: "Camiseta básica 100% algodão, modelagem reta e toque macio. Ideal para o dia a dia.",
    categoria: "camisetas",
    preco: 59.9,
    tags: ["moda", "camiseta", "promoção"],
    fabricante: {
      nome: "Malharia Sul",
      pais: "Brasil",
      contato: { site: "https://malhariasul.example.com", email: "contato@malhariasul.example.com" },
    },
    // ATENÇÃO (propositalmente): este produto tem tamanho "M" (cor Verde) e cor "Azul"
    // (tamanho P e G), mas NENHUMA variação que seja M e Azul ao mesmo tempo.
    // Serve para demonstrar a diferença do $elemMatch na Parte 3.
    variacoes: [
      { tamanho: "P", cor: "Azul", estoque: 10 },
      { tamanho: "M", cor: "Verde", estoque: 5 },
      { tamanho: "G", cor: "Azul", estoque: 7 },
    ],
    comentarios: [
      { autor: "Carla Dias", nota: 4, texto: "Tecido macio, veste bem.", data: ISODate("2026-09-20T18:00:00Z") },
    ],
    criadoEm: ISODate("2026-08-10T12:00:00Z"),
  },
  {
    titulo: "Camiseta Polo Premium",
    descricao: "Camiseta polo em piquet com acabamento premium e gola reforçada.",
    categoria: "camisetas",
    preco: 129.9,
    tags: ["moda", "polo"],
    fabricante: {
      nome: "Malharia Sul",
      pais: "Brasil",
      contato: { site: "https://malhariasul.example.com", email: "contato@malhariasul.example.com" },
    },
    variacoes: [
      { tamanho: "M", cor: "Azul", estoque: 12 },
      { tamanho: "G", cor: "Branco", estoque: 4 },
    ],
    comentarios: [],
    criadoEm: ISODate("2026-08-15T12:00:00Z"),
  },
  {
    titulo: "Fone de Ouvido Bluetooth Sonic",
    descricao: "Fone sem fio com cancelamento de ruído, microfone embutido e bateria para até 30 horas.",
    categoria: "audio",
    preco: 199.0,
    tags: ["eletrônicos", "áudio", "promoção"],
    fabricante: {
      nome: "SonicWave",
      pais: "Estados Unidos",
      contato: { site: "https://sonicwave.example.com", email: "help@sonicwave.example.com" },
    },
    variacoes: [
      { cor: "Preto", estoque: 40 },
      { cor: "Branco", estoque: 22 },
    ],
    comentarios: [
      { autor: "Diego Alves", nota: 5, texto: "Cancelamento de ruído excelente.", data: ISODate("2026-10-05T20:15:00Z") },
    ],
    criadoEm: ISODate("2026-08-20T12:00:00Z"),
  },
  {
    titulo: "Notebook Ultra 14",
    descricao: "Notebook leve com tela de 14 polegadas, processador de última geração, SSD rápido e bateria de dia inteiro.",
    categoria: "computadores",
    preco: 4599.0,
    tags: ["eletrônicos", "computadores"],
    fabricante: {
      nome: "Compulab",
      pais: "Taiwan",
      contato: { site: "https://compulab.example.com", email: "suporte@compulab.example.com" },
    },
    variacoes: [
      { memoria: "8GB", armazenamento: "256GB", estoque: 6 },
      { memoria: "16GB", armazenamento: "512GB", estoque: 3 },
    ],
    comentarios: [
      { autor: "Elisa Rocha", nota: 5, texto: "Leve e rápido, ótimo para trabalhar.", data: ISODate("2026-10-18T11:45:00Z") },
    ],
    criadoEm: ISODate("2026-09-01T12:00:00Z"),
  },
  {
    titulo: "Tênis de Corrida Veloz",
    descricao: "Tênis de corrida com amortecimento responsivo e solado de alta aderência.",
    categoria: "calcados",
    preco: 349.9,
    tags: ["moda", "esporte", "calçados"],
    fabricante: {
      nome: "Pace Sports",
      pais: "Vietnã",
      contato: { site: "https://pacesports.example.com", email: "atendimento@pacesports.example.com" },
    },
    variacoes: [
      { tamanho: "40", cor: "Azul", estoque: 9 },
      { tamanho: "41", cor: "Preto", estoque: 14 },
      { tamanho: "42", cor: "Preto", estoque: 11 },
    ],
    comentarios: [
      { autor: "Fábio Neri", nota: 4, texto: "Confortável para treinos longos.", data: ISODate("2026-10-25T07:30:00Z") },
    ],
    criadoEm: ISODate("2026-09-10T12:00:00Z"),
  },
]);

print("Documentos inseridos: " + Object.keys(resultado.insertedIds).length);
print("Total na coleção produtos: " + db.produtos.countDocuments());

// Conferência rápida: um documento completo, para ver array + subdocumento.
printjson(db.produtos.findOne({ titulo: "Smartphone Nova X12" }));
