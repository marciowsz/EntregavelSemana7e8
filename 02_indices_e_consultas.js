// =============================================================================
// PARTE 2 - Mini Projeto (Índices e Consultas)
// Pré-requisito: ter executado 01_insercao_dados.js
//
// Como executar:  mongosh --file 02_indices_e_consultas.js
// =============================================================================

db = db.getSiblingDB("ecommerce_db"); // equivale a: use ecommerce_db

// Função auxiliar apenas para imprimir os resultados de forma legível.
function mostrar(titulo, cursor) {
  print("\n=== " + titulo + " ===");
  const docs = cursor.toArray();
  print("Documentos encontrados: " + docs.length);
  docs.forEach((d) => printjson(d));
}

// -----------------------------------------------------------------------------
// 2.1 Índice SIMPLES em campo de alta consulta (preço)
//     Filtros e ordenações por preço são muito comuns em catálogos.
//     1 = ordem crescente.
// -----------------------------------------------------------------------------
print("Índice simples criado: " + db.produtos.createIndex({ preco: 1 }, { name: "idx_preco" }));

// -----------------------------------------------------------------------------
// 2.2 Índice de TEXTO (busca textual) em título + descrição
//     O MongoDB permite apenas UM índice de texto por coleção, então os dois
//     campos entram juntos. O título recebe peso maior que a descrição.
//     default_language "portuguese" ativa stemming e stop words em português.
// -----------------------------------------------------------------------------
print(
  "Índice de texto criado: " +
    db.produtos.createIndex(
      { titulo: "text", descricao: "text" },
      {
        name: "idx_texto_titulo_descricao",
        default_language: "portuguese",
        weights: { titulo: 2, descricao: 1 },
      }
    )
);

print("\nÍndices existentes na coleção:");
db.produtos.getIndexes().forEach((i) => print(" - " + i.name + " -> " + JSON.stringify(i.key)));

// -----------------------------------------------------------------------------
// 2.3 Consultas com filtros variados (mínimo exigido: 3)
// -----------------------------------------------------------------------------

// (a) Operadores de comparação: produtos com preço entre R$ 100 e R$ 500.
//     $gt = maior que, $lt = menor que. Usa o índice idx_preco.
mostrar(
  "Consulta A - preço > 100 e < 500 ($gt, $lt)",
  db.produtos.find({ preco: { $gt: 100, $lt: 500 } }, { titulo: 1, preco: 1, _id: 0 }).sort({ preco: 1 })
);

// (b) Valor dentro de um array: produtos que têm a tag "promoção".
//     Em arrays, { campo: valor } casa se QUALQUER elemento for igual ao valor.
mostrar(
  'Consulta B - valor dentro de array (tags: "promoção")',
  db.produtos.find({ tags: "promoção" }, { titulo: 1, tags: 1, _id: 0 })
);

// (c) Índice de texto: busca por palavra em título/descrição, ordenada por relevância.
//     Com default_language "portuguese", "bateria" também encontra variações da palavra.
mostrar(
  'Consulta C - índice de texto ($text, $search: "bateria")',
  db.produtos
    .find({ $text: { $search: "bateria" } }, { titulo: 1, score: { $meta: "textScore" }, _id: 0 })
    .sort({ score: { $meta: "textScore" } })
);
