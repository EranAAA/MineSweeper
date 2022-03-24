'use strict'

const FLAG = '🚩'
const EXPLODE = '💥'
const MINE = '💣'
const FLAG_ON_MINE = '🏴'
const WINDOW = ''

var gTimer
var gInitBoard = []
var gCounterForUndo = 0

function cellClicked(evBtn, elCell, i, j) {
    //debugger
    if (!gGame.isOn) return
    if (gGame.shownCount === 0 && evBtn === 2) return

    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        placeTheMines(gLevel.mine, i, j)
        setMinesNegsCount(gBoard)
        undoRecord()
        gInitBoard = CopyMat(gBoard)
        printBoard(gBoard)
    }

    // if (!gBoard[i][j].isShown & !gGame.isHint) gGame.shownCount++

    if (gGame.isHint) return hintShow(i, j)

    if (gBoard[i][j].isShown && gBoard[i][j].isMine) return
    if (gBoard[i][j].isShown && gBoard[i][j].minesAroundCount > 0) return

    gGame.secsPassed = (gGame.secsPassed) ? gGame.secsPassed : Date.now()
    gTimeInterval = setInterval(() => displayTimer(), 200);

    if (evBtn === 2) return cellMarked(elCell, i, j)
    if (elCell.innerText === FLAG) { gGame.shownCount--; return }

    if (gBoard[i][j].isMine) {
        if (gGame.lives) return keepLiving(i, j)
        // Update Model
        gBoard[i][j].isShown = true
        // Update DOM
        renderCell({ i: i, j: j }, EXPLODE, 'showCell')

        showAllMines(i, j)
        return gameOver()

    } else if (gBoard[i][j].minesAroundCount > 0) {
        gGame.shownCount++
        // Update Model
        gBoard[i][j].isShown = true
        // Update DOM
        renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount, 'showCell')
        undoRecord()
        if (checkGameOver()) {
            gGame.isOn = false
            console.log('WINNER');
        }

    } else if (gBoard[i][j].minesAroundCount === 0) {
        showCellsAround(i, j)
    }

    console.log(gGame);

}

function cellMarked(elCell, i, j) {

    if (elCell.innerText === WINDOW) {
        gBoard[i][j].isMarked = true
        renderCell({ i: i, j: j }, FLAG, 'hideCell')
        gGame.markedCount++
        undoRecord()
    }
    else {
        gBoard[i][j].isMarked = false
        renderCell({ i: i, j: j }, WINDOW, 'hideCell')
        gGame.markedCount--
        undoRecord()
    }

    displayFlagCount()

    if (checkGameOver()) {
        gGame.isOn = false
        console.log('WINNER');
    }
}

function showAllMines(row, col) {
    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (i === row && j === col) continue
            if (gBoard[i][j].isMarked) {
                gGame.shownCount++

                // Update Model
                gBoard[i][j].isShown = true
                // Update DOM
                renderCell({ i: i, j: j }, FLAG_ON_MINE, 'showCell')
            } else if (gBoard[i][j].isMine) {
                gGame.shownCount++

                // Update Model
                gBoard[i][j].isShown = true
                // Update DOM
                renderCell({ i: i, j: j }, MINE, 'showCell')
            }
        }
    }
}

function showCellsAround(i, j) {
    var positions = getNeighbors(gBoard, i, j)
    positions.unshift({ i: i, j: j })

    for (const pos of positions) {
        if (gBoard[pos.i][pos.j].isShown) continue
        if (gBoard[pos.i][pos.j].isMarked) continue
        gGame.shownCount++
        // Update Model
        gBoard[pos.i][pos.j].isShown = true
        // Update DOM
        renderCell({ i: pos.i, j: pos.j }, gBoard[pos.i][pos.j].minesAroundCount, 'showCell')
    }

    undoRecord()

    // debugger
    // var copyPosition = positions.slice()
    // for (let k = 0; k < copyPosition.length; k++) {
    //     var pos = copyPosition[k]
    //     if (gBoard[pos.i][pos.j].minesAroundCount !== 0 || (pos.i === i && pos.j === j)) {
    //         for (let m = 0; m < positions.length; m++) {
    //             if (pos.i === positions[m].i && pos.j === positions[m].j) positions.splice(m, 1)
    //         }
    //     }
    // }
    //Recursion
    // for (const pos of positions) {
    //     showCellsAround(pos.i, pos.j)
    // }

    if (checkGameOver()) {
        gGame.isOn = false
        console.log('WINNER');
    }
}

function keepLiving(i, j) {
    gGame.lives--
    gGame.shownCount++
    // Update Model
    gBoard[i][j].isShown = true
    // Update DOM
    renderCell({ i: i, j: j }, MINE, 'showCell')
    gElLivesCounter.innerText = 'Lives: ' + gGame.lives
    undoRecord()
    if (checkGameOver()) {
        gGame.isOn = false
        console.log('WINNER');
    }
}

function hint() {
    if (gGame.isHint) return
    if (!gGame.shownCount) return
    if (!gGame.hints) return
    gGame.isHint = true
    gGame.hints--
    gElHintsCounter.innerText = 'Hints: ' + gGame.hints
    gElButtonHint.style.background = 'yellow'
}

