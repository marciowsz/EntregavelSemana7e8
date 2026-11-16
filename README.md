# Entregável Semana 07 e 08 — Modelagem NoSQL com MongoDB

Catálogo de **e-commerce** modelado em MongoDB (banco `ecommerce_db`, coleção `produtos`), aplicando
os conceitos de bancos orientados a documentos: arrays, subdocumentos, índices e consultas.

## Estrutura do repositório

| Arquivo | Conteúdo |
|---|---|
| `01_insercao_dados.js` | **Parte 1** — criação do banco/coleção e `insertMany()` de 6 produtos |
| `02_indices_e_consultas.js` | **Parte 2** — índice simples, índice de texto e 3 consultas variadas |
| `03_tarefa_de_casa_desafio.js` | **Parte 3** — consulta com `$elemMatch` e bônus com `explain("executionStats")` |
| `README.md` | Instruções e **Parte 4** (reflexão) |

## Como executar

Pré-requisito: MongoDB rodando localmente e o `mongosh` instalado. Execute **na ordem**, dentro desta pasta:

```bash
mongosh --file 01_insercao_dados.js
mongosh --file 02_indices_e_consultas.js
mongosh --file 03_tarefa_de_casa_desafio.js
```

Se o MongoDB não estiver em `localhost:27017`, passe a URI: `mongosh "mongodb://host:porta" --file 01_insercao_dados.js`.

Os scripts também podem ser executados no MongoDB Compass (aba *MongoSH*), copiando e colando o conteúdo.

> **Sobre `use ecommerce_db`:** esse atalho só funciona no terminal interativo. Dentro de arquivos `.js`
> o equivalente é `db = db.getSiblingDB("ecommerce_db")`, que é o que os scripts usam.

## Modelo do documento `produtos`

```js
{
  titulo: "Smartphone Nova X12",
  descricao: "...",
  categoria: "celulares",
  preco: 2499.9,
  tags: ["eletrônicos", "celular", "promoção"],        // ARRAY de valores
  fabricante: {                                         // SUBDOCUMENTO
    nome: "TechNova", pais: "China",
    contato: { site: "...", email: "..." }              // subdocumento aninhado
  },
  variacoes: [                                          // ARRAY de SUBDOCUMENTOS
    { cor: "Preto", armazenamento: "128GB", estoque: 15 },
    { cor: "Azul",  armazenamento: "256GB", estoque: 8 }
  ],
  comentarios: [                                        // ARRAY de SUBDOCUMENTOS
    { autor: "Ana Souza", nota: 5, texto: "...", data: ISODate("...") }
  ],
  criadoEm: ISODate("...")
}
```

## Parte 1 — Manipulação e inserção de dados

- Banco `ecommerce_db` e coleção `produtos`.
- `insertMany()` com **6 documentos** (mínimo pedido: 3).
- Todos os documentos têm **array** (`tags`, `variacoes`, `comentarios`) e **subdocumento** (`fabricante`).
- O script faz `drop()` da coleção antes de inserir, então pode ser re-executado sem duplicar dados.

## Parte 2 — Índices e consultas

**Índices criados**

| Índice | Comando | Justificativa |
|---|---|---|
| Simples | `createIndex({ preco: 1 })` | Filtros e ordenação por preço são consultas muito frequentes em catálogos |
| Texto | `createIndex({ titulo: "text", descricao: "text" })` | Busca por palavras; o MongoDB só permite **um** índice de texto por coleção, por isso os dois campos ficam juntos (título com peso 2, descrição com peso 1) e idioma `portuguese` |

**Consultas realizadas**

1. **Comparação** — `find({ preco: { $gt: 100, $lt: 500 } })`
2. **Valor dentro de array** — `find({ tags: "promoção" })`
3. **Índice de texto** — `find({ $text: { $search: "bateria" } })`, ordenado por `textScore`

## Parte 3 — Tarefa de casa (desafio)

**`$elemMatch`**

```js
db.produtos.find({ variacoes: { $elemMatch: { tamanho: "M", cor: "Azul" } } })
```

`$elemMatch` obriga que `tamanho: "M"` e `cor: "Azul"` sejam verdadeiros **no mesmo elemento** do array
`variacoes`. A "Camiseta Básica Algodão" foi cadastrada de propósito com M/Verde, P/Azul e G/Azul: sem
`$elemMatch` (`{ "variacoes.tamanho": "M", "variacoes.cor": "Azul" }`) ela apareceria como falso positivo.
O script executa as duas formas para mostrar a diferença.

**Bônus — `explain("executionStats")`**

O script roda a consulta de preço (`$gt`/`$lt`) com `explain("executionStats")` e imprime:

- o estágio de varredura (`IXSCAN` = usou índice; `COLLSCAN` = varreu a coleção inteira);
- `totalKeysExamined` (chaves de índice lidas — maior que 0 comprova o uso do índice);
- `totalDocsExamined` e `nReturned`.

Há também uma execução de comparação forçando `COLLSCAN` com `hint({ $natural: 1 })`.

## Parte 4 — Reflexão: Embedding × Referencing

**Qual a principal diferença de arquitetura?**

- **Embedding (incorporar):** os dados relacionados ficam **dentro do mesmo documento**, como subdocumento
  ou array. Uma única leitura traz tudo, sem `JOIN`/`$lookup`, e a escrita no documento é atômica.
  O custo é a possível **duplicação** de dados e o limite de **16 MB por documento**.
- **Referencing (referenciar):** os dados ficam em **outra coleção** e o documento guarda apenas o `_id`
  dela. Evita duplicação e permite que muitos documentos apontem para o mesmo registro, mas exige
  **consultas adicionais** (`$lookup` ou segunda query) para montar a informação completa.

**Em que cenário de e-commerce ou blog cada um deve ser usado?**

| Use **embedding** quando… | Use **referencing** quando… |
|---|---|
| os dados são lidos **juntos** | os dados são lidos **separadamente** |
| os dados **mudam pouco** | os dados **mudam com frequência** |
| a relação é 1‑para‑poucos | a relação é muitos‑para‑muitos, ou 1‑para‑muitos ilimitado |

Aplicado a este projeto:

- **E-commerce — embedding:** `variacoes` (cor, tamanho, estoque) e `fabricante` ficam dentro do produto,
  pois a página do produto sempre exibe tudo isso junto e são poucos itens por produto.
  Algumas dezenas de `comentarios` recentes também cabem no documento.
- **E-commerce — referencing:** `pedidos` devem ser coleção própria, referenciando `produto_id` e `cliente_id`;
  um pedido relaciona muitos produtos e um produto aparece em muitos pedidos (muitos‑para‑muitos), e o
  produto muda de preço enquanto o pedido precisa manter o valor da época da compra. Se o `fabricante`
  tivesse dados que mudam com frequência e fosse compartilhado por milhares de produtos, também valeria
  uma coleção `fabricantes` referenciada.
- **Blog — embedding:** `autor` resumido (nome e avatar) e `tags` dentro do post, pois são lidos junto com o texto.
- **Blog — referencing:** os comentários de um post muito famoso, que crescem sem limite, devem ir para uma
  coleção `comentarios` com `post_id`, evitando estourar o limite de 16 MB e permitindo paginação. O mesmo
  vale para o cadastro completo de `usuarios`, que muda independentemente dos posts.

**Regra prática:** *incorpore o que é lido junto e é limitado; referencie o que cresce sem limite, é
compartilhado ou muda com frequência.*

## Link do repositório

https://github.com/marciowsz/EntregavelSemana7e8
