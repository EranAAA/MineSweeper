'use strict'

const LIVES = 3
const HINTS = 3
const SAFE_CHECK = 3

const NORMAL = '🙂'
const SAD = '🤯'
const WIN = '😎'

var gAllPositions = [] // For placing mines
var gCurrnetLevel = 'Hard' //Default

// Global Selectors Elements
var gElFlagCounter = document.querySelector('.flagCounter')
var gElLivesCounter = document.querySelector('.livesCounter')
var gElHintsCounter = document.querySelector('.hintCounter')
var gElSafeCounter = document.querySelector('.safeCounter')
var gElScoreRecord = document.querySelector('.bestScore')
var gElGameMode = document.querySelector('.gameMode')

// Global Button Elements
var gElButton = document.querySelector('.restartBtn')
var gElButtonHint = document.querySelector('.hintsBtn')
var gElButtonSafeCheck = document.querySelector('.safeCheckBtn')
var gElButtonUndo = document.querySelector('.undoBtn')
var gElButtonManually = document.querySelector('.manuallyBtn')
var gElTime = document.querySelector('.timer')

// For handle the Undo Button
var gUndo = []
var gUndoProperties = []

// For handle the Timer Button
var gTime;
var gTimeInterval;

// For Manually Mine
var gIsOnManully = false
var gCounterManualMine = 0
var gCellsPicked = []

// For 7BOOM! button
var gIsOn7Boom = false


// Main global Vars
var gBoard;
var gLevel = {
    size: 8,
    mine: 12
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: LIVES,
    hints: HINTS,
    isHint: false,
    safeCheck: SAFE_CHECK,
}

function init() {

    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.lives = LIVES
    gGame.hints = HINTS
    gGame.isHint = false
    gGame.safeCheck = SAFE_CHECK

    // init Manually
    gCounterManualMine = 0
    gIsOnManully = false
    gElButtonManually.style.background = ''

    // init the array that return all the position in pone array.
    gAllPositions = []

    // inint all Elements
    gElButton.innerText = NORMAL
    gElFlagCounter.innerText = 'Flag: ' + gLevel.mine
    gElLivesCounter.innerText = 'Lives: ' + gGame.lives
    gElHintsCounter.innerText = 'Hints: ' + gGame.hints
    gElSafeCounter.innerText = 'Safe: ' + gGame.safeCheck
    gElScoreRecord.innerText = '// Best: ' + setBest()
    gElButtonHint.style.background = ''
    gElTime.innerText = 'Time: 0.00'
    //gElGameMode.innerText = 'Game Mode: Regular'

    // Build the main board and render to HTML
    gBoard = buildBoard(gLevel);
    renderBoard(gBoard, '.board-container');

    // Clear all intervals
    clearAllInterval()
}

// in the game every change level we change the gLevel and run init()
function changeBoard(size, mine, level) {
    gCurrnetLevel = level
    gLevel.size = size
    gLevel.mine = mine
    init();
}

// return the init cell in the board as an Object
function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
}

// Bulid the matrix by the level parameter.
function buildBoard(level) {
    var board = []
    for (var i = 0; i < level.size; i++) {
        board[i] = []
        for (var j = 0; j < level.size; j++) {
            board[i].push(createCell())
            gAllPositions.push({ i: i, j: j })
        }
    }
    return board
}

// rendering the Board to the page.
function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            // var cell = mat[i][j].isMine ? '*' : mat[i][j].minesAroundCount;
            var cell = ''
            var className = 'cell cell-' + i + '-' + j;
            var clicked = `onmouseup="cellClicked(event.button, this, ${i}, ${j})"`
            strHTML += '<td class="' + className + '"' + clicked + ' ' + ' > ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

// render the cell for Each change while playing.. manually managed the css classes
function renderCell(location, value, classAdded) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerText = value;
    elCell.classList.remove('showCell', 'hideCell', 'markCell', 'manuallyMarkedMine')
    if (classAdded) elCell.classList.add(classAdded)
}

