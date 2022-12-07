const styleSheet = document.styleSheets[0]
const board = document.getElementsByClassName('board')[0]
const playerTexts = document.getElementsByTagName('h2')
const pieces = document.getElementsByClassName('piece')
const backGroundImage = document.getElementsByClassName('backgroundImg')[0]
let tileColor = 'white'
let lineStart = 'white'
let boardMap = []
let grabing = false
let grabedTile
let grabedPiece
let playerOrder
let playerOpposite
let alreadyStarted = false

const movingPieceAudio = new Audio('audio/movePieceCroped.wav')
console.log(movingPieceAudio)

class tile{
  constructor(element){
    this.htmlElement = element 
    this.row = parseInt(element.dataset.object[0])
    this.cell = parseInt(element.dataset.object[1])
    this.tileColor = element.classList[1]
    this.containingPiece = 'none'
  }
}
class piece{
  constructor(row,cell,piece,player,element){
    this.htmlElement = element
    this.position = [row,cell]
    this.piece = piece
    this.player = player
    this.alreadyPlayed = false
    this.possibleMoves = []
    this.possibleMovesCondition = []
  }
  checkPossibleMoves(){
    console.log('checando possibilidades...')
    const player = this.player
    const row = parseInt(this.position[0])
    const cell = parseInt(this.position[1])
    const alreadyPlayed = this.alreadyPlayed
    const piece = this.piece
    let object
    let colorDiference
    if(player === 'white'){
      colorDiference = -1
    }
    else if(player === 'black'){
      colorDiference = 1
    }

    switch(piece){
    case 'pawn':
      passMove(row+(1*colorDiference),cell,'normal')
      passMove(row+(2*colorDiference),cell,'neverPlayed')
      passMove(row+(1*colorDiference),cell-1,'attack')
      passMove(row+(1*colorDiference),cell+1,'attack')
    break
    case 'rook':
        checkMoveWithCollision(row,cell,1,0)//up
        checkMoveWithCollision(row,cell,0,1)//right
        checkMoveWithCollision(row,cell,-1,0)//down
        checkMoveWithCollision(row,cell,0,-1)//left
    break
    case 'knight':
        passMove(row+2,cell+1,'normal')
        passMove(row+2,cell-1,'normal')
        passMove(row-2,cell+1,'normal')
        passMove(row-2,cell-1,'normal')

        passMove(row+1,cell+2,'normal')
        passMove(row+1,cell-2,'normal')
        passMove(row-1,cell+2,'normal')
        passMove(row-1,cell-2,'normal') 
    break
    case 'bishop':
        checkMoveWithCollision(row,cell,1,-1)//topLeft
        checkMoveWithCollision(row,cell,1,1)//topRight
        checkMoveWithCollision(row,cell,-1,-1)//bottomLeft
        checkMoveWithCollision(row,cell,-1,+1)//bottomRight
    break
    case 'king':
      passMove(row+1,cell,'normal')//top
      passMove(row-1,cell,'normal')//bottom
      passMove(row,cell-1,'normal')//left
      passMove(row,cell+1,'normal')//right
      passMove(row+1,cell-1,'normal')//topLeft
      passMove(row+1,cell+1,'normal')//topRight
      passMove(row-1,cell-1,'normal')//bottomLeft
      passMove(row-1,cell+1,'normal')//bottomRight
    break
    case 'queen':
        checkMoveWithCollision(row,cell,1,0)//top
        checkMoveWithCollision(row,cell,0,1)//right
        checkMoveWithCollision(row,cell,-1,0)//bottom
        checkMoveWithCollision(row,cell,0,-1)//left
        checkMoveWithCollision(row,cell,1,-1)//topLeft
        checkMoveWithCollision(row,cell,1,1)//topRight
        checkMoveWithCollision(row,cell,-1,-1)//bottomLeft
        checkMoveWithCollision(row,cell,-1,+1)//bottomRight
    }
  }
}
function isUndefined(row,cell){
  if(row > 7 || row < 0 || cell > 7 || cell < 0){
    return true
  }
  else{
    return false
  }
}
function checkMoveWithCollision(initialRow,initialCell,rowIncrement,cellIncrement){
  let row = initialRow + rowIncrement
  let cell = initialCell + cellIncrement
  for(let i = 0; i < 9; i++){
    console.log(i)
    if(isUndefined(row,cell)){
      console.log(undefined)
      return
    }
    const object = boardMap[row][cell]
    if(object.containingPiece.player === playerOrder){
      console.log('amigo')
      break
    }
    else if(object.containingPiece.player === playerOpposite){
      console.log('inimigo')
      grabedPiece.possibleMoves.push(object)
      grabedPiece.possibleMovesCondition.push('collision')
      break
    }
    grabedPiece.possibleMoves.push(object)
    grabedPiece.possibleMovesCondition.push('collision')
    row += rowIncrement
    cell += cellIncrement
    console.log('nada')
    console.log(row +' '+cell)
  }
  console.log(grabedPiece.possibleMoves)
}
function passMove(row,cell,condition){
  if(isUndefined(row,cell)){
    return
  }
  const newTile = boardMap[row][cell]
  if(condition === 'attack'){
    if(newTile.containingPiece.player !== playerOpposite){
      return
    }
  }
  else if(condition === 'neverPlayed'){
    if(grabedPiece.alreadyPlayed === true){
      return
    }
  }
  else if(condition === 'normal'){
    if(newTile.containingPiece.player === playerOrder){
      return
    }
  }
  else if(condition === 'collision'){
    return
  }
  grabedPiece.possibleMoves.push(newTile)
  grabedPiece.possibleMovesCondition.push(condition)
}
window.addEventListener('load',createBoard)
function createBoard(){
  for(let r = 1; r <= 8; r++){
    let rowEl = document.createElement('div')
        rowEl.classList.add('row')
    board.appendChild(rowEl)
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
function createPiece(row,cell,pieceType,color){
  const el = document.createElement('img')
        el.classList.add('piece',pieceType)
        el.setAttribute('src', `images/${color+capitalize(pieceType)}.png`)
        el.setAttribute('draggable', false)

  const pieceObject = new piece(row,cell,pieceType,color,el)        
  const tileObject = boardMap[row][cell]
  tileObject.htmlElement.appendChild(el)
  tileObject.htmlElement.addEventListener('pointerdown', holdPiece)
  tileObject.containingPiece = pieceObject
  return el
}
function capitalize(string){
  return string[0].toUpperCase() + string.slice(1)
}
function holdPiece(e,optionalElement){
  console.log('a')
  newElement = this
  if(optionalElement !== undefined){
    newElement = optionalElement
  }
  const path = newElement.dataset.object
  const newTile =  boardMap[path[0]][path[1]]
  console.log(newTile)
  if(!grabing || newTile.containingPiece.player === grabedPiece.player){
    console.log('pegou')
    grabedTile = boardMap[path[0]][path[1]]
    grabedPiece = boardMap[path[0]][path[1]].containingPiece
    if(grabedPiece.player === playerOrder){
      grabedPiece.checkPossibleMoves()
      const tiles = document.getElementsByClassName('cell')
      for(let i = 0; i < tiles.length;i++){
        tiles[i].addEventListener('pointerdown',newPieceTile)
        tiles[i].removeEventListener('pointerdown', holdPiece)
      }
      grabing = true 
    }
  }
}
function newPieceTile(){
  if(grabing){
    const newPath = this.dataset.object
    const newTile = boardMap[newPath[0]][newPath[1]]
    console.log('hi')
    if(newTile.containingPiece.player !== grabedPiece.player){
      for(let i = 0; i < grabedPiece.possibleMoves.length; i++){
        console.log(grabedPiece.possibleMoves)
        if(JSON.stringify(newTile) === JSON.stringify(grabedPiece.possibleMoves[i])){
          const condition = grabedPiece.possibleMovesCondition[i]
          if(condition === 'attack' && newTile.containingPiece.player === playerOpposite){
            movePiece(newPath,newTile)
          }
          else if(condition === 'neverPlayed' && grabedPiece.alreadyPlayed === false){
            movePiece(newPath,newTile)
          }
          else if(condition === 'normal' || condition === 'collision'){
            movePiece(newPath,newTile)
          }
          else{
            return
          }
        }
      }
    }
    else if(newTile.containingPiece.player === grabedPiece.player){
      console.log('same?')
      grabedPiece.possibleMoves = []
      grabedPiece.possibleMovesCondition = []
      holdPiece('none',newTile.htmlElement)
    }
  }
}
function movePiece(newPath,newTile){
  newTile.containingPiece.htmlElement?.remove()
  const newPieceElement = createPiece(newPath[0],newPath[1],grabedPiece.piece,grabedPiece.player)
  setSizes()
  grabedPiece.position = [newPath[0],newPath[1]]
  grabedPiece.alreadyPlayed = true
  grabedPiece.possibleMoves = []
  grabedPiece.possibleMovesCondition = []
  grabedPiece.htmlElement.remove()
  grabedPiece.htmlElement = newPieceElement

  grabedTile.htmlElement.removeEventListener('pointerdown', holdPiece)
  grabedTile.containingPiece = 'none'
  console.log(newTile)
  newTile.htmlElement.addEventListener('pointerdown', holdPiece)
  newTile.containingPiece = grabedPiece
  console.log(newTile.containingPiece)

  movingPieceAudio.currentTime = 0
  movingPieceAudio.play()

  const tiles = document.getElementsByClassName('cell')
  for(let i = 0; i < tiles.length;i++){
    tiles[i].removeEventListener('pointerdown',newPieceTile)
    tiles[i].addEventListener('pointerdown', holdPiece)
  }
  if(playerOrder === 'white'){
    playerOrder = 'black'
    playerOpposite = 'white'
  }else if(playerOrder === 'black'){
    playerOrder = 'white'
    playerOpposite = 'black'
  }
  grabing = false
}
window.addEventListener('resize', setSizes)
function setSizes(){
  const cells = document.getElementsByClassName('cell')
  const pieces = document.getElementsByClassName('piece')
  const cellWidth = getComputedStyle(cells[0]).width
  const cellHeight = getComputedStyle(cells[0]).height

  for(let i = 0; i < pieces.length; i++){
    pieces[i].style.width = (parseFloat(cellWidth)*0.9) + 'px'
  }
}
function selectFirstPlayer(button){
  let color = button.value

  if(color === 'Por Sorte'){
    const num = Math.floor(Math.random()*2)
    num === 0 ? color = 'white' : false
    num === 1 ? color = 'black' : false
    button.value = color
  }
  rotateBoard(color)
}
function rotateBoard(color){
  if(alreadyStarted){
    return
  }
  let degrees
  if(color === 'white'){
    playerTexts[0].classList.remove('whiteH2')
    playerTexts[0].classList.add('blackH2')
    playerTexts[1].classList.remove('blackH2')
    playerTexts[1].classList.add('whiteH2')
    degrees = 'rotate(0deg)'
    backGroundImage.setAttribute('src','images/board.png')
  }else if(color === 'black'){
    playerTexts[0].classList.remove('blackH2')
    playerTexts[0].classList.add('whiteH2')
    playerTexts[1].classList.remove('whiteH2')
    playerTexts[1].classList.add('blackH2')
    degrees = 'rotate(180deg)'
    backGroundImage.setAttribute('src','images/boardInversed.png')
  }
  board.style.transform = degrees

  let elementProperties
  for(let i = 0; i < styleSheet.cssRules.length; i++) {
    if(styleSheet.cssRules[i].selectorText === '.piece') {
      elementProperties = styleSheet.cssRules[i];
    } 
  }
  elementProperties.style.setProperty('transform', degrees);

}
function startGame(){
  if(alreadyStarted){
    return
  }
  const button = document.getElementsByClassName('playerSelect')[0]
  if(button.value === 'black'){
    playerOrder = 'black'
    playerOpposite = 'white'
  }else if(button.value === 'white'){
    playerOrder = 'white'
    playerOpposite = 'black'
  }
  rotateBoard(playerOrder)
  alreadyStarted = true
}




// function grab(e){
//   if(!grabing){
//     console.log('grab')
//     const piece = this.getElementsByClassName('piece')[0]
//           piece.style.top = '0px'
//           piece.style.left = '0px'
//           piece.style.margin = '0px'
//     grabedPiece = new pieceGrabed(piece)
//     this.style.position = "static"
//     window.addEventListener('pointermove', grabedMovement)
//     grabing = true
//   }
//   else if(grabing){
//     console.log('ungrab')
//     grabedPiece.htmlElement.parentElement.style.position = "relative"
//     grabedPiece.htmlElement.parentElement.style.position = "static"
//     grabing = false
//     window.removeEventListener('pointermove', grabedMovement)
//   }
// }
// function grabedMovement(e){
//   if(grabing){
//     let x = e.clientX
//     let y = e.clientY
//     let piece = grabedPiece.htmlElement
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
