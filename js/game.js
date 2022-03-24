'use strict'

const LIVES = 3
const HINTS = 3
const SAFE_CHECK = 3

const NORMAL = '😜'
const SAD = '☢️'
const WIN = '😎'

var gBoard;
var gAllPositions = []
var gElFlagCounter = document.querySelector('.flagCounter')
var gElLivesCounter = document.querySelector('.livesCounter')
var gElHintsCounter = document.querySelector('.hintCounter')
var gElSafeCounter = document.querySelector('.safeCounter')
var gElScoreRecord = document.querySelector('.bestScore')

var gCurrnetLevel = 'Hard'

var gElButton = document.querySelector('.restartBtn')
var gElButtonHint = document.querySelector('.hintsBtn')
var gElButtonSafeCheck = document.querySelector('.safeCheckBtn')
var gElButtonUndo = document.querySelector('.undoBtn')

var gElTime = document.querySelector('.timer')

var gUndo = []
var gUndoProperties = []
var gTime;
var gTimeInterval;

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
    gAllPositions = []

    gElButton.innerText = NORMAL
    gElFlagCounter.innerText = 'Flag: ' + gLevel.mine
    gElLivesCounter.innerText = 'Lives: ' + gGame.lives
    gElHintsCounter.innerText = 'Hints: ' + gGame.hints
    gElSafeCounter.innerText = 'Safe: ' + gGame.safeCheck
    gElScoreRecord.innerText = '// Best: ' + setBest()
    gElButtonHint.style.background = ''
    gElTime.innerText = 'Time: 0.00'

    gUndoProperties[0] = gGame

    gBoard = buildBoard(gLevel);
    renderBoard(gBoard, '.board-container');
    clearAllInterval()
}

function changeBoard(size, mine, level) {
    gCurrnetLevel = level
    gLevel.size = size
    gLevel.mine = mine
    init();
}

function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
}

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

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            // var cell = mat[i][j].isMine ? '*' : mat[i][j].minesAroundCount;
            var cell = ''
            var className = 'cell cell-' + i + '-' + j;
            var dataSet = `data-i="${i}" data-j="${j}"`
            var clicked = `onmouseup="cellClicked(event.button, this, ${i}, ${j})"`
            strHTML += '<td class="' + className + '"' + clicked + ' ' /*+ dataSet*/ + ' > ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function renderCell(location, value, classAdded) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerText = value;
    elCell.classList.remove('showCell')
    elCell.classList.remove('hideCell')
    elCell.classList.remove('markCell')

    if (classAdded) elCell.classList.add(classAdded)
}

function placeTheMines(level, rowIgn, colIgn) {
    for (let i = 0; i < level; i++) {
        var randomNum = getRandomInt(0, gAllPositions.length)
        var randomPosition = gAllPositions[randomNum]
        if (randomPosition.i === rowIgn && randomPosition.j === colIgn) { i--; continue }
        gBoard[randomPosition.i][randomPosition.j].isMine = true
        gAllPositions.splice(randomNum, 1)
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = CountNeighbors(board, i, j)
        }
    }
}

function displayFlagCount() {
    gElFlagCounter.innerText = 'Flag: ' + (gLevel.mine - gGame.markedCount)
}

function displayTimer() {
    if (!gGame.isOn) { clearInterval(gTimeInterval); return }
    var start = gGame.secsPassed;
    var currTime = ((Date.now() - start)) / 1000
    gElTime.innerHTML = 'Time: ' + currTime.toFixed(2);
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

function setBest() {
    var elLevelSelected = document.querySelectorAll('input')

    //debugger
    for (var i = 0; i < elLevelSelected.length; i++) {
        if (elLevelSelected[i].id === gCurrnetLevel) {
            // debugger
            if (localStorage.getItem(gCurrnetLevel) === 'Infinity') {
                return 0
            } else {
                return localStorage.getItem(gCurrnetLevel);
            }
        }
    }
}