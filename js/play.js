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
    if (!gBoard[i][j].isShown) gGame.shownCount++

    gGame.secsPassed = (gGame.secsPassed) ? gGame.secsPassed : Date.now()
    gTimeInterval = setInterval(() => displayTimer(), 200);

    if (evBtn === 2) return cellMarked(elCell, i, j)
    if (elCell.innerText === FLAG) { gGame.shownCount--; return }

    if (gBoard[i][j].isMine) {
        // Update Model
        gBoard[i][j].isShown = true
        // Update DOM
        renderCell({ i: i, j: j }, EXPLODE, 'showCell')
        elCell.classList.add('showCell')

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

function checkGameOver() {
    var firstCondition = gGame.shownCount === gLevel.size ** 2
    var secondCondition = gGame.markedCount === gLevel.mine
    console.log('gGame.shownCount ', gGame.shownCount);
    console.log('gLevel.size ** 2 ', gLevel.size ** 2);
    console.log('gGame.markedCount ', gGame.markedCount);
    console.log('gLevel.mine', gLevel.mine);

    return firstCondition && secondCondition
}

function gameOver() {
    gGame.isOn = false
}

