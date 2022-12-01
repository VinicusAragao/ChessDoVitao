const main = document.getElementsByTagName('main')[0]
const playerText = document.getElementsByTagName('h2')[0]
let tileColor = 'black'
let lineStart = 'black'
let boardMap = []
let grabing = false
let grabedObject
let playerOrder = 'white'

class tile{
  constructor(element){
    this.htmlElement = element 
    this.row = parseInt(element.dataset.object[0])
    this.cell = parseInt(element.dataset.object[1])
    this.tileColor = element.classList[1]
    this.piece = element.getElementsByClassName('piece')
    this.containingPiece = 'none'
    this.player = 'none'
    this.alreadyPlayed = false
    this.possibleMoves = []
  }
  checkPossibleMoves(){
    console.log('checando possibilidades...')
    const player = this.player
    const row = this.row
    const cell = this.cell
    const played = this.alreadyPlayed
    let object
    let colorDiference

    if(player === 'white'){
      colorDiference = -1
    }
    else if(player === 'black'){
      colorDiference = 1
    }

    switch(this.containingPiece){
    case 'pawn':
      checkUndefined(row+(1*colorDiference),cell)
      if(!played){
        checkUndefined(row+(2*colorDiference),cell)
      }
      checkUndefined(row+(1*colorDiference),cell-1)
      checkUndefined(row+(1*colorDiference),cell+1)
    break
    case 'rook':
      for(let i = 1; i < 9;i++){
        checkUndefined(row-i,cell)
        checkUndefined(row+i,cell)
        checkUndefined(row,cell-i)
        checkUndefined(row,cell+i)
      }
    break
    case 'knight':
        checkUndefined(row+2,cell+1)
        checkUndefined(row+2,cell-1)
        checkUndefined(row-2,cell+1)
        checkUndefined(row-2,cell-1)

        checkUndefined(row+1,cell+2)
        checkUndefined(row+1,cell-2)
        checkUndefined(row-1,cell+2)
        checkUndefined(row-1,cell-2) 
    break
    case 'bishop':

    break
    case 'king':

    break
    case 'queen':

    }
  }
}
// class piece{
//   constructor(){
    
//   }
// }
function checkUndefined(row,cell){
  if(row > 7 || row < 0 || cell > 7 || cell < 0){
    return
  }
  else{
    checkMove(grabedObject,boardMap[row][cell])
  }
}
function checkMove(holdedObject,newObject){
  const color = holdedObject.player
  let otherPlayer

  if(color === 'black'){otherPlayer = 'white'}
  else if(color === 'white'){otherPlayer = 'black'}
  if(newObject.containingPiece === 'none' || newObject.player === otherPlayer){
    holdedObject.possibleMoves.push(newObject)
  }
  console.log(holdedObject.possibleMoves)
}