// function the place the Mines.. init after firest press.
function placeTheMines(level, rowIgn, colIgn) {

    for (let i = 0; i < level; i++) {
        var randomNum = getRandomInt(0, gAllPositions.length)
        var ranPos = gAllPositions[randomNum]
        // ignore the cell that pressed. not clear if its was needed to be include
        if (ranPos.i === rowIgn && ranPos.j === colIgn) { i--; continue }
        // Update Model
        gBoard[ranPos.i][ranPos.j].isMine = true
        // update Array
        gAllPositions.splice(randomNum, 1)
    }
}

function onClickManuMined(elBtn) {

    if (gGame.shownCount > 0) return

    gElGameMode.innerText = 'PLACE THE MINES AND CLICKED AGAIN WHEN FINISH'

    gGame.isOn = false
    gIsOnManully = true

    elBtn.style.background = 'yellow'

    if (gCounterManualMine === gLevel.mine) {
        gGame.isOn = true
        elBtn.style.background = ''
        for (const pos of gCellsPicked) {
            renderCell({ i: pos.i, j: pos.j }, WINDOW, 'hideCell')
        }
        gElGameMode.innerText = 'Game Mode: Place Mine Manually'
    }
}

function ManuallyPosdMines(elCell, i, j) {

    if (gGame.isOn) return
    if (gCounterManualMine >= gLevel.mine) return gIsOnManully = false

    // Update Model
    gBoard[i][j].isMine = true
    // Update DOM
    renderCell({ i: i, j: j }, WINDOW, 'manuallyMarkedMine')
    // Update Array
    gCellsPicked.push({ i: i, j: j })

    gCounterManualMine++
}

function onClickSevenBoom(elBtn) {

    //if (gGame.shownCount > 0) return

    gElGameMode.innerText = 'Game Mode: 7Boom!'

    elBtn.style.background = 'yellow'
    gIsOn7Boom = true
    init()

    for (var i = 0; i < gAllPositions.length; i++) {
        var pos = gAllPositions[i]
        if (i === 0) continue
        if (String(i).includes('7') || ((i % 7) === 0)) {
            // Update Model
            gBoard[pos.i][pos.j].isMine = true
            // Update DOM
        }
    }
    if (gIsOn7Boom) {
        //gIsOn7Boom = false
        setTimeout(() => {
            elBtn.style.background = ''
        }, 500);
        return
    }
}

// function that count the mines around.. init after firest press.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = CountNeighbors(board, i, j)
        }
    }
}

// in game display how many flag left Zero mines
function displayFlagCount() {
    gElFlagCounter.innerText = 'Flag: ' + (gLevel.mine - gGame.markedCount)
}

// in game display Time running every few milisecond
function displayTimer() {
    // Stop timer when game end
    if (!gGame.isOn) { clearInterval(gTimeInterval); return }

    var start = gGame.secsPassed;
    var currTime = ((Date.now() - start)) / 1000

    // Update DOM
    gElTime.innerHTML = 'Time: ' + currTime.toFixed(2);
    // Update Global
    gTime = currTime.toFixed(2);
}

function clearAllInterval() {
    // Get a reference to the last interval + 1
    const interval_id = window.setInterval(function () { }, Number.MAX_SAFE_INTEGER);
    // Clear any timeout/interval up to that id
    for (let i = 1; i < interval_id; i++) {
        window.clearInterval(i);
    }
}

// in game display the best score for each level
function setBest() {
    var elLevelSelected = document.querySelectorAll('input')
    for (var i = 0; i < elLevelSelected.length; i++) {
        if (elLevelSelected[i].id === gCurrnetLevel) {
            if (localStorage.getItem(gCurrnetLevel) === 'Infinity') {
                return 0
            } else {
                return localStorage.getItem(gCurrnetLevel);
            }
        }
    }
}

function onClickGameMode() {
    gElGameMode.innerText = 'Game Mode: Regular'
    gIsOn7Boom = false

}