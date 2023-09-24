class TrieNode {

  //Constructor, Time O(1), Space O(1)
  constructor(c) {
    this.data = c
    this.isEnd = false
    this.children = new Map() //map
  }
}

class Trie {
  //Constructor, Time O(1), Space O(1)
  constructor() {
    this.root = new TrieNode('')
  }

  //inserts a word into the trie. Time O(s), Space O(s), s is word length
  insert(word) {
    var node = this.root
    for (let ch of word) {
      if (!node.children.has(ch))
        node.children.set(ch, new TrieNode(ch))
      node = node.children.get(ch)
    }
    node.isEnd = true
  }

  //find all word with given prefix, call recursion function
  //Time O(n), Space O(n), n is number of nodes involved (include prefix and branches)
  autocomplete(word) {
    var res = new Array()
    var node = this.root
    for (let ch of word) {
      if (node.children.has(ch))
        node = node.children.get(ch)
      else
        return res
    }
    this.helper(node, res, word.substring(0, word.length - 1))
    return res
  }

  //recursive function called by autocomplete
  //Time O(n), Space O(n), n is number of nodes in branches
  helper(node, res, prefix) {
    if (node.isEnd)
      res.push(prefix + node.data)
    for (let c of node.children.keys())
      this.helper(node.children.get(c), res, prefix + node.data)
  }
}

const getData = () => ({
  step: 0,
  autocomplete: '',
  words: [],
  items: [],
  obj: {},
  produtos: [],
  produto: {
    produto: '',
    material: '',
    acabamento: '',
  },
  t: undefined,
  dict: undefined,
  tipo: '',
  sequencia: [{
      'title': 'produto',
      'description': 'Escolha um produto',
    },
    {
      'title': 'medida',
      'description': '1,20 x 0,60. Se não tiver medida, então digite espaço e enter',
    },
    {
      'title': 'material',
      'description': 'Escolha um material',
    },
    {
      'title': 'acabamento',
      'description': 'Escolha um acabamento',
    },
  ],

  init() {
    this.obj = {
      "produto": ["Piso", "Piso paginado", "Bancada", "Tampo"],
      "medida": [],
      "material": ["Granito Branco Itaúnas", "Granito Branco Polar", "Granito Verde Ubatuba", "Granito Preto São Gabriel"],
      "acabamento": ["reto", "boleado", "meia esquadria"],
    }

    this.items = this.obj.produto

    this.dict = new Map()

    this.dict.set('produto', 'produto')
    this.dict.set('medida', 'medida')
    this.dict.set('material', 'material')
    this.dict.set('acabamento', 'acabamento')

    this.t = new Trie()

    this.t.insert("Piso")
    this.t.insert("Piso paginado")
    this.t.insert("Bancada")
    this.t.insert("Tampo")
    this.t.insert("acabamento")
    this.t.insert("granito")
    this.t.insert("furo de cuba")

    this.$watch('autocomplete', (newValue, oldValue) => {
      this.items = this.t.autocomplete(newValue)
    })
  },

  addItem(selectedItem) {
    if (selectedItem) this.autocomplete = selectedItem

    let item = this.t.autocomplete(this.autocomplete)[0]

    if (this.autocomplete.includes(' x ')) {
      const [comprimento, largura] = this.autocomplete.split(' x ')
      this.produto['comprimento'] = comprimento
      this.produto['largura'] = largura
      this.words.push(`${comprimento} x ${largura} m`)
    }

    if (item === undefined && this.tipo !== 'medida') {
      this.words.push(this.autocomplete)
      this.autocomplete = ''
      return
    }

    this.tipo = this.dict.get(this.sequencia[this.step++].title)

    if (this.tipo === "acabamento" || this.tipo === "material") {
      const teste = `${this.tipo} ${this.produto[this.tipo]} ${item}`
      this.words.push(teste)
    } else {
      this.words.push(item)
    }

    this.autocomplete = ''

    this.produto[this.tipo] = item

    if (this.step === this.sequencia.length) return

    this.tipo = this.dict.get(this.sequencia[this.step].title)

    this.t = new Trie()
    this.obj[this.tipo].forEach((item) => {
      this.t.insert(item)
    })
    this.$refs.autocomplete.focus()
  },

  addProduto() {
    this.items = this.obj.produto
    this.produto.text = this.words.join(' ')
    this.produtos.push(this.produto)
    this.produto = {
      produto: '',
      material: '',
      acabamento: '',
    }
    this.step = 0
    this.words = []

    this.tipo = this.dict.get(this.sequencia[this.step].title)

    this.t = new Trie()
    this.obj[this.tipo].forEach((item) => {
      this.t.insert(item)
    })
  },

  removeProduto(index) {
    this.produtos.splice(index, 1)
  },

  getCurrentTimeYYMMDDHHMMSS() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return year + month + day + hours + minutes + seconds;
  },

  exportToExcel() {
    const sheet = XLSX.utils.json_to_sheet(this.produtos)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')
    XLSX.writeFile(workbook, `orcamento_${this.getCurrentTimeYYMMDDHHMMSS()}.xlsx`)
  },
})