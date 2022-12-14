const styleSheet = document.styleSheets[0]
const board = document.getElementsByClassName('board')[0]
const playerTexts = document.getElementsByTagName('h2')
const pieces = document.getElementsByClassName('piece')
const backGroundImage = document.getElementsByClassName('backgroundImg')[0]
const panel = document.getElementById('changePiecePannel')
let tileColor = 'white'
let lineStart = 'white'
let boardMap = []
let grabing = false
let grabedTile
let grabedPiece
let playerOrder
let playerOpposite
let alreadyStarted = false
let setTimeoutsId = []

const movingPieceAudio = new Audio('audio/movePieceCroped.wav')

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
      passMove(row+(1*colorDiference),cell,'mustBeFree')
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
    if(isUndefined(row,cell)){
      return
    }
    const object = boardMap[row][cell]
    if(object.containingPiece.player === playerOrder){
      break
    }
    else if(object.containingPiece.player === playerOpposite){
      grabedPiece.possibleMoves.push(object)
      grabedPiece.possibleMovesCondition.push('collision')
      break
    }
    grabedPiece.possibleMoves.push(object)
    grabedPiece.possibleMovesCondition.push('collision')
    row += rowIncrement
    cell += cellIncrement
  }
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
  else if(condition === 'mustBeFree'){
    if(newTile.containingPiece !== 'none'){
      return
    }
  }
  else if(condition === 'collision'){
    return
  }
  grabedPiece.possibleMoves.push(newTile)
  grabedPiece.possibleMovesCondition.push(condition)
}
function checkForCheck(){
  
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
          switch(condition){
            case 'attack':
            case 'neverPlayed':
            case 'normal':
            case 'collision':
            case 'mustBeFree':
              if(grabedPiece.piece === 'pawn'){
                if(newTile.row === 0 || newTile.row === 7){
                  shownChangePawnPannel()
                }
              }
              movePiece(newPath,newTile)
            break
            default:
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
  changePlayerAnimation()
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
function startGame(playButton){
  if(alreadyStarted){
    playAgain()
    playButton.textContent = 'Jogar'
    return
  }
  const playerButton = document.getElementsByClassName('playerSelect')[0]
  if(playerButton.value === 'black'){
    playerOrder = 'black'
    playerOpposite = 'white'
  }else if(playerButton.value === 'white'){
    playerOrder = 'white'
    playerOpposite = 'black'
  }
  rotateBoard(playerOrder)
  changePlayerAnimation()
  playButton.textContent = 'Resetar'
  alreadyStarted = true
  initiateCountDown('white');
  initiateCountDown('black');
}
function changePlayerAnimation(){
  let activeText
  let inactiveText
  if(playerOrder === 'white'){
    activeText = document.getElementsByClassName('whiteH2')[0]
    inactiveText = document.getElementsByClassName('blackH2')[0]
  }else if(playerOrder === 'black'){
    activeText = document.getElementsByClassName('blackH2')[0]
    inactiveText = document.getElementsByClassName('whiteH2')[0]
  }
  inactiveText.style.animation = 'none'
  activeText.style.animation = 'changingPlayer 200ms 1 linear forwards'
}
function playAgain(){
  tileColor = 'white'
  lineStart = 'white'
  boardMap = []
  grabing = false
  grabedTile = null
  grabedPiece = null
  playerOrder = null
  playerOpposite = null
  alreadyStarted = false
  const rows = document.getElementsByClassName('row')
  const rowsMax = document.getElementsByClassName('row').length
  for(let i = 0; i < rowsMax;i++){
    rows[0].remove()
  }
  playerTexts[0].style.animation = 'none'
  playerTexts[0].setAttribute('data-after','')
  playerTexts[1].style.animation = 'none'
  playerTexts[1].setAttribute('data-after','')
  for(let i = 0; i < setTimeoutsId.length;i++){
    clearInterval(setTimeoutsId[i])
  }
  createBoard()
}
function shownChangePawnPannel(){
  panel.style.display = 'flex'
  const panelOptions = document.getElementsByClassName('changePieceOption')

  panelOptions[0].children[0].setAttribute('src',`images/${playerOrder}Queen.png`)
  panelOptions[1].children[0].setAttribute('src',`images/${playerOrder}Rook.png`)
  panelOptions[2].children[0].setAttribute('src',`images/${playerOrder}Bishop.png`)
  panelOptions[3].children[0].setAttribute('src',`images/${playerOrder}Knight.png`)
  for(let i = 0;i < panelOptions.length; i++){
    panelOptions[i].addEventListener('pointerdown',changePawn)    
  }
}
function changePawn(){
  grabedPiece.piece = this.dataset.type
  grabedPiece.htmlElement.setAttribute('src',this.children[0].src)
  grabedPiece.htmlElement.classList.add(this.dataset.type)
  grabedPiece.htmlElement.classList.remove('pawn')
  panel.style.display = 'none'
}
function initiateCountDown(player){
  const text = document.getElementsByClassName(`${player}H2`)[0]
  let time = document.getElementsByClassName('timeSelect')[0].value
  text.setAttribute('data-after', time) 
  if(time !== 'Infinito'){
    time = (parseFloat(time)*60)-1

    const interval = setInterval(function (){
      if(player === playerOrder){
        let minutes = parseInt(time / 60, 10);
        let seconds = parseInt(time % 60, 10);

        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds

        text.setAttribute('data-after',minutes + ':' + seconds)
        if(time > 0){
          time--
        }
        else if(time === 0){
          console.log('over')
          clearInterval(interval)
        }
      }
    }, 1000);
    setTimeoutsId.push(interval)
  } 
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