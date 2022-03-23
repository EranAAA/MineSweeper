'use strict'

const FLAG = '🚩'
const EXPLODE = '💥'
const MINE = '💣'
const FLAG_ON_MINE = '🏴'
const WINDOW = ''

var gTimer

function cellClicked(evBtn, elCell, i, j) {
    if (!gGame.isOn) return

    if (!gGame.shownCount) {
        placeTheMines(gLevel.mine, i, j)
        setMinesNegsCount(gBoard)
        printBoard(gBoard)
    }
    if (gGame.isHint) return hintShow(i, j)
    if (gBoard[i][j].isShown && gBoard[i][j].isMine) return

    if (!gBoard[i][j].isShown) gGame.shownCount++

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
        // Update Model
        gBoard[i][j].isShown = true
        // Update DOM
        renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount, 'showCell')

    } else if (gBoard[i][j].minesAroundCount === 0) {
        // Update Model
        gBoard[i][j].isShown = true
        // Update DOM
        renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount, 'showCell')

        showCellsAround(i, j)
    }
    console.log(gGame);
    if (checkGameOver()) {
        gGame.isOn = false
        console.log('WINNER');
    }
}

function cellMarked(elCell, i, j) {

    if (elCell.innerText === WINDOW) {
        gBoard[i][j].isMarked = true
        renderCell({ i: i, j: j }, FLAG, 'hideCell')
        gGame.markedCount++
    }
    else {
        gBoard[i][j].isMarked = false
        renderCell({ i: i, j: j }, WINDOW, 'hideCell')
        gGame.markedCount--
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
    for (const pos of positions) {
        if (gBoard[pos.i][pos.j].isMarked || gBoard[pos.i][pos.j].isShown) continue
        gGame.shownCount++
        // Update Model
        gBoard[pos.i][pos.j].isShown = true
        // Update DOM
        renderCell({ i: pos.i, j: pos.j }, gBoard[pos.i][pos.j].minesAroundCount, 'showCell')
    }
}

function keepLiving(i, j) {
    gGame.lives--
    // Update Model
    gBoard[i][j].isShown = true
    // Update DOM
    renderCell({ i: i, j: j }, MINE, 'showCell')
    elLivesCounter.innerText = 'Lives: ' + gGame.lives
}

function hint() {
    if (gGame.isHint) return
    gGame.isHint = true
    gGame.hints--
    elHintsCounter.innerText = 'Hints: ' + gGame.hints
    elButtonHint.style.background = 'yellow'
}

function hintShow(i, j) {
    var hintCells = getNeighbors(gBoard, i, j)

    for (const cell of hintCells) {
        if (gBoard[cell.i][cell.j].isShown) {
            continue
        } else if (gBoard[cell.i][cell.j].isMine) {
            renderCell({ i: cell.i, j: cell.j }, MINE, 'showCell')
        } else {
            renderCell({ i: cell.i, j: cell.j }, gBoard[cell.i][cell.j].minesAroundCount, 'showCell')
        }
    }

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
        elButtonHint.style.background = ''

        //debugger

        gGame.isHint = false
    }, 1000);


}

function checkGameOver() {
    if (gGame.shownCount === gLevel.size ** 2 && gGame.markedCount === gLevel.mine) {
        elButton.innerText = WIN
        return true
    } else if (gGame.shownCount === gLevel.size ** 2 && gGame.lives < LIVES) {
        elButton.innerText = WIN
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
    elButton.innerText = SAD
}