function hintShow(i, j) {
    var hintCells = getNeighbors(gBoard, i, j)
    //debugger
    for (const cell of hintCells) {
        if (gBoard[cell.i][cell.j].isShown) {
            continue
        } else if (gBoard[cell.i][cell.j].isMine) {
            renderCell({ i: cell.i, j: cell.j }, MINE, 'showCell')
        } else {
            renderCell({ i: cell.i, j: cell.j }, gBoard[cell.i][cell.j].minesAroundCount, 'showCell')
        }
    }
    //debugger
    setTimeout(() => {
        for (const cell of hintCells) {
            if (gBoard[cell.i][cell.j].isShown) {
                continue
            } else if (gBoard[cell.i][cell.j].isMine) {
                renderCell({ i: cell.i, j: cell.j }, WINDOW, 'hideCell')
            } else {
                renderCell({ i: cell.i, j: cell.j }, WINDOW, 'hideCell')
            }
        }
        gElButtonHint.style.background = ''
        gGame.isHint = false
    }, 1000);

}

function safeCheck() {
    if (!gGame.safeCheck) return
    gGame.safeCheck--
    gElSafeCounter.innerText = 'Safe: ' + gGame.safeCheck
    //debugger
    var emptyCells = getEmptyCellsBoard(gBoard)
    var randomNum = getRandomInt(0, emptyCells.length)
    var randomCell = emptyCells[randomNum]
    renderCell({ i: randomCell.i, j: randomCell.j }, WINDOW, 'markCell')

    setTimeout(() => {
        renderCell({ i: randomCell.i, j: randomCell.j }, WINDOW, 'hideCell')
    }, 100);

}

function checkGameOver() {
    if (gGame.shownCount === (gLevel.size ** 2 - gLevel.mine) && gGame.markedCount === gLevel.mine) {
        gElButton.innerText = WIN
        recordBestScore()
        return true
    } else if (gGame.shownCount === gLevel.size ** 2 && gGame.lives < LIVES) {
        gElButton.innerText = WIN
        recordBestScore()
        return true
    } else if ((gGame.shownCount + gGame.markedCount) === gLevel.size ** 2) {
        gElButton.innerText = WIN
        recordBestScore()
        return true
    }
    console.log('gGame.shownCount ', gGame.shownCount);
    console.log('gLevel.size ** 2 ', gLevel.size ** 2);
    console.log('gGame.markedCount ', gGame.markedCount);
    console.log('gLevel.mine', gLevel.mine);
    console.log('gGame.lives ', gGame.lives);
    console.log('LIVES', LIVES);
}

function gameOver() {
    gGame.isOn = false
    gElButton.innerText = SAD
}

function recordBestScore() {
    var elLevelSelected = document.querySelectorAll('input')

    if (!localStorage['Easy']) localStorage.setItem("Easy", Infinity)
    if (!localStorage['Hard']) localStorage.setItem("Hard", Infinity)
    if (!localStorage['Extream']) localStorage.setItem("Extream", Infinity)

    for (var i = 0; i < elLevelSelected.length; i++) {
        if (elLevelSelected[i].id === gCurrnetLevel) {
            var lastBestScore = +localStorage.getItem(gCurrnetLevel);
            if (+gTime < lastBestScore) localStorage.setItem(gCurrnetLevel, +gTime);
            return;
        }
    }
}

function undoRecord() {
    var copy = CopyMat(gBoard)
    gUndo.push(copy)

    gUndoProperties.push({
        shownCount: gGame.shownCount,
        markedCount: gGame.markedCount,
        secsPassed: gGame.secsPassed,
        lives: gGame.lives,
        hints: gGame.hints,
        isHint: gGame.isHint,
        safeCheck: gGame.safeCheck
    })

    if (gUndo.length !== 1) {
        gCounterForUndo++
        console.log('*******gCounterForUndo********', gCounterForUndo);
    }
}

function undo() {
    //debugger
    gUndo.splice(0, 1, gInitBoard)
    //debugger
    gUndoProperties[0].shownCount = 0
    gUndoProperties[0].markedCount = 0
    gUndoProperties[0].secsPassed = 0
    gUndoProperties[0].lives = LIVES
    gUndoProperties[0].hints = HINTS
    gUndoProperties[0].isHint = false
    gUndoProperties[0].safeCheck = SAFE_CHECK

    if (gCounterForUndo === 1) {
        renderBoardUndo(gInitBoard, '.board-container')
        gGame = gUndoProperties[0]
        gCounterForUndo--
        console.log('*******gCounterForUndo********', gCounterForUndo);

    } else if (gCounterForUndo === 0) {
        return
    } else {
        gBoard = gUndo[gUndo.length - 2]
        renderBoardUndo(gBoard, '.board-container');
        gGame = gUndoProperties[gUndo.length - 2]

        gCounterForUndo--
        console.log('*******gCounterForUndo********', gCounterForUndo);

        gUndo.splice(gUndo.length - 1, 1)
        gUndoProperties.splice(gUndo.length - 1, 1)

    }
}