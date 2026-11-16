// =============================================================================
// PARTE 3 - Tarefa de Casa (Desafio)
// Pré-requisito: ter executado 01_insercao_dados.js e 02_indices_e_consultas.js
//
// Como executar:  mongosh --file 03_tarefa_de_casa_desafio.js
// =============================================================================

db = db.getSiblingDB("ecommerce_db"); // equivale a: use ecommerce_db

// -----------------------------------------------------------------------------
// 3.1 Consulta com $elemMatch em array de subdocumentos
//     Objetivo: achar o produto que tenha UMA variação com tamanho "M" E cor "Azul".
//     $elemMatch exige que as duas condições sejam satisfeitas pelo MESMO
//     elemento do array `variacoes`.
// -----------------------------------------------------------------------------
print("=== 3.1 $elemMatch: variação com tamanho M e cor Azul (no mesmo elemento) ===");
const comElemMatch = db.produtos
  .find({ variacoes: { $elemMatch: { tamanho: "M", cor: "Azul" } } }, { titulo: 1, variacoes: 1, _id: 0 })
  .toArray();
print("Encontrados com $elemMatch: " + comElemMatch.length);
comElemMatch.forEach((d) => printjson(d));

// Contraste: SEM $elemMatch cada condição pode ser satisfeita por elementos diferentes.
// "Camiseta Básica Algodão" aparece aqui (tem M/Verde e P/Azul e G/Azul), mas é um falso positivo.
print("\n--- Contraste: mesma busca SEM $elemMatch (notação de ponto) ---");
const semElemMatch = db.produtos
  .find({ "variacoes.tamanho": "M", "variacoes.cor": "Azul" }, { titulo: 1, _id: 0 })
  .toArray();
print("Encontrados sem $elemMatch: " + semElemMatch.length + " (inclui falso positivo)");
semElemMatch.forEach((d) => printjson(d));

// -----------------------------------------------------------------------------
// 3.2 BÔNUS: comprovar o uso do índice com explain("executionStats")
//     Consulta usada: preço entre 100 e 500 (coberta pelo índice idx_preco da Parte 2).
// -----------------------------------------------------------------------------
function resumoExplain(rotulo, plano) {
  const stats = plano.executionStats;
  const usouIndice = JSON.stringify(plano.queryPlanner.winningPlan).includes("IXSCAN");
  print("\n--- " + rotulo + " ---");
  print("Estágio de varredura : " + (usouIndice ? "IXSCAN (usou índice)" : "COLLSCAN (varreu a coleção)"));
  print("totalKeysExamined    : " + stats.totalKeysExamined);
  print("totalDocsExamined    : " + stats.totalDocsExamined);
  print("nReturned            : " + stats.nReturned);
}

print("\n=== 3.2 explain(\"executionStats\") ===");
const filtro = { preco: { $gt: 100, $lt: 500 } };

// Com o índice (comportamento normal: o planejador escolhe idx_preco).
resumoExplain("COM índice idx_preco", db.produtos.find(filtro).explain("executionStats"));

// Forçando varredura completa ($natural) só para comparar.
resumoExplain(
  "SEM índice (hint $natural, força COLLSCAN)",
  db.produtos.find(filtro).hint({ $natural: 1 }).explain("executionStats")
);

print(
  "\nInterpretação: totalKeysExamined > 0 e estágio IXSCAN comprovam que o índice da Parte 2 está em uso. " +
    "Com COLLSCAN, totalKeysExamined é 0 e todos os documentos são lidos (totalDocsExamined)."
);