window.addEventListener('load',createBoard)
function createBoard(){
  for(let r = 1; r <= 8; r++){
    let rowEl = document.createElement('div')
        rowEl.classList.add('row')
    main.appendChild(rowEl)
    boardMap.push([])
    createCell(rowEl,r)
  }
  placePieces()
  setSizes()
}
function createCell(rowEl,r){
  for(let c = 1; c <= 8; c++){
    let cell = document.createElement('div')
    let color = chooseColor(c)
        cell.classList.add('cell',color)
        cell.dataset.object = `${r-1}${c-1}`
    let object = new tile(cell)
    boardMap[r-1].push(object)
    rowEl.appendChild(cell)
  }
}
function chooseColor(c){
  if(c === 1){
    if(lineStart === 'black'){
      tileColor = 'white'
      lineStart = 'white'
      return 'cellBlack'
    }
    else if(lineStart === 'white'){
      tileColor = 'black'
      lineStart = 'black'
      return 'cellWhite'
    }
  }
  else{
    if(tileColor === 'black'){
      tileColor = 'white'
      return 'cellBlack'
    }
    else if(tileColor === 'white'){
      tileColor = 'black'
      return 'cellWhite'
    }
  }
}
function placePieces(){
  for(let cell = 0; cell < 8; cell++){
    switch(cell){
    case 0:
      createPiece(0,cell,'rook', 'black')
      createPiece(7,cell,'rook', 'white')
    break
    case 1:
      createPiece(0,cell,'knight', 'black')
      createPiece(7,cell,'knight', 'white')
    break
    case 2:
      createPiece(0,cell,'bishop', 'black')
      createPiece(7,cell,'bishop', 'white')
    break
    case 3:
      createPiece(0,cell,'queen', 'black')
      createPiece(7,cell,'queen', 'white')
    break
    case 4:
      createPiece(0,cell,'king', 'black')
      createPiece(7,cell,'king', 'white')
    break
    case 5:
      createPiece(0,cell,'bishop', 'black')
      createPiece(7,cell,'bishop', 'white')
    break
    case 6:
      createPiece(0,cell,'knight', 'black')
      createPiece(7,cell,'knight', 'white')
    break
    case 7:
      createPiece(0,cell,'rook', 'black')
      createPiece(7,cell,'rook', 'white')
    break
    }
    createPiece(1,cell,'pawn','black')
    createPiece(6,cell,'pawn','white')
  }
}
function createPiece(row,coll,piece,color){
  const object = boardMap[row][coll]
  const el = document.createElement('img')
        el.classList.add('piece',piece)
        el.setAttribute('src', `images/${color+capitalize(piece)}.png`)
        el.setAttribute('draggable', false)
  object.htmlElement.appendChild(el)
  object.htmlElement.addEventListener('pointerdown', holdPiece)
  object.containingPiece = piece
  object.player = color
}
function capitalize(string){
  return string[0].toUpperCase() + string.slice(1)
}
function holdPiece(){
  if(!grabing){
    console.log('pegou')
    const path = this.dataset.object
    grabedObject = boardMap[path[0]][path[1]]
    if(grabedObject.player === playerOrder){
      grabedObject.checkPossibleMoves()
      const tiles = document.getElementsByClassName('cell')
      for(let i = 0; i < tiles.length;i++){
        tiles[i].addEventListener('pointerdown',newPieceTile)
      }
      grabing = true 
    }
  }
}
function newPieceTile(){
  if(grabing){
    const path = this.dataset.object
    const newTile = boardMap[path[0]][path[1]]

    if(newTile.player !== grabedObject.player){
      for(let i = 0; i < grabedObject.possibleMoves.length; i++){
        if(JSON.stringify(newTile) === JSON.stringify(grabedObject.possibleMoves[i])){
          createPiece(path[0],path[1],grabedObject.containingPiece,grabedObject.player)
          setSizes()
          newTile.htmlElement.addEventListener('pointerdown', holdPiece)

          grabedObject.containingPiece = 'none'
          grabedObject.player = 'none'
          grabedObject.possibleMoves = []
          grabedObject.alreadyPlayed = true
          grabedObject.htmlElement.removeEventListener('pointerdown', holdPiece)
          grabedObject.htmlElement.getElementsByClassName('piece')[0].remove()

          const tiles = document.getElementsByClassName('cell')
          for(let i = 0; i < tiles.length;i++){
            tiles[i].removeEventListener('pointerdown',newPieceTile)
          }
          if(playerOrder === 'white'){
            playerOrder = 'black'
            playerText.textContent = 'Preto'
            playerText.style.color = 'black'
          }else if(playerOrder === 'black'){
            playerOrder = 'white'
            playerText.textContent = 'Branco'
            playerText.style.color = 'white'
          }
          grabing = false
        }
      }
    }
  }
}

window.addEventListener('resize', setSizes)
function setSizes(){
  const cells = document.getElementsByClassName('cell')
  const hitboxes = document.getElementsByClassName('hitbox')
  const pieces = document.getElementsByClassName('piece')
  cellWidth = getComputedStyle(cells[0]).width
  cellHeight = getComputedStyle(cells[0]).height

  for(let i = 0; i < hitboxes.length; i++){
    hitboxes[i].style.width = cellWidth
    hitboxes[i].style.height = cellHeight
  }
  for(let i = 0; i < pieces.length; i++){
    pieces[i].style.width = (parseFloat(cellWidth)*0.9) + 'px'
  }
}






// function grab(e){
//   if(!grabing){
//     console.log('grab')
//     const piece = this.getElementsByClassName('piece')[0]
//           piece.style.top = '0px'
//           piece.style.left = '0px'
//           piece.style.margin = '0px'
//     grabedObject = new pieceGrabed(piece)
//     this.style.position = "static"
//     window.addEventListener('pointermove', grabedMovement)
//     grabing = true
//   }
//   else if(grabing){
//     console.log('ungrab')
//     grabedObject.htmlElement.parentElement.style.position = "relative"
//     grabedObject.htmlElement.parentElement.style.position = "static"
//     grabing = false
//     window.removeEventListener('pointermove', grabedMovement)
//   }
// }
// function grabedMovement(e){
//   if(grabing){
//     let x = e.clientX
//     let y = e.clientY
//     let piece = grabedObject.htmlElement
//     let width = parseFloat(getComputedStyle(piece).width)
//     let height = parseFloat(getComputedStyle(piece).height)
//     piece.style.left = (x-width/2) + 'px'
//     piece.style.top = (y-height/2) + 'px'
//   }
// }
// function enterTile(){
//   if(grabing){
//     let path = this.parentElement.dataset.object
//     let object = boardMap[path[0]][path[2]]
//     object.htmlElement.classList.add('selected')
//   }
// }
// function leaveTile(){
//   if(grabing){
//     let path = this.parentElement.dataset.object
//     let object = boardMap[path[0]][path[2]]
//     let color = object.color
//     object.htmlElement.classList.remove('selected')
//   }
// }